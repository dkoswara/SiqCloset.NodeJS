(function(angular){
    'use strict';

    angular.module('app').factory('mailService', ['$http', factory]);

    function factory($http){
        var mailService = {
            send: send,
            sendShipmentSchedule: sendShipmentSchedule
        };

        return mailService;

        function send(batchNum, shipmentInfos) {
            return $http.post('/email/shipment-tracking', {
                batchNum: batchNum,
                shipmentInfos: shipmentInfos
            });
        }

        function sendShipmentSchedule(batchNums, targetDate) {
            return $http.post('/email/shipment-schedule', {
                batchNums: batchNums,
                targetDate: targetDate
            });
        }
    }

})(this.angular);