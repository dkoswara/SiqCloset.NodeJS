(function(mail){
    "use strict";

    var moment = require('moment');
    var nodemailer = require('nodemailer');
    var Q = require('q');
    var cryptoUtils = require('../utilities/crypto');
    var repository = require('./repository');
    var dateUtils = require('../utilities/dateUtils');

    // create reusable transporter object using SMTP transport
    var transporter = null;
    var mailOptions = null;

    mail.sendShipmentTracking = sendShipmentTracking;
    mail.sendShipmentSchedule = sendShipmentSchedule;

    function initForSendTracking() {
        return Q.all([initializeTransport(), initializeMailOptionsForTracking()]).then(function(results){
            return results[0] && results[1];
        });
    }

    function initForSendSchedule() {
        return Q.all([initializeTransport(), initializeMailOptionsForSchedule()]).then(function(results){
            return results[0] && results[1];
        });
    }

    function initializeTransport(){

        //we want to always get the latest for now
        //if (transporter) { return Q.when(true); }

        return repository.getSmtpSettings().then(success, fail);

        function success(results) {
            var transportInfo = {
                service: results[0].serviceName,
                auth: {
                    user: results[0].username,
                    pass: cryptoUtils.decrypt(results[0].password)
                }
            };
            transporter = nodemailer.createTransport(transportInfo);
            return true;
        }

        function fail(error) {
            console.log(error);
            return false;
        }
    }

    function initializeMailOptionsForTracking(){
        return repository.getMailOptionsForTracking().then(success, fail);
    }

    function initializeMailOptionsForSchedule(){
        return repository.getMailOptionsForSchedule().then(success, fail);
    }

    function success(results) {
        var config = {
            from: results[0].from,
            to: results[0].to,
            cc: results[0].cc
        };
        mailOptions = config;
        return true;
    }

    function fail(error) {
        console.log(error);
        return false;
    }

    //TODO: use template and retrieve info from db. Create a setup page for this
    function sendShipmentTracking(request) {

        return initForSendTracking().then(sendShipmentTrackingCore);

        function sendShipmentTrackingCore(){
            var shipmentInfos = request.shipmentInfos;
            var batchNum = request.batchNum;

            var text = '';
            shipmentInfos.forEach(function(val) {
                text += val.uspsTrackingNo + '. ' + val.weight + ' kg. $' + val.price + '\n';
            });
            text += '\nThanks,\nDenis';

            mailOptions.subject = 'Shipping Tracking Number Batch ' + batchNum;
            mailOptions.text = text;

            return sendMailCore(mailOptions);
        }
    }

    function sendShipmentSchedule(date, htmlText) {

        return initForSendSchedule().then(sendShipmentScheduleCore);

        function sendShipmentScheduleCore() {
            //in case the user doesn't supply year for the targetDate
            var targetDate = new Date(date);
            targetDate.setFullYear(new Date().getFullYear());

            mailOptions.subject = 'Kiriman ' + dateUtils.getIndoDays(targetDate.getDay()) + ' ' + moment(targetDate).format('D MMM');
            mailOptions.html = htmlText;

            return sendMailCore(mailOptions);
        }
    }

    function sendMailCore(mailOptions) {
        var deferred = Q.defer();
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                deferred.reject(new Error(error));
            } else{
                deferred.resolve(info.response);
            }
        });
        return deferred.promise;
    }

})(module.exports);