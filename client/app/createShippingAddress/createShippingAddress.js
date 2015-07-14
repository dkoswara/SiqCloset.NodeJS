(function(angular){
    'use strict';

    angular.module('app').controller('createShippingAddress', ['excelService', controller]);

    function controller(excelService) {
        var vm = this;

        vm.batchNum = '';
        vm.status = '';
        vm.results = '';
        vm.createShippingAddress = createShippingAddress;
        vm.getMissingCustomers = getMissingCustomers;

        function createShippingAddress() {
            excelService.createShippingAddress(vm.batchNum)
                .then(function(response) {
                    vm.status = 'Excel shipping address created successfully.';
                }).catch(function(error) {
                    vm.status = 'Error in creating excel shipping address. Please see error message below.';
                    vm.results = error.data;
                });
        }

        function getMissingCustomers() {
            excelService.getMissingCustomers(vm.batchNum)
                .then(function(res) {
                    vm.status = res.data;
                }).catch(function(error) {
                    vm.status = 'Error in fetching missing customers. Please see error message below.';
                    vm.results = error.data;
                });
        }
    }

})(this.angular);