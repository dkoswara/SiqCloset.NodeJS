(function(angular){
    'use strict';

    //TODO store modules in database so an admin user can setup who can see what.
    // Also so we don't duplicate authorization logic on client and server

    angular.module('app').constant('mainModule', getMainModule());

    angular.module('app').constant('modules', getModules());

    function getMainModule() {
        return {
            name: 'app',
            config: {
                url: '',
                views: {
                    'header': {
                        templateUrl: 'app/shell/header.html'
                    },
                    'content': {
                        templateUrl: 'app/shell/home.html'
                    },
                    'footer': {
                        templateUrl: 'app/shell/footer.html'
                    }
                }
            }
        };
    }

    function getModules() {
        return [
            {
                name: 'Home',
                iconPath: 'home.png',
                state: {
                    name: 'app.home',
                    config: {
                        url : '/',
                        views : {
                            'content@' : {
                                templateUrl: 'app/shell/home.html'
                            }
                        }
                    }
                }
            },
            {
                name: 'Setup',
                iconPath: 'setup.png',
                state: {
                    name: 'app.setup',
                    config: {
                        url : '/setup',
                        views : {
                            'content@' : {
                                templateUrl: 'app/setup/setup.html'
                            }
                        },
                        requiresAuthorization: true,
                        allowedRoles: ['admin']
                    }
                }
            },
            {
                name: 'Send Shipment Tracking Info',
                iconPath: 'mail.png',
                state: {
                    name: 'app.sendEmail',
                    config: {
                        url : '/sendEmail',
                        views : {
                            'content@' : {
                                templateUrl: 'app/sendEmail/sendEmail.html'
                            }
                        },
                        requiresAuthorization: true,
                        allowedRoles: ['admin']
                    }
                }
            },
            {
                name: 'Send Shipment Schedule',
                iconPath: 'mail.png',
                state: {
                    name: 'app.sendShipmentSchedule',
                    config: {
                        url : '/sendShipmentSchedule',
                        views : {
                            'content@' : {
                                templateUrl: 'app/sendShipmentSchedule/sendShipmentSchedule.html'
                            }
                        },
                        requiresAuthorization: true,
                        allowedRoles: ['admin']
                    }
                }
            },
            {
                name: 'Create Shipping Address',
                iconPath: '',
                state: {
                    name: 'app.createShippingAddress',
                    config: {
                        url : '/createShippingAddress',
                        views : {
                            'content@' : {
                                templateUrl: 'app/createShippingAddress/createShippingAddress.html'
                            }
                        },
                        requiresAuthorization: true,
                        allowedRoles: ['admin']
                    }
                }
            },
            {
                name: 'Create Batch Invoice',
                iconPath: '',
                state: {
                    name: 'app.createBatchInvoice',
                    config: {
                        url : '/createBatchInvoice',
                        views : {
                            'content@' : {
                                templateUrl: 'app/createBatchInvoice/createBatchInvoice.html'
                            }
                        },
                        requiresAuthorization: true,
                        allowedRoles: ['admin']
                    }
                }
            }
        ]
    }

})(this.angular);