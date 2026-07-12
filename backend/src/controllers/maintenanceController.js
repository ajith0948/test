const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const { notify } = require('../utils/notify');
const { logActivity } = require('../utils/logActivity');

// @desc    Raise a maintenance request for an asset
// @route   POST /api/maintenance
// @access  Private (any logged-in user)
const createRequest = async (req, res) => {
    try {
        const { assetId, issueDescription, priority, photo } = req.body;
        if (!assetId || !issueDescription) {
            return res.status(400).json({ success: false, message: 'Provide an asset and issue description.' });
        }

        const asset = await Asset.findById(assetId);
        if (!asset || !asset.isActive) return res.status(404).json({ success: false, message: 'Asset not found.' });

        const request = await MaintenanceRequest.create({
            asset: assetId,
            raisedBy: req.user._id,
            issueDescription,
            priority,
            photo,
        });

        await logActivity({
            user: req.user._id,
            action: `Raised maintenance request for ${asset.name} (${asset.assetTag})`,
            module: 'Maintenance',
            metadata: { maintenanceId: request._id, priority: request.priority },
        });

        res.status(201).json({ success: true, message: 'Maintenance request raised successfully.', request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    List maintenance requests (filterable). ?mine=true restricts to
//          requests the caller raised. Department Heads (without ?mine=true)
//          only see requests for assets owned by their own department -
//          Admin/Asset Manager/Employee see everything (Employee typically
//          combines this with ?mine=true client-side, but isn't hard-scoped
//          here since raising a request doesn't require department scoping).
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRequests = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;

        const wantsMine = req.query.mine === 'true';
        if (wantsMine) query.raisedBy = req.user._id;

        if (!wantsMine && req.user.role === 'Department Head') {
            const departmentAssets = await Asset.find({ department: req.user.department }).select('_id');
            query.asset = { $in: departmentAssets.map((asset) => asset._id) };
        }

        // A specific assetId filter narrows further, but must stay within
        // whatever scope was already established above (e.g. a Department
        // Head can't use ?assetId= to peek at an asset outside their dept).
        if (req.query.assetId) {
            query.asset = query.asset
                ? { $in: query.asset.$in.filter((id) => String(id) === String(req.query.assetId)) }
                : req.query.assetId;
        }

        const requests = await MaintenanceRequest.find(query)
            .populate('asset', 'name assetTag status')
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve or reject a pending maintenance request. Approving takes
//          the asset out of service (status -> 'Under Maintenance').
// @route   PATCH /api/maintenance/:id/approve
// @access  Private (Admin, Asset Manager, Department Head)
const approveRequest = async (req, res) => {
    try {
        const { decision, technician, rejectionReason } = req.body;
        if (!['Approved', 'Rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected.' });
        }

        const request = await MaintenanceRequest.findOne({ _id: req.params.id, status: 'Pending' });
        if (!request) return res.status(404).json({ success: false, message: 'A pending maintenance request was not found.' });

        // Department Heads may only approve/reject requests for assets owned
        // by their own department - mirrors the scoping already applied to
        // allocation/transfer/return reviews elsewhere in the app.
        if (req.user.role === 'Department Head') {
            const requestAsset = await Asset.findById(request.asset).select('department');
            const sameDept = requestAsset?.department && String(requestAsset.department) === String(req.user.department);
            if (!sameDept) {
                return res.status(403).json({ success: false, message: 'This maintenance request is outside your department.' });
            }
        }

        if (decision === 'Rejected') {
            request.status = 'Rejected';
            request.approvedBy = req.user._id;
            request.rejectionReason = rejectionReason;
            await request.save();

            const rejectedAsset = await Asset.findById(request.asset).select('name assetTag');
            await notify({
                user: request.raisedBy,
                type: 'MaintenanceRejected',
                message: `Your maintenance request for ${rejectedAsset?.name || 'an asset'} was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
                relatedEntity: request._id.toString(),
            });
            await logActivity({
                user: req.user._id,
                action: `Rejected maintenance request for ${rejectedAsset?.name || request.asset}`,
                module: 'Maintenance',
                metadata: { maintenanceId: request._id },
            });

            return res.json({ success: true, message: 'Maintenance request rejected.', request });
        }

        request.status = technician ? 'TechnicianAssigned' : 'Approved';
        request.approvedBy = req.user._id;
        if (technician) request.technician = technician;
        await request.save();

        const asset = await Asset.findByIdAndUpdate(request.asset, { status: 'Under Maintenance' }, { new: true });

        await notify({
            user: request.raisedBy,
            type: 'MaintenanceApproved',
            message: `Your maintenance request for ${asset?.name || 'an asset'} (${asset?.assetTag || ''}) was approved.`,
            relatedEntity: request._id.toString(),
        });
        await logActivity({
            user: req.user._id,
            action: `Approved maintenance request for ${asset?.name || request.asset}`,
            module: 'Maintenance',
            metadata: { maintenanceId: request._id },
        });

        res.json({ success: true, message: 'Maintenance request approved.', request, asset });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Mark an approved/in-progress maintenance request as resolved and
//          bring the asset back into service.
// @route   PATCH /api/maintenance/:id/resolve
// @access  Private (Admin, Asset Manager)
const resolveRequest = async (req, res) => {
    try {
        const request = await MaintenanceRequest.findOne({
            _id: req.params.id,
            status: { $in: ['Approved', 'TechnicianAssigned', 'InProgress'] },
        });
        if (!request) return res.status(404).json({ success: false, message: 'An in-progress maintenance request was not found.' });

        request.status = 'Resolved';
        request.resolvedAt = new Date();
        request.resolutionNotes = req.body.resolutionNotes;
        await request.save();

        // Restore the asset to whatever state makes sense: still allocated to
        // someone if it has an active allocation, otherwise Available.
        const activeAllocation = await Allocation.findOne({ asset: request.asset, status: 'Active' });
        const asset = await Asset.findByIdAndUpdate(
            request.asset,
            { status: activeAllocation ? 'Allocated' : 'Available' },
            { new: true }
        );

        await notify({
            user: request.raisedBy,
            type: 'MaintenanceResolved',
            message: `Maintenance on ${asset?.name || 'an asset'} (${asset?.assetTag || ''}) is complete.`,
            relatedEntity: request._id.toString(),
        });
        await logActivity({
            user: req.user._id,
            action: `Resolved maintenance request for ${asset?.name || request.asset}`,
            module: 'Maintenance',
            metadata: { maintenanceId: request._id },
        });

        res.json({ success: true, message: 'Maintenance request resolved.', request, asset });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { createRequest, getMaintenanceRequests, approveRequest, resolveRequest };
