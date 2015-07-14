/*
* Service to retrieve a mongoDB client using node.js native mongoDB package called 'mongodb'
* See http://mongodb.github.io/node-mongodb-native/2.0/
* This is required to use breeze-mongodb package for breeze interaction with mongoDB
* */

(function (exports) {
    'use strict';
    var Q = require('q');
    var mongoDb;

    exports.getDb = getDb;

    function getDb(mongoDbConnString) {
        if(mongoDb) { return Q.when(mongoDb); }

        var mongoOptions = {
            server: {auto_reconnect: true}
        };

        var MongoClient = require('mongodb').MongoClient;

        var deferred = Q.defer();
        MongoClient.connect(mongoDbConnString, mongoOptions, function(err, db) {
            if(err) {
                deferred.reject(new Error(err));
            } else {
                mongoDb = db;
                deferred.resolve(mongoDb);
            }
        });
        return deferred.promise;
    }

})(module.exports);
