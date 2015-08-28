(function (exports) {
    'use strict';

    var Dropbox = require('dropbox');
    var Promise = require('bluebird');
    var MemStream = require('../utilities/MemoryStream');
    var appSettings = require('../appSettings');
    var repository = require('repository');

    var client = null;
    var accessToken = null;
    var rootPath = '';

    if(appSettings.env === 'development') { setRootPath('/DenisTest'); }

    exports.setRootPath = setRootPath;
    exports.getClient = getClient;
    exports.readFile = readFile;
    exports.writeFile = writeFile;
    exports.uploadWorkbook = uploadWorkbook;

    function setRootPath(path) {
        rootPath = path + '/';
    }

    function uploadWorkbook(workbook, filename){
        var memStream = new MemStream(filename);

        return new Promise(function(resolve){
            memStream.on('finish', function () {
                writeFile(filename, memStream.memStore[filename]).then(function(){
                    resolve();
                });
            });
            workbook.xlsx.write(memStream);
        });
    }

    function readFile(fileName) {
        return new Promise(function(resolve, reject){
            getClient().then(function(client){
                client.readFile(rootPath + fileName, { arrayBuffer: true }, function(error, data) {
                    if(error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
    }

    function writeFile(fileName, data) {
        return new Promise(function(resolve, reject){
            getClient().then(function(client){
                client.writeFile(rootPath + fileName, data, function(error, stat) {
                    if(error) {
                        reject(error);
                    } else {
                        resolve(stat);
                    }
                });
            });
        });
    }

    function getClient() {
        if (client && client.isAuthenticated()) { return Promise.resolve(client); }
        return getAccessToken().then(getClientCore);

        function getAccessToken() {
            return repository.getDropboxSettings().then(success, fail);

            function success(results) {
                accessToken = results[0].accessToken;
                return true;
            }

            function fail(error) {
                console.log(error);
                return false;
            }
        }

        function getClientCore() {
            return new Promise(function(resolve, reject){
                client = new Dropbox.Client({ token: accessToken });
                client.authenticate(function(error, client) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(client);
                    }
                });
            });
        }
    }

})(module.exports);
