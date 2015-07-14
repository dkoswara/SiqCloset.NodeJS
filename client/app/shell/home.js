(function(angular){
    'use strict';

    angular.module('app').controller('home', ['authService', 'modules', controller]);

    function controller(authService, modules){
        var vm = this;

        vm.welcomeText = authService.isAuthenticated() ? 'You are currently logged in as ' + authService.user.email : 'You are currently logged out';

        vm.login = login;
        vm.logout = logout;

        vm.isLoggedIn = authService.isAuthenticated();

        vm.modules = modules;
        vm.moduleFilter = moduleFilter;

        function moduleFilter(module) {
            if (module.name == 'Home') { return false; }
            if (module.state.config.requiresAuthorization) {
                return authService.isAuthorized(module.state.config.allowedRoles);
            } else {
                return true;
            }
        }

        function login() {
            authService.login();
        }

        function logout() {
            authService.logout();
        }
    }
})(this.angular)
