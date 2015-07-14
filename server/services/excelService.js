(function (exports) {
    'use strict';

    var _ = require('lodash');
    var Promise = require('bluebird');
    var stringFormat = require('string-format');
    var moment = require('moment');
    var dropboxService = require('./dropboxService');
    var stringFns = require('../utilities/stringFns');
    var arrayUtils = require('../utilities/arrayUtils');
    var excelWrapper = require('./excelWrapper');
    var excelWriter = require('./excelWriter');


    var config = {
        CustomerItemList: 'CustomerItemList.xlsx',
        MasterCustomerAddress: 'Master Customer Address.xls',
        CustShippingAddressFilename: 'Alamat Pengiriman Batch {0}.xlsx',
        BatchInvoiceFilename: 'Invoice Batch {0}.xlsx',
        ShipmentInvoiceFilename: 'Shipment Invoice BATCH {0} {1}.xlsx'
    };

    exports.getShipmentSchedule = getShipmentSchedule;
    exports.getShipmentScheduleHtml = getShipmentScheduleHtml;
    exports.readMasterCustAddr = readMasterCustAddr;
    exports.readCustItemList = readCustItemList;
    exports.getMissingCustomers = getMissingCustomers;
    exports.populateCustomerShippingAddress = populateCustomerShippingAddress;
    exports.createCustomerShippingAddress = createCustomerShippingAddress;
    exports.buildCustomerShippingAddress = buildCustomerShippingAddress;
    exports.createBatchInvoice = createBatchInvoice;
    exports.buildBatchInvoice = buildBatchInvoice;
    exports.createShipmentInvoice = createShipmentInvoice;
    exports.buildShipmentInvoice = buildShipmentInvoice;


    function getShipmentSchedule(params){
        return dropboxService.readFile(config.CustomerItemList).then(function(data) {
            return _getShipmentScheduleCore(data, params);
        });
    }

    function getShipmentScheduleHtml(params){
        return dropboxService.readFile(config.CustomerItemList).then(function(data) {
            return _getShipmentScheduleHtmlCore(data, params);
        });
    }

    function readMasterCustAddr(){
        return dropboxService.readFile(config.MasterCustomerAddress).then(function(data){
            var bs = arrayUtils.arrBuff2BinStr(data);
            var workbook = excelWrapper.readXls(bs);
            var worksheet = workbook.Sheets['Sheet1'];
            return excelWrapper.parseWorksheetToModel(worksheet, MasterCustomerAddress);
        });
    }

    function readCustItemList(batchNum){
        return dropboxService.readFile(config.CustomerItemList).then(function(data){
            var workbook = excelWrapper.readXlsx(data);
            var worksheet = workbook.Sheets['BATCH ' + batchNum];
            return excelWrapper.parseWorksheetToModel(worksheet, CustomerItemList);
        });
    }

    function getMissingCustomers(batchNum){
        return Promise.all([readMasterCustAddr(), readCustItemList(batchNum)]).then(function(results){
            var masterCustAddr = results[0];
            var custItemList = results[1];

            var filtered = _.filter(custItemList, nonRegisteredCust);

            //only returns unique customer names
            return _.uniq(_.pluck(filtered, 'Name'));

            function nonRegisteredCust(c){
                var idx = _.findIndex(masterCustAddr, function(m){
                    var nameFromMaster = m.Name ? m.Name.toLowerCase() : '';
                    return c.Name.toLowerCase() === nameFromMaster && _.trim(m.Address) !== '';
                });
                return idx === -1;
            }
        });
    }

    function populateCustomerShippingAddress(batchNum){
        return Promise.all([readMasterCustAddr(), readCustItemList(batchNum)]).then(function(results){
            var masterCustomerAddresses = results[0];
            var customerItemLists = results[1];

            var collection = [];
            customerItemLists.forEach(function(cil){
                var fromMaster = _.find(masterCustomerAddresses, function(m){
                    var nameFromMaster = m.Name ? m.Name.toLowerCase() : '';
                    return cil.Name.toLowerCase() === nameFromMaster;
                });
                if(!fromMaster){
                    fromMaster = {Address: '', PhoneNumber: ''};
                }
                var custShippingAddress = new CustomerShippingAddress(cil.Placement, cil.Box, cil.ItemName, cil.Code, cil.Name, fromMaster.Address, fromMaster.PhoneNumber, '');
                collection.push(custShippingAddress);
            });
            return collection;
        });
    }

    function buildCustomerShippingAddress(batchNum) {
        return populateCustomerShippingAddress(batchNum).then(function(customerShippingAddress) {
            var filename = stringFormat(config.CustShippingAddressFilename, batchNum);
            return createCustomerShippingAddress(customerShippingAddress, filename);
        });
    }

    function buildBatchInvoice(batchNum) {
        return readCustItemList(batchNum).then(function(custItemLists) {
            var filename = stringFormat(config.BatchInvoiceFilename, batchNum);
            return createBatchInvoice(custItemLists, filename);
        });
    }

    function buildShipmentInvoice(params) {
        return readCustItemList(params.batchNum).then(function(custItemLists) {
            var shipmentDate = new Date(params.shipmentDate).setFullYear(new Date().getFullYear());
            var filename = stringFormat(config.ShipmentInvoiceFilename, params.batchNum, moment(shipmentDate).format('MM-DD-YYYY'));
            return createShipmentInvoice(custItemLists, filename, params);
        });
    }

    function createCustomerShippingAddress(customerShippingAddresses, filename){
        var workbook = excelWriter.writeCustomerShippingAddress(customerShippingAddresses);
        return dropboxService.uploadWorkbook(workbook, filename);
    }

    function createBatchInvoice(customerItemLists, filename){
        var workbook = excelWriter.writeBatchInvoice(customerItemLists);
        return dropboxService.uploadWorkbook(workbook, filename);
    }

    function createShipmentInvoice(customerItemLists, filename, params){
        var workbook = excelWriter.writeShipmentInvoice(customerItemLists, params);
        return dropboxService.uploadWorkbook(workbook, filename);
    }

    function _getShipmentScheduleCore(data, params) {
        var grouped = _parseShipmentSchedule(data, params);

        var text = '';
        var newline = '\n';
        Object.keys(grouped).forEach(function(courier){
            text += courier + newline;
            grouped[courier].forEach(function(cil){
                text += cil.Name + newline;
                if(cil.Notes) {
                    text += ' - ' + stringFns.removeExtraWhitespace(cil.Notes) + newline;
                }
            });
            text += newline;
        });

        return text;
    }

    function _getShipmentScheduleHtmlCore(data, params) {
        var grouped = _parseShipmentSchedule(data, params);

        var text = '';
        var newline = '<br><br>';
        Object.keys(grouped).forEach(function(courier){
            text += stringFns.underlineText(stringFns.boldText(courier)) + newline;
            grouped[courier].forEach(function(cil){
                text += cil.Name;
                if(cil.Notes) {
                    text += ' - ' + stringFns.removeExtraWhitespace(cil.Notes) + newline;
                } else {
                    text += newline;
                }
            });
            text += newline;
        });

        return text;
    }

    function _parseShipmentSchedule(data, params) {
        var workbook = excelWrapper.readXlsx(data);
        var batchNums = params.batchNums.split(' ');

        var custItemLists = [];
        batchNums.forEach(function(num) {
            var worksheet = workbook.Sheets['BATCH ' + num];
            var results = excelWrapper.parseWorksheetToModel(worksheet, CustomerItemList);
            custItemLists = custItemLists.concat(results);
        });

        var filtered = _.filter(custItemLists, function(o){
            var deliveryDate = new Date(o.DeliveryDate);
            var targetDate = new Date(params.targetDate);

            return targetDate.getDate() === deliveryDate.getDate() && targetDate.getMonth() === deliveryDate.getMonth();
        });

        var unique = _.uniq(filtered, function(o){
            return o.Name;
        });

        return _.groupBy(unique, 'Courier');
    }

    var CustomerItemList = function () {
        this.Placement = null;
        this.Name = null;
        this.Code = null;
        this.ItemName = null;
        this.Box = null;
        this.MSRP = null;
        this.SoldPrice = null;
        this.DP = null;
        this.Balance = null;
        this.DeliveryDate = null;
        this.Courier = null;
        this.Notes = null;
        this.SampaiInvoice = null;
        this.Quantity = null;
    };

    var MasterCustomerAddress = function () {
        this.Name = null;
        this.Address = null;
        this.PhoneNumber = null;
    };

    var CustomerShippingAddress = function(placement, boxNo, itemName, itemCode, custName, address, phoneNo, shippingVia) {
        this.Placement = placement;
        this.BoxNo = boxNo;
        this.ItemName = itemName;
        this.ItemCode = itemCode;
        this.CustomerName = custName;
        this.Address = address;
        this.PhoneNo = phoneNo;
        this.ShippingVia = shippingVia;
    };

})(module.exports);
