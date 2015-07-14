(function (exports) {
    'use strict';

    var passport = require('passport');
    var _ = require('lodash');

    exports.authenticate = authenticate;
    exports.googleOAuth = googleOAuth;
    exports.googleOAuthCallback = googleOAuthCallback;
    exports.logout = logout;
    exports.isAuthenticated = isAuthenticated;
    exports.isAuthorized = isAuthorized;

    function authenticate() {
        //TODO: do more meaningful real world stuff when success and fail
        return passport.authenticate('local', {successRedirect: '/', failureRedirect: '/' });
    }

    function googleOAuth() {
        return passport.authenticate('google', { scope: ['email'] });
    }

    function googleOAuthCallback() {
        //TODO: do more meaningful real world stuff when success and fail
        return passport.authenticate('google', {successRedirect: '/', failureRedirect: '/' });
    }

    function logout(req, res)
    {
        req.logout();
        res.redirect('/');
    }

    function isAuthenticated(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }

        res.redirect('/');
    }

    function isAuthorized(req, res, next) {
        var currUserRoles = _.pluck(req.user.roles, 'name');
        if(_.contains(currUserRoles, 'admin')) {
            return next();
        }

        res.redirect('/');
    }

})(module.exports);
