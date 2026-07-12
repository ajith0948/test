const Booking = require('../models/Booking');

// Bookings never had a scheduled job flipping them from Upcoming -> Ongoing ->
// Completed as their time window arrives/passes, so a booking sat as
// 'Upcoming' forever once its endTime was in the past - inflating any
// "active bookings" count indefinitely. Rather than add a cron dependency,
// self-heal lazily: call this at the top of any read path that cares about
// booking status (list, dashboard KPIs) before querying.
const syncBookingStatuses = async () => {
    const now = new Date();
    await Promise.all([
        Booking.updateMany(
            { status: 'Upcoming', endTime: { $lt: now } },
            { $set: { status: 'Completed' } }
        ),
        Booking.updateMany(
            { status: 'Upcoming', startTime: { $lte: now }, endTime: { $gte: now } },
            { $set: { status: 'Ongoing' } }
        ),
        Booking.updateMany(
            { status: 'Ongoing', endTime: { $lt: now } },
            { $set: { status: 'Completed' } }
        ),
    ]);
};

module.exports = { syncBookingStatuses };
