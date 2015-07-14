'use strict';

var assert = require('assert');
var stringFormat = require('string-format');
var moment = require('moment');

//Server tests that don't require mongodb and server.js to run
describe('Server tests - Offline', function(){
    this.timeout(20000);

    var dropboxService = require('../server/services/dropboxService');
    var excelService = require('../server/services/excelService');
    var excelWrapper = require('../server/services/excelWrapper');
    var testPath = '/DenisTest';

    dropboxService.setRootPath(testPath);

    //describe('Updating Worksheet', function(){
    //    it.only('should read and update worksheet', function(){
    //        var testPath2 = 'C:/DK/Dropbox/DenisTest';
    //        var Excel = require('exceljs');
    //        var workbook = new Excel.Workbook();
    //        return workbook.xlsx.readFile(testPath2 + '/CustomerItemList.xlsx').then(function(){
    //            var sheet = workbook.getWorksheet('BATCH 190');
    //            var cell = sheet.getCell('B4');
    //            cell.value += '_new';
    //            return workbook.xlsx.writeFile(testPath2 + '/CustomerItemList.xlsx');
    //        });
    //    });
    //});

    describe('ExcelService', function(){
        it('should read and parse CustomerItemList to get shipment schedule in html format', function(){
            return excelService.getShipmentScheduleHtml({batchNums: '188 189', targetDate: '4/10'}).then(function(htmlText){
                assert(htmlText !== '');
            }).catch(function(err){
                assert.fail('error read and parse CustomerItemList', err);
            });
        });

        it('should read and parse Master Customer Address', function(){
            return excelService.readMasterCustAddr().then(function(collection){
                assert(collection.length > 0);
            });
        });

        it('should get missing customers given batch number', function() {
            return excelService.getMissingCustomers(191).then(function(results){
                assert(results.length > 0);
                console.log(results);
            });
        });
    });

    describe('Create Excel reporting', function() {
        it('should create excel shipping address given a batch number', function() {
            var batchNum = 197;
            return excelService.buildCustomerShippingAddress(batchNum);
        });

        it('should create excel batch invoice given a batch number', function() {
            var batchNum = 191;
            return excelService.buildBatchInvoice(batchNum);
        });

        it.only('should create excel shipment invoice given a batch number', function() {
            var boxOne = {
                boxNo: 1,
                trackingNumber: 'EZ019753740US',
                weight: '9.71',
                latestEstDeliveryDate: new Date('06/29').setFullYear(new Date().getFullYear()),
                shippingCost: 169.95
            };

            var boxTwo = {
                boxNo: 2,
                trackingNumber: 'EZ019753784US',
                weight: '11.44',
                latestEstDeliveryDate: new Date('05/27').setFullYear(new Date().getFullYear()),
                shippingCost: 171.60
            };

            var params = {
                batchNum: 202,
                shipmentDate: new Date('06/19').setFullYear(new Date().getFullYear()),
                boxes: [boxOne]
            };

            return excelService.buildShipmentInvoice(params);
        });
    });

    describe('ExcelJS', function(){
        var Excel = require('exceljs');
        var fs = require('fs');

        it('should write a workbook and upload to dropbox', function(){
            var workbook = new Excel.Workbook();
            var worksheet = workbook.addWorksheet('Sheet1');
            worksheet.getCell('A1').value = 'foo';
            worksheet.getCell('A1').font = { bold: true };

            worksheet.getCell('A2').value = 1;
            worksheet.getCell('A3').value = 2;
            worksheet.getCell('A4').value = {formula: 'A2 + A3'};
            worksheet.getCell('A5').value = {formula: 'SUM(A2:A4)'};

            return workbook.xlsx.writeFile('exceljs_test.xlsx').then(function(){
                console.log('write done');
                var data = fs.readFileSync('exceljs_test.xlsx');
                return dropboxService.writeFile(testPath + '/exceljs_test.xlsx', data).then(function(){
                    fs.unlink('exceljs_test.xlsx');
                    console.log('upload done');
                });
            });
        });

        it('should write a workbook and upload to dropbox using MemoryStream', function(done){
            var MemStream = require('../server/utilities/MemoryStream');

            var workbook = new Excel.Workbook();
            var worksheet = workbook.addWorksheet('Sheet1');
            worksheet.getCell('A1').value = 'bar';
            worksheet.getCell('A1').font = { bold: true };

            worksheet.getCell('A2').value = 3;
            worksheet.getCell('A3').value = 4;
            worksheet.getCell('A4').value = {formula: 'A2 + A3'};
            worksheet.getCell('A5').value = {formula: 'SUM(A2:A4)'};

            var memStream = new MemStream('foo');
            memStream.on('finish', function () {
                console.log('finished writing');
                dropboxService.writeFile(testPath + '/exceljs_test_memStream.xlsx', memStream.memStore['foo']).then(function(){
                    done();
                });
            });

            workbook.xlsx.write(memStream).then(function(){
                console.log('xlsx write done');
            });
        });
    });
});