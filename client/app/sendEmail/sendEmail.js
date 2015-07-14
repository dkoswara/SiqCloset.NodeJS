(function(angular){
    'use strict';

    angular.module('app').controller('sendEmail', ['mailService', controller]);

    function controller(mailService) {
        var vm = this;

        vm.batchNum = null;
        vm.shipmentInfos = [];
        vm.lbsWeight = null;
        vm.ozWeight = null;

        vm.sendEmail = sendEmail;
        vm.addShipmentInfo = addShipmentInfo;
        vm.removeShipmentInfo = removeShipmentInfo;

        function sendEmail() {
            if (vm.shipmentInfos.length === 0) { return; }
            mailService.send(vm.batchNum, vm.shipmentInfos).then(success, fail);

            function success(results){
                vm.results = 'Shipment info sent successfully';
            };

            function fail(results){
                vm.results = 'Error: ' + results.data;
            };
        }

        function addShipmentInfo() {
            var newShipmentInfo = {
                uspsTrackingNo: vm.uspsTrackingNo,
                weight: convertToKg(vm.lbsWeight, vm.ozWeight),
                price: vm.price,
            };

            vm.shipmentInfos.push(newShipmentInfo);

            function convertToKg(lbs, oz) {
                var kgMultiplier = 0.0283495;  //this is 1 oz in kg
                var ozMultiplier = 16;  //this is 1 lbs in oz

                var num = ((lbs * ozMultiplier) + oz) * kgMultiplier;
                return Math.round((num + 0.00001) * 100) / 100;
            }
        }

        function removeShipmentInfo(index){
            vm.shipmentInfos.splice(index, 1);
        }
    }

})(this.angular);