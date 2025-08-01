function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

function redirectIfAuthenticated(req, res, next) {
    if (req.session.user) {
        return res.redirect('/banking/dashboard');
    }
    next();
}

module.exports = {
    requireAuth,
    redirectIfAuthenticated
};