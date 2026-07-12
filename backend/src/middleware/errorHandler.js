// Central JSON error handler. Several controllers (notifications, activity
// logs, audits, reports) use the `catch (error) { next(error); }` pattern and
// rely on this being registered last in app.js - without it, Express falls
// back to its default HTML error page instead of a JSON { message } response,
// which breaks the frontend's `error.response?.data?.message` handling.
const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Something went wrong on the server.',
    });
};

module.exports = errorHandler;
