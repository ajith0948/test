const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const { hasOverlap } = require('../utils/overlapCheck');

// @desc    Book a shared/bookable asset for a time slot
// @route   POST /api/bookings
// @access  Private (any logged-in user)
const createBooking = async (req, res) => {
    try {
        const { assetId, startTime, endTime, purpose } = req.body;
        if (!assetId || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'Provide an asset, start time, and end time.' });
        }
        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({ success: false, message: 'endTime must be after startTime.' });
        }

        const asset = await Asset.findById(assetId);
        if (!asset || !asset.isActive) return res.status(404).json({ success: false, message: 'Asset not found.' });
        if (!asset.isShared) {
            return res.status(400).json({ success: false, message: 'Only shared, bookable assets can be booked.' });
        }

        if (await hasOverlap(assetId, startTime, endTime)) {
            return res.status(409).json({ success: false, message: 'Time slot overlaps with an existing booking.' });
        }

        const booking = await Booking.create({
            asset: assetId,
            bookedBy: req.user._id,
            startTime,
            endTime,
            purpose,
        });
        res.status(201).json({ success: true, message: 'Booking confirmed.', booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    List bookings (filterable). ?mine=true restricts to the caller's own bookings.
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
    try {
        const query = {};
        if (req.query.assetId) query.asset = req.query.assetId;
        if (req.query.status) query.status = req.query.status;
        if (req.query.mine === 'true') query.bookedBy = req.user._id;

        const bookings = await Booking.find(query)
            .populate('asset', 'name assetTag')
            .sort({ startTime: 1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel a booking. Employees may only cancel their own; Admin/Asset
//          Manager can cancel any.
// @route   PATCH /api/bookings/:bookingId/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

        const isOwner = String(booking.bookedBy) === String(req.user._id);
        const isManager = req.user.role === 'Admin' || req.user.role === 'Asset Manager';
        if (!isOwner && !isManager) {
            return res.status(403).json({ success: false, message: 'You can only cancel your own bookings.' });
        }
        if (!['Upcoming', 'Ongoing'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Only an upcoming or ongoing booking can be cancelled.' });
        }

        booking.status = 'Cancelled';
        booking.cancelledAt = new Date();
        await booking.save();
        res.json({ success: true, message: 'Booking cancelled.', booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { createBooking, getBookings, cancelBooking };
