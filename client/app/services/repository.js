(function (angular) {
    'use strict';

    angular.module('app').factory('repository', ['$q', 'breeze', 'entityManagerFactory', factory]);

    function factory($q, breeze, entityManagerFactory) {
        var manager = entityManagerFactory.getManager();

        return {
            hasChanges: hasChanges,
            getSmtpSettings: getSmtpSettings,
            getMailOptions: getMailOptions,
            createMailOption: createMailOption,
            saveChanges: saveChanges,
            deleteEntity: deleteEntity
        };

        function hasChanges() {
            return manager.hasChanges();
        }

        function saveChanges() {
            return manager.saveChanges();
        }

        function getSmtpSettings() {
            return getEntities('SmtpSetting', 'SmtpSettings');
        }

        function getMailOptions() {
           return getEntities('MailOption', 'MailOptions');
        }

        function getEntities(typeName, resourceName) {
            var results = manager.getEntities(typeName);
            if(!results.length) {
                var query = breeze.EntityQuery.from(resourceName);
                return manager.executeQuery(query).then(function (res) {
                    return res.results;
                }).catch(function (error) {
                    throw error;
                });
            }

            return $q.when(results);
        }

        function createMailOption(initialValues) {
            var init = {
                id: breeze.DataType.MongoObjectId.getNext()
            };

            breeze.core.extend(init, initialValues);
            return manager.createEntity('MailOption', init);
        }

        function deleteEntity(entity){
            entity.entityAspect.setDeleted();
        }
    }

})(this.angular);