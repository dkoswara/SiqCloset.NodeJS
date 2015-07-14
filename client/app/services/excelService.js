(function(angular){
    'use strict';

    angular.module('app').factory('excelService', ['$http', factory]);

    function factory($http){
        var excelService = {
            createShippingAddress: createShippingAddress,
            createBatchInvoice: createBatchInvoice,
            createShipmentInvoice: createShipmentInvoice,
            getMissingCustomers: getMissingCustomers
        };

        return excelService;

        function createShippingAddress(batchNum) {
            return $http.post('/excel/shipping-address', {
                batchNum: batchNum
            });
        }

        function createBatchInvoice(batchNum) {
            return $http.post('/excel/batch-invoice', {
                batchNum: batchNum
            });
        }

        function createShipmentInvoice(params) {
            return $http.post('/excel/shipment-invoice', {
                params: params
            });
        }

        function getMissingCustomers(batchNum) {
            return $http.get('/excel/missing-customers', {
                params: { batchNum: batchNum }
            });
        }
    }

})(this.angular);