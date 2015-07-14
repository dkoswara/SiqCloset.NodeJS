/*
 * The application startup function, called in the app module's run block
 * Created apart from app.js so it can be easily stubbed out
 * during testing or tested independently
 */
(function( angular  ) {

    angular.module( "app").factory('appStart', ['$rootScope', 'authService', factory]);

    function factory ($rootScope, authService) {
        var appStart = {
            start: start
        };
        return appStart;

        function start ( ) {
            monitorStateChanges();
        }

        function monitorStateChanges(){
            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState){
                    if(toState.requiresAuthorization && !authService.isAuthorized(toState.allowedRoles)) {
                        event.preventDefault();
                    } else {
                        console.log("stateChangeStart: from '"+fromState.name + "' to '"+ toState.name+"'");
                    }
                });

            $rootScope.$on('$stateChangeError',
                function(event, toState, toParams, fromState, fromParams, error){
                    console.log("stateChangeError: from '"+fromState.name + "' to '"+ toState.name+"' with error: "+error);
                });

            $rootScope.$on('$stateChangeSuccess',
                function(event, toState, toParams, fromState){
                    console.log("stateChangeSuccess: from '"+fromState.name + "' to '"+ toState.name+"' with params " +
                    JSON.stringify(toParams));
                });
        }
    }
})( this.angular );
