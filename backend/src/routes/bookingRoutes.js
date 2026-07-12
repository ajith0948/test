const express = require('express');
const { createBooking, getBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Any logged-in user can book a shared resource, view bookings, and cancel
// their own (the controller enforces the "own booking" rule for non-managers).
router.get('/', protect, getBookings);
router.post('/', protect, createBooking);
router.patch('/:bookingId/cancel', protect, cancelBooking);

module.exports = router;
