const ActivityLog = require('../models/ActivityLog');

// Fire-and-forget activity log write. Swallows errors so a logging failure
// never breaks the primary action.
const logActivity = async ({ user, action, module, metadata }) => {
    if (!user || !action || !module) return;
    try {
        await ActivityLog.create({ user, action, module, metadata });
    } catch (error) {
        console.error('logActivity() failed:', error.message);
    }
};

module.exports = { logActivity };
