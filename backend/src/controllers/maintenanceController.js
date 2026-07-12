const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');

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
        res.status(201).json({ success: true, message: 'Maintenance request raised successfully.', request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    List maintenance requests (filterable). ?mine=true restricts to
//          requests the caller raised.
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRequests = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.assetId) query.asset = req.query.assetId;
        if (req.query.mine === 'true') query.raisedBy = req.user._id;

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

        if (decision === 'Rejected') {
            request.status = 'Rejected';
            request.approvedBy = req.user._id;
            request.rejectionReason = rejectionReason;
            await request.save();
            return res.json({ success: true, message: 'Maintenance request rejected.', request });
        }

        request.status = technician ? 'TechnicianAssigned' : 'Approved';
        request.approvedBy = req.user._id;
        if (technician) request.technician = technician;
        await request.save();

        const asset = await Asset.findByIdAndUpdate(request.asset, { status: 'Under Maintenance' }, { new: true });
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
        res.json({ success: true, message: 'Maintenance request resolved.', request, asset });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { createRequest, getMaintenanceRequests, approveRequest, resolveRequest };
