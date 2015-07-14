/*
 * Configures the UI-Router states and their associated URL routes and views
 */
(function( angular ) {
    'use strict';

    var app = angular.module('app');

    app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', 'mainModule', 'modules', configureStates]);

    function configureStates($locationProvider, $stateProvider, $urlRouterProvider, mainModule, modules) {

        //TODO: This doesn't work when used in conjunction with #urlRouterProvider.otherwise. Need to find out why
        $locationProvider.html5Mode(false);

        $urlRouterProvider.otherwise('/');

        $stateProvider.state(mainModule.name, mainModule.config);

        modules.forEach(function (m) {
            setState(m.state.name, m.state.config);
        });

        function setState(name, definition) {
            $stateProvider.state(name, definition);
            return $stateProvider;
        }
    }

}( this.angular ));