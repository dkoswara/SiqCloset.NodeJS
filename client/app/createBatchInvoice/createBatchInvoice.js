(function(angular){
    'use strict';

    angular.module('app').controller('createBatchInvoice', ['excelService', controller]);

    function controller(excelService) {
        var vm = this;

        vm.batchNum = '';
        vm.status = '';
        vm.results = '';
        vm.createBatchInvoice = createBatchInvoice;
        function createBatchInvoice() {
            excelService.createBatchInvoice(vm.batchNum)
                .then(function(response) {
                    vm.status = 'Excel batch invoice created successfully.';
                }).catch(function(error){
                    vm.status = 'Error in creating excel batch invoice. Please see error message below.';
                    vm.results = error.data;
                });
        }
    }

})(this.angular);