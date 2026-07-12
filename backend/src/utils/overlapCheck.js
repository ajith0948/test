const Booking = require('../models/Booking');

/**
 * Checks if a proposed booking time overlaps with any existing active booking
 * for the same asset. Returns true if an overlap exists, false if the slot is free.
 */
const hasOverlap = async (assetId, newStart, newEnd, excludeBookingId) => {
    const query = {
        asset: assetId,
        status: { $in: ['Upcoming', 'Ongoing'] }, // ignore Cancelled/Completed
        startTime: { $lt: new Date(newEnd) },
        endTime: { $gt: new Date(newStart) },
    };
    if (excludeBookingId) query._id = { $ne: excludeBookingId };

    const overlappingBooking = await Booking.findOne(query);
    return !!overlappingBooking;
};

module.exports = { hasOverlap };
