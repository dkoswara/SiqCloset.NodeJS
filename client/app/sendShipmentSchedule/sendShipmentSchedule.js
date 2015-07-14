(function(angular){
    'use strict';

    angular.module('app').controller('sendShipmentSchedule', ['mailService', controller]);

    function controller(mailService) {
        var vm = this;

        vm.batchNums = '';
        vm.targetDate = '';
        vm.results = '';
        vm.status ='';

        //var excelFile;
        //vm.onFileSelect = function ($files) {
        //    excelFile = $files[0];
        //};
        vm.sendShipmentSchedule = sendShipmentSchedule;
        function sendShipmentSchedule() {
            mailService.sendShipmentSchedule(vm.batchNums, vm.targetDate)
                .then(function(response){
                    vm.status = 'Mail sent successfully.';
                    vm.results = response.data;
                }).catch(function(error){
                    vm.status = 'Error in sending mail. Please see error message below.';
                    vm.results = error.data;
                });
        }
    }

})(this.angular);