'use strict';

var assert = require('assert');
var sinon = require('sinon');
var mongoose = require('mongoose');
var Promise = require('bluebird');

//Server tests that require mongodb and server.js to run
describe('Server tests - Online', function(){

    this.timeout(10000);

    mongoose.connect('mongodb://localhost:27017/siqcloset');

    describe('Routes', function(){
        var request = require('request');
        //this is to persist cookies and sessions across multiple requests
        request = request.defaults({jar: true});
        var promisifiedRequest = Promise.promisifyAll(request);

        it('should successfully ping server', function(){
            return promisifiedRequest.getAsync('http://localhost:3000/ping').then(function(results){
                var response = results[0];
                var msg = results[1];
                assert.equal(response.statusCode, 200);
                assert.equal(msg, 'pong');
            });
        });

        it('should successfully ping server when authenticated and authorized', function(){
            var postOpts = {
                form: {
                    username: 'demo',
                    password: 'christ_is_enough'
                }
            };

            return promisifiedRequest.postAsync('http://localhost:3000/login', postOpts).then(function(){
                return promisifiedRequest.getAsync('http://localhost:3000/pingAuth').then(function(results){
                    var response = results[0];
                    var msg = results[1];
                    assert.equal(response.statusCode, 200);
                    assert.equal(msg, 'pongAuth');
                });
            });
        });

        it('should retrieve list of missing customers', function(){
            var opts = {
                qs: {
                    batchNum: 190
                },
                json: true
            };

            return promisifiedRequest.getAsync('http://localhost:3000/excel/missing-customers', opts).then(function(results){
                var response = results[0];
                var collection = results[1];
                assert.equal(response.statusCode, 200);
                assert(collection.length > 0);
            });
        });
    });

    describe('Repository', function(){
        var repo = require('../server/services/repository');

        it('should stub getSmtpSettings', function(){
            sinon.stub(repo, 'getSmtpSettings', function(){
                return Promise.resolve('foo');
            });

            return repo.getSmtpSettings().then(function(res){
                assert.equal(res, 'foo');
            });
        });

        afterEach(function(){
            repo.getSmtpSettings.restore();
        });
    });

    describe('MailService', function(){
        var nodemailer = require('nodemailer');
        var mailService = require('../server/services/mailService');
        var repo = require('../server/services/repository');
        var actualMailOptions;
        var mockTransporter = {};

        mockTransporter.sendMail = function (mo, cb) {
            actualMailOptions = mo;
            cb(null, {response: 'ok'});
        };
        sinon.spy(mockTransporter, 'sendMail');
        sinon.stub(nodemailer, 'createTransport').returns(mockTransporter);

        it('should send shipment tracking with correct emails', function(){
            var shipmentInfos = [{
                uspsTrackingNo: 'EZ12345678US',
                weight: 10,
                price: 100
            }];
            var params = {
                shipmentInfos: shipmentInfos,
                batchNum: 180
            };
            var repoSpy = sinon.spy(repo, 'getMailOptionsForTracking');
            return mailService.sendShipmentTracking(params).then(function(){
                return repoSpy.firstCall.returnValue.then(function(data){
                    var retrievedMailOptions = data[0];
                    assert.equal(retrievedMailOptions.toSendShipmentTracking, true);
                    assert.equal(actualMailOptions.to, retrievedMailOptions.to);
                    assert.equal(actualMailOptions.from, retrievedMailOptions.from);
                    assert.equal(actualMailOptions.cc, retrievedMailOptions.cc);
                });
            });
        });

        it('should send shipment schedule with correct emails', function(){
            var repoSpy = sinon.spy(repo, 'getMailOptionsForSchedule');
            return mailService.sendShipmentSchedule(new Date(), 'some text').then(function(){
                return repoSpy.firstCall.returnValue.then(function(data){
                    var retrievedMailOptions = data[0];
                    assert.equal(retrievedMailOptions.toSendShipmentSchedule, true);
                    assert.equal(actualMailOptions.to, retrievedMailOptions.to);
                    assert.equal(actualMailOptions.from, retrievedMailOptions.from);
                    assert.equal(actualMailOptions.cc, retrievedMailOptions.cc);
                });
            });
        });
    });

    describe('DropboxService', function(){
        var dropboxService = require('../server/services/dropboxService');
        var testFolder = 'DenisTest';
        var testPath = '/' + testFolder;

        it('should successfully write file', function(){
            return dropboxService.writeFile(testPath + '/denis_test.txt', 'this is a test from nodejs').then(function(res){
                assert(true);
            }).catch(function(err){
                assert.fail('error writing file to dropbox test folder', err);
            });
        });

        it('should create an excel workbook and upload it to dropbox test folder', function(){
            var excelWrapper = require('../server/services/excelWrapper');

            var worksheet = excelWrapper.createWorksheet('Sheet123');
            worksheet.setValue('A1', 55555);
            worksheet.setValue('A2', 11111);
            worksheet.setValue('A3', 'foobar');

            var workbook = excelWrapper.createWorkbook();
            workbook.insertWorksheet(worksheet);

            var arrayBuffer = excelWrapper.writeWorkbook(workbook);

            return dropboxService.writeFile(testPath + '/TestWorkbook.xlsx', arrayBuffer).then(function(){
                assert(true);
            }).catch(function(err){
                assert.fail('error uploading excel workbook to dropbox test folder', err);
            });
        });
    });
});