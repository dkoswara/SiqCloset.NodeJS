(function(angular){
    'use strict';

    var app = angular.module('app');

    app.factory('authService', ['$window', factory]);

    function factory($window) {
        var currUser = $window.user;

        var service = {
            login: login,
            logout: logout,
            user: currUser,
            isAuthenticated: isAuthenticated,
            isAuthorized: isAuthorized
        };

        return service;

        function login() {
            $window.location.href = '/auth/google';
        }

        function logout() {
            $window.location.href = '/logout';
        }

        function isAuthenticated() {
            return currUser.hasOwnProperty('email');
        }

        function isAuthorized(roles) {
            return isAuthenticated() && currUser.roles.some(function(r) {
                    return _.contains(roles, r.name);
                });
        }
    }

})(this.angular);