(function(angular) {

    var app = angular.module( "app", ['breeze.angular', 'ngSanitize', 'ui.router', /*'angularFileUpload',*/ 'angular-loading-bar' /*'cgBusy'*/ ] );

    app.run( ['appStart', function ( appStart ) {
        appStart.start();
    }]);

})( this.angular );