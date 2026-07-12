const Notification = require('../models/Notification');

// Fire-and-forget notification creation. Swallows errors so a notification
// failure never breaks the primary action (allocation, booking, etc).
const notify = async ({ user, type, message, relatedEntity }) => {
    if (!user) return;
    try {
        await Notification.create({ user, type, message, relatedEntity });
    } catch (error) {
        console.error('notify() failed:', error.message);
    }
};

module.exports = { notify };
