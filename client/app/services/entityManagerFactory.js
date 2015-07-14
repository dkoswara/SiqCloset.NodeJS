(function (angular) {
    'use strict';

    angular.module('app').factory('entityManagerFactory', ['breeze', 'breezeMetadataService', factory]);

    function factory(breeze, breezeMetadataService){
        var entityManager;

        //initialize mongodb adapter
        breeze.config.initializeAdapterInstance("dataService", "mongo", true);

        return {
            getManager: getManager
        };

        function getManager() {
            if (!entityManager) {
                var metadataStore = breezeMetadataService.createMetadataStore();
                var dataService = new breeze.DataService( {
                    serviceName: 'breeze/SiqCloset'
                });
                metadataStore.addDataService(dataService);

                entityManager = new breeze.EntityManager( {
                    dataService: dataService,
                    metadataStore: metadataStore
                });
            }

            lowerCaseAllResourceName(entityManager);

            return entityManager;

            function lowerCaseAllResourceName(em) {
                //existing collection created by mongoose all use lowercase so I'm stuck...
                em.metadataStore.getEntityTypes().forEach(function(et){
                    et.defaultResourceName = et.defaultResourceName.toLowerCase();
                });
            }
        }
    }

})(this.angular);