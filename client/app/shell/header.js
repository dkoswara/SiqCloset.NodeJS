(function(angular){
    'use strict';

    angular.module('app').controller('header', ['authService', 'modules', controller]);

    function controller(authService, modules){
        var vm = this;

        vm.modules = modules;
        vm.moduleFilter = moduleFilter;
        vm.authActionName = !authService.isAuthenticated() ? 'Login' : 'Logout';
        vm.authAction = !authService.isAuthenticated() ? authService.login : authService.logout;

        function moduleFilter(module) {
            if (module.state.config.requiresAuthorization) {
                return authService.isAuthorized(module.state.config.allowedRoles);
            } else {
                return true;
            }
        }

    }
})(this.angular)
