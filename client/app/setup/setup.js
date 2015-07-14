(function(angular){
    'use strict';

    angular.module('app').controller('setup', ['repository', controller]);

    function controller(repository){
        var vm = this;

        vm.saveChanges = saveChanges;
        vm.hasChanges = repository.hasChanges;
        vm.smtpSettings = [];
        vm.mailOptions = [];
        vm.addMailOption = addMailOption;
        vm.deleteMailOption = deleteMailOption;
        vm.setMailOptionFlag = setMailOptionFlag;
        vm.status = '';

        init();

        function init() {
            repository.getSmtpSettings().then(function(entities){
                console.log(entities);
                vm.smtpSettings = entities;
            }).catch(function (error){
                console.log(error);
            });

            repository.getMailOptions().then(function(entities){
                console.log(entities);
                vm.mailOptions = entities;
            }).catch(function (error){
                console.log(error);
            });
        }

        function saveChanges() {
            repository.saveChanges().then(function(res){
                console.log(res);
                vm.status = 'Save successful';
            }).catch(function(error){
                console.log(error);
                vm.status = 'Save error. See console for error details';
            });
        }

        function addMailOption() {
            var newMailOption = repository.createMailOption({
                isDefault: false
            });
            vm.mailOptions.push(newMailOption);
        }

        function deleteMailOption(entity){
            repository.deleteEntity(entity);
            _.remove(vm.mailOptions, function(o) {
                return entity.id === o.id;
            });
        }

        function setMailOptionFlag(entity, propName) {
            if(!entity[propName]) {
                return;
            }
            _.forEach(vm.mailOptions, function(o){
                if(o.id !== entity.id){
                    o[propName] = false;
                }
            });
        }
    }
})(this.angular);