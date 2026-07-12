const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const TransferRequest = require('../models/TransferRequest');
const AllocationRequest = require('../models/AllocationRequest');
const Department = require('../models/Department');
const { notify } = require('../utils/notify');
const { logActivity } = require('../utils/logActivity');

const hasExactlyOneRecipient = (employee, department) => Boolean(employee) !== Boolean(department);

// A Department Head's scope is "their own department" - we treat req.user.department
// (the department they belong to) as the department they head/manage. There's no
// separate "managed departments" concept in the data model beyond User.department +
// Department.head, so this is the simplest consistent interpretation.
const isSameId = (a, b) => Boolean(a) && Boolean(b) && String(a) === String(b);

// Works out which department currently "owns" an allocation - either the
// department it was allocated directly to, or the department of the employee
// holding it.
const resolveHolderDepartment = (allocation) => {
    if (allocation.department) return allocation.department._id || allocation.department;
    if (allocation.employee && allocation.employee.department) return allocation.employee.department;
    return null;
};

// @desc    Allocate an available asset to an employee or department
// @route   POST /api/allocations
// @access  Private (Admin & Asset Manager)
const createAllocation = async (req, res) => {
    try {
        const { assetId, employee, department, expectedReturnDate } = req.body;
        if (!assetId || !hasExactlyOneRecipient(employee, department)) {
            return res.status(400).json({ success: false, message: 'Provide an asset and exactly one allocation recipient.' });
        }

        const asset = await Asset.findOneAndUpdate(
            { _id: assetId, status: 'Available', isActive: true },
            { $set: { status: 'Allocated' } },
            { new: true }
        );

        if (!asset) {
            const existing = await Allocation.findOne({ asset: assetId, status: 'Active' });
            return res.status(409).json({
                success: false,
                message: existing ? 'This asset is currently allocated. Create a transfer request instead.' : 'This asset is not available for allocation.',
                activeAllocation: existing,
            });
        }

        try {
            const allocation = await Allocation.create({ asset: asset._id, employee, department, expectedReturnDate });

            if (employee) {
                await notify({
                    user: employee,
                    type: 'AssetAssigned',
                    message: `${asset.name} (${asset.assetTag}) has been assigned to you.`,
                    relatedEntity: allocation._id.toString(),
                });
            }
            await logActivity({
                user: req.user._id,
                action: `Allocated ${asset.assetTag} (${asset.name}) to ${employee ? 'an employee' : 'a department'}`,
                module: 'Allocation',
                metadata: { allocationId: allocation._id, assetId: asset._id },
            });

            return res.status(201).json({ success: true, message: 'Asset allocated successfully.', allocation, asset });
        } catch (error) {
            await Asset.findByIdAndUpdate(asset._id, { status: 'Available' });
            throw error;
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    List allocations (filterable). Visibility depends on the caller's role:
//          Admin/Asset Manager see everything; Department Head sees allocations
//          held within their department; Employee sees only their own holdings.
//          Pass ?mine=true to force "just my own" for any role.
// @route   GET /api/allocations
// @access  Private
const getAllocations = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.assetId) query.asset = req.query.assetId;

        const wantsMine = req.query.mine === 'true';
        const role = req.user.role;

        if (wantsMine || role === 'Employee') {
            query.employee = req.user._id;
            const allocations = await Allocation.find(query).sort({ createdAt: -1 });
            return res.json({ success: true, allocations });
        }

        if (role === 'Admin' || role === 'Asset Manager') {
            if (req.query.employee) query.employee = req.query.employee;
            if (req.query.department) query.department = req.query.department;
            const allocations = await Allocation.find(query).sort({ createdAt: -1 });
            return res.json({ success: true, allocations });
        }

        // Department Head: scope to allocations held within their department.
        const allocations = await Allocation.find(query)
            .populate({ path: 'employee', select: 'department' })
            .sort({ createdAt: -1 });
        const scoped = allocations.filter((allocation) => isSameId(resolveHolderDepartment(allocation), req.user.department));
        res.json({ success: true, allocations: scoped });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Directly mark an active allocation as returned (bypasses the
//          request/approve flow - manager authority only)
// @route   PATCH /api/allocations/:allocationId/return
// @access  Private (Admin & Asset Manager)
const returnAllocation = async (req, res) => {
    try {
        const allocation = await Allocation.findOneAndUpdate(
            { _id: req.params.allocationId, status: 'Active' },
            { $set: { status: 'Returned', returnedAt: new Date(), checkInNotes: req.body.checkInNotes } },
            { new: true }
        );
        if (!allocation) return res.status(404).json({ success: false, message: 'An active allocation was not found.' });

        const asset = await Asset.findByIdAndUpdate(allocation.asset, { status: 'Available' }, { new: true });
        res.json({ success: true, message: 'Asset marked as returned.', allocation, asset });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Request to return an allocated asset (needs manager/dept-head approval).
//          Employees may only request the return of their own allocation.
// @route   POST /api/allocations/:allocationId/return-request
// @access  Private
const requestReturn = async (req, res) => {
    try {
        if (req.user.role === 'Employee') {
            const owned = await Allocation.exists({ _id: req.params.allocationId, employee: req.user._id });
            if (!owned) return res.status(403).json({ success: false, message: 'You can only request a return for an asset allocated to you.' });
        }

        const allocation = await Allocation.findOneAndUpdate(
            { _id: req.params.allocationId, status: 'Active' },
            {
                $set: {
                    status: 'Return Requested',
                    returnRequestedAt: new Date(),
                    checkInNotes: req.body.checkInNotes,
                },
            },
            { new: true }
        );
        if (!allocation) return res.status(404).json({ success: false, message: 'An active allocation was not found.' });
        res.json({ success: true, message: 'Return request sent for approval.', allocation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Approve/reject a pending return request. Department Heads may only
//          review returns for their own department.
// @route   PATCH /api/allocations/:allocationId/return-review
// @access  Private (Admin, Asset Manager & Department Head)
const reviewReturnRequest = async (req, res) => {
    try {
        const { decision, reviewNotes } = req.body;
        if (!['Approved', 'Rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected.' });
        }
        const allocation = await Allocation.findOne({ _id: req.params.allocationId, status: 'Return Requested' })
            .populate({ path: 'employee', select: 'department' });
        if (!allocation) return res.status(404).json({ success: false, message: 'A pending return request was not found.' });

        if (req.user.role === 'Department Head' && !isSameId(resolveHolderDepartment(allocation), req.user.department)) {
            return res.status(403).json({ success: false, message: 'This return request is outside your department.' });
        }

        if (decision === 'Rejected') {
            allocation.status = 'Active';
            allocation.returnReviewNotes = reviewNotes;
            await allocation.save();

            if (allocation.employee) {
                await notify({
                    user: allocation.employee,
                    type: 'ReturnRejected',
                    message: 'Your return request was rejected. The asset remains allocated to you.',
                    relatedEntity: allocation._id.toString(),
                });
            }
            await logActivity({
                user: req.user._id,
                action: `Rejected return request for allocation ${allocation._id}`,
                module: 'Allocation',
                metadata: { allocationId: allocation._id },
            });

            return res.json({ success: true, message: 'Return request rejected.', allocation });
        }

        allocation.status = 'Returned';
        allocation.returnedAt = new Date();
        allocation.returnReviewNotes = reviewNotes;
        await allocation.save();
        const asset = await Asset.findByIdAndUpdate(allocation.asset, { status: 'Available' }, { new: true });

        if (allocation.employee) {
            await notify({
                user: allocation.employee,
                type: 'ReturnApproved',
                message: `Your return of ${asset?.name || 'the asset'} was approved.`,
                relatedEntity: allocation._id.toString(),
            });
        }
        await logActivity({
            user: req.user._id,
            action: `Approved return of ${asset?.name || allocation.asset}`,
            module: 'Allocation',
            metadata: { allocationId: allocation._id },
        });

        res.json({ success: true, message: 'Return approved and asset made available.', allocation, asset });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Request transfer of a currently allocated asset. Employees and
//          Department Heads may only request a transfer to themselves; Admins
//          and Asset Managers can direct a transfer to any employee/department
//          (and can file it on behalf of someone else via `requestedBy`).
// @route   POST /api/allocations/transfers
// @access  Private
const createTransferRequest = async (req, res) => {
    try {
        const { assetId } = req.body;
        let { requestedBy, toEmployee, toDepartment } = req.body;
        const { reason } = req.body;

        const isSelfServiceRole = req.user.role === 'Employee' || req.user.role === 'Department Head';
        if (isSelfServiceRole) {
            requestedBy = req.user._id;
            toEmployee = req.user._id;
            toDepartment = undefined;
        } else {
            requestedBy = requestedBy || req.user._id;
        }

        if (!assetId || !requestedBy || !hasExactlyOneRecipient(toEmployee, toDepartment)) {
            return res.status(400).json({ success: false, message: 'Provide an asset, requester, and exactly one transfer recipient.' });
        }

        const activeAllocation = await Allocation.findOne({ asset: assetId, status: 'Active' });
        if (!activeAllocation) return res.status(409).json({ success: false, message: 'Only an allocated asset can be transferred.' });

        if (isSelfServiceRole && isSameId(activeAllocation.employee, req.user._id)) {
            return res.status(400).json({ success: false, message: 'This asset is already allocated to you.' });
        }

        const transfer = await TransferRequest.create({
            asset: assetId,
            fromAllocation: activeAllocation._id,
            requestedBy,
            toEmployee,
            toDepartment,
            reason,
        });
        res.status(201).json({ success: true, message: 'Transfer request created.', transfer, activeAllocation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    List transfer requests. Visibility depends on the caller's role:
//          Admin/Asset Manager see everything; Department Head sees requests
//          where the asset is currently held within their department; Employee
//          sees only requests they submitted. Pass ?mine=true to force
//          "just my own submitted requests" for any role.
// @route   GET /api/allocations/transfers
// @access  Private
const getTransferRequests = async (req, res) => {
    try {
        const query = req.query.status ? { status: req.query.status } : {};
        const wantsMine = req.query.mine === 'true';
        const role = req.user.role;

        if (wantsMine || role === 'Employee') {
            query.requestedBy = req.user._id;
            const transfers = await TransferRequest.find(query).sort({ createdAt: -1 });
            return res.json({ success: true, transfers });
        }

        if (role === 'Admin' || role === 'Asset Manager') {
            const transfers = await TransferRequest.find(query).sort({ createdAt: -1 });
            return res.json({ success: true, transfers });
        }

        // Department Head: scope to transfers where the asset currently sits
        // within their department.
        const transfers = await TransferRequest.find(query)
            .populate({
                path: 'fromAllocation',
                select: 'employee department',
                populate: { path: 'employee', select: 'department' },
            })
            .sort({ createdAt: -1 });
        const scoped = transfers.filter((transfer) =>
            isSameId(resolveHolderDepartment(transfer.fromAllocation || {}), req.user.department)
        );
        res.json({ success: true, transfers: scoped });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/reject a pending transfer request. Department Heads may only
//          review transfers where the asset is currently held in their department.
// @route   PATCH /api/allocations/transfers/:transferId/review
// @access  Private (Admin, Asset Manager & Department Head)
const reviewTransferRequest = async (req, res) => {
    try {
        const { decision, reviewNotes } = req.body;
        if (!['Approved', 'Rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected.' });
        }

        const transfer = await TransferRequest.findOne({ _id: req.params.transferId, status: 'Requested' });
        if (!transfer) return res.status(404).json({ success: false, message: 'A pending transfer request was not found.' });

        if (req.user.role === 'Department Head') {
            const fromAllocation = await Allocation.findById(transfer.fromAllocation).populate({ path: 'employee', select: 'department' });
            if (!fromAllocation || !isSameId(resolveHolderDepartment(fromAllocation), req.user.department)) {
                return res.status(403).json({ success: false, message: 'This transfer request is outside your department.' });
            }
        }

        if (decision === 'Rejected') {
            transfer.status = 'Rejected';
            transfer.reviewedAt = new Date();
            transfer.reviewNotes = reviewNotes;
            await transfer.save();

            await notify({
                user: transfer.requestedBy,
                type: 'TransferRejected',
                message: 'Your transfer request was rejected.',
                relatedEntity: transfer._id.toString(),
            });
            await logActivity({
                user: req.user._id,
                action: `Rejected transfer request for asset ${transfer.asset}`,
                module: 'Allocation',
                metadata: { transferId: transfer._id, assetId: transfer.asset },
            });

            return res.json({ success: true, message: 'Transfer request rejected.', transfer });
        }

        const oldAllocation = await Allocation.findOneAndUpdate(
            { _id: transfer.fromAllocation, status: 'Active' },
            { $set: { status: 'Transferred', returnedAt: new Date() } },
            { new: true }
        );
        if (!oldAllocation) return res.status(409).json({ success: false, message: 'The original allocation is no longer active.' });

        const allocation = await Allocation.create({
            asset: transfer.asset,
            employee: transfer.toEmployee,
            department: transfer.toDepartment,
        });
        transfer.status = 'Approved';
        transfer.reviewedAt = new Date();
        transfer.reviewNotes = reviewNotes;
        await transfer.save();

        const asset = await Asset.findById(transfer.asset).select('name assetTag');
        let notifyTargetUser = transfer.toEmployee;
        if (!notifyTargetUser && transfer.toDepartment) {
            const dept = await Department.findById(transfer.toDepartment).select('head');
            notifyTargetUser = dept?.head;
        }
        if (notifyTargetUser) {
            await notify({
                user: notifyTargetUser,
                type: 'TransferApproved',
                message: `${asset?.name || 'An asset'} (${asset?.assetTag || ''}) has been transferred to you.`,
                relatedEntity: transfer._id.toString(),
            });
        }
        await notify({
            user: transfer.requestedBy,
            type: 'TransferApproved',
            message: `Your transfer request for ${asset?.name || 'an asset'} was approved.`,
            relatedEntity: transfer._id.toString(),
        });
        await logActivity({
            user: req.user._id,
            action: `Approved transfer for ${asset?.name || transfer.asset}`,
            module: 'Allocation',
            metadata: { transferId: transfer._id, assetId: transfer.asset },
        });

        res.json({ success: true, message: 'Transfer approved and asset re-allocated.', transfer, allocation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── Allocation requests ────────────────────────────────────────────────────
// Self-service counterpart to `createAllocation`: instead of a manager
// directly assigning an unowned asset, an Employee/Department Head asks for
// one to be assigned to them (or, for a Department Head, to their own
// department), and it goes through the same review flow as a transfer.

// @desc    Request that a currently unowned (Available) asset be allocated to
//          you, or - if you're a Department Head - to your own department.
// @route   POST /api/allocations/requests
// @access  Private (Employee & Department Head)
const createAllocationRequest = async (req, res) => {
    try {
        const { assetId, recipientType, reason, expectedReturnDate } = req.body;
        if (!assetId) {
            return res.status(400).json({ success: false, message: 'Provide an asset to request.' });
        }

        const wantsDepartment = recipientType === 'department';
        if (wantsDepartment && req.user.role !== 'Department Head') {
            return res.status(403).json({ success: false, message: 'Only a Department Head can request an asset for their department.' });
        }
        if (wantsDepartment && !req.user.department) {
            return res.status(400).json({ success: false, message: 'You are not assigned to a department.' });
        }

        const asset = await Asset.findOne({ _id: assetId, status: 'Available', isActive: true });
        if (!asset) {
            return res.status(409).json({ success: false, message: 'This asset is not currently available to request.' });
        }

        const requestDoc = await AllocationRequest.create({
            asset: asset._id,
            requestedBy: req.user._id,
            employee: wantsDepartment ? undefined : req.user._id,
            department: wantsDepartment ? req.user.department : undefined,
            reason,
            expectedReturnDate: expectedReturnDate || undefined,
        });

        await logActivity({
            user: req.user._id,
            action: `Requested ${asset.assetTag} (${asset.name}) for ${wantsDepartment ? 'their department' : 'themselves'}`,
            module: 'Allocation',
            metadata: { allocationRequestId: requestDoc._id, assetId: asset._id },
        });

        res.status(201).json({ success: true, message: 'Allocation request submitted for approval.', request: requestDoc });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    List allocation requests. Visibility mirrors transfer requests:
//          Admin/Asset Manager see everything; Department Head sees requests
//          aimed at their department (or at an employee within it); everyone
//          else (or ?mine=true) sees only what they personally submitted.
// @route   GET /api/allocations/requests
// @access  Private
const getAllocationRequests = async (req, res) => {
    try {
        const query = req.query.status ? { status: req.query.status } : {};
        const wantsMine = req.query.mine === 'true';
        const role = req.user.role;

        if (wantsMine || role === 'Employee') {
            query.requestedBy = req.user._id;
            const requests = await AllocationRequest.find(query).sort({ createdAt: -1 });
            return res.json({ success: true, requests });
        }

        if (role === 'Admin' || role === 'Asset Manager') {
            const requests = await AllocationRequest.find(query).sort({ createdAt: -1 });
            return res.json({ success: true, requests });
        }

        // Department Head: scope to requests aimed at their department, or at
        // an employee who belongs to their department.
        const requests = await AllocationRequest.find(query)
            .populate({ path: 'employee', select: 'department' })
            .sort({ createdAt: -1 });
        const scoped = requests.filter((request) => {
            const targetDepartment = request.department || request.employee?.department;
            return isSameId(targetDepartment, req.user.department);
        });
        res.json({ success: true, requests: scoped });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/reject a pending allocation request. Approval re-checks
//          the asset is still available, then creates a real Allocation.
//          Department Heads may only review requests aimed at their own
//          department (or an employee within it).
// @route   PATCH /api/allocations/requests/:requestId/review
// @access  Private (Admin, Asset Manager & Department Head)
const reviewAllocationRequest = async (req, res) => {
    try {
        const { decision, reviewNotes } = req.body;
        if (!['Approved', 'Rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected.' });
        }

        const requestDoc = await AllocationRequest.findOne({ _id: req.params.requestId, status: 'Requested' })
            .populate({ path: 'employee', select: 'department' });
        if (!requestDoc) return res.status(404).json({ success: false, message: 'A pending allocation request was not found.' });

        if (req.user.role === 'Department Head') {
            const targetDepartment = requestDoc.department || requestDoc.employee?.department;
            if (!isSameId(targetDepartment, req.user.department)) {
                return res.status(403).json({ success: false, message: 'This allocation request is outside your department.' });
            }
        }

        if (decision === 'Rejected') {
            requestDoc.status = 'Rejected';
            requestDoc.reviewedAt = new Date();
            requestDoc.reviewNotes = reviewNotes;
            await requestDoc.save();

            await notify({
                user: requestDoc.requestedBy,
                type: 'AllocationRequestRejected',
                message: 'Your asset request was rejected.',
                relatedEntity: requestDoc._id.toString(),
            });

            return res.json({ success: true, message: 'Allocation request rejected.', request: requestDoc });
        }

        const asset = await Asset.findOneAndUpdate(
            { _id: requestDoc.asset, status: 'Available', isActive: true },
            { $set: { status: 'Allocated' } },
            { new: true }
        );
        if (!asset) {
            return res.status(409).json({ success: false, message: 'This asset is no longer available.' });
        }

        const allocation = await Allocation.create({
            asset: asset._id,
            employee: requestDoc.employee,
            department: requestDoc.department,
            expectedReturnDate: requestDoc.expectedReturnDate,
        });

        requestDoc.status = 'Approved';
        requestDoc.reviewedAt = new Date();
        requestDoc.reviewNotes = reviewNotes;
        await requestDoc.save();

        await notify({
            user: requestDoc.requestedBy,
            type: 'AssetAssigned',
            message: `Your request for ${asset.name} (${asset.assetTag}) was approved.`,
            relatedEntity: requestDoc._id.toString(),
        });
        await logActivity({
            user: req.user._id,
            action: `Approved allocation request for ${asset.assetTag} (${asset.name})`,
            module: 'Allocation',
            metadata: { allocationRequestId: requestDoc._id, assetId: asset._id },
        });

        res.json({ success: true, message: 'Allocation request approved and asset allocated.', request: requestDoc, allocation, asset });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAllocation,
    getAllocations,
    returnAllocation,
    requestReturn,
    reviewReturnRequest,
    createTransferRequest,
    getTransferRequests,
    reviewTransferRequest,
    createAllocationRequest,
    getAllocationRequests,
    reviewAllocationRequest,
};
