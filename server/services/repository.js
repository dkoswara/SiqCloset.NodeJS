(function(repository){
    'use strict';

    var mongoose = require('mongoose');
    var Q = require('q');
    var model = require('../model');
    var cryptoUtils = require('../utilities/crypto');

    var SmtpSettings = mongoose.model(model.modelNames.SmtpSetting);
    var MailOptions = mongoose.model(model.modelNames.MailOption);
    var User = mongoose.model(model.modelNames.User);
    var Role = mongoose.model(model.modelNames.Role);

    repository.createDefaultAdmin = createDefaultAdmin;
    repository.createDefaultDemoUser = createDefaultDemoUser;
    repository.findUser = findUser;

    repository.getSmtpSettings = getSmtpSettings;
    repository.getMailOptions = getMailOptions;
    repository.getDefaultMailOptions = getDefaultMailOptions;
    repository.getMailOptionsForTracking = getMailOptionsForTracking;
    repository.getMailOptionsForSchedule = getMailOptionsForSchedule;
    repository.getUsers = getUsers;
    repository.getRoles = getRoles;

    repository.saveSmtpSetting = saveSmtpSetting;
    repository.saveMailOptions = saveMailOptions;
    repository.saveUsers = saveUsers;
    repository.saveRoles = saveRoles;

    function getSmtpSettings(){
        return SmtpSettings.find(null).exec();  //this will get all entities
    }

    function getMailOptions(){
        return MailOptions.find(null).exec();  //this will get all entities
    }

    function getDefaultMailOptions() {
        return MailOptions.find({isDefault: true}).exec();
    }

    function getMailOptionsForTracking() {
        return MailOptions.find({toSendShipmentTracking: true}).exec();
    }

    function getMailOptionsForSchedule() {
        return MailOptions.find({toSendShipmentSchedule: true}).exec();
    }

    function getUsers(){
        return User.find(null).exec();  //this will get all entities
    }

    function getRoles(){
        return Role.find(null).exec();  //this will get all entities
    }

    function findUser(email, username, password){
        if(email) {
            return User.findOne({email: email}).populate('roles').exec();
        }

        var encrypted = cryptoUtils.encrypt(password);
        return User.findOne({username: username, password: encrypted}).populate('roles').exec();
    }

    function getAdmin(){
        return User.findOne({email: 'dkoswara@gmail.com'}).populate('roles').exec();
    }

    function getDemoUser(){
        return User.findOne({username: 'demo'}).populate('roles').exec();
    }

    function createDefaultAdmin() {
        return getAdmin().then(function(admin){
            if(!admin) {
                return createAdminRole().then(function(adminRole){
                    var newDefaultAdmin = [
                        {
                            email: 'dkoswara@gmail.com',
                            roles: [
                                adminRole
                            ]
                        }
                    ];
                    return User.create(newDefaultAdmin).then(function(defaultAdmin){
                        return defaultAdmin;
                    });
                })
            } else {
                return admin;
            }
        });
    }

    function createDefaultDemoUser() {
        return getDemoUser().then(function(demoUser){
            if(!demoUser) {
                return createAdminRole().then(function(adminRole){
                    var newDemoUser = [
                        {
                            username: 'demo',
                            password: cryptoUtils.encrypt('christ_is_enough'),
                            roles: [
                                adminRole
                            ]
                        }
                    ];
                    return User.create(newDemoUser).then(function(defaultDemoUser){
                        return defaultDemoUser;
                    });
                })
            } else {
                return demoUser;
            }
        });
    }

    function createAdminRole() {
        var defaultAdminRole = [{name: 'admin'}]
        return Role.create(defaultAdminRole);
    }

    function saveSmtpSetting(data){
        data.password = cryptoUtils.encrypt(data.password);
        var newSmtpSetting = new SmtpSettings(data);

        var deferred = Q.defer();
        newSmtpSetting.save(function(err, results) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    }

    function saveMailOptions(data){
        var newMailOptions = new MailOptions(data);
        var deferred = Q.defer();
        newMailOptions.save(function(err, results) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    }

    function saveUsers(data){
        var newUser = new User(data);
        var deferred = Q.defer();
        newUser.save(function(err, results) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    }

    function saveRoles(data){
        var newRole = new Role(data);
        var deferred = Q.defer();
        newRole.save(function(err, results) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    }

})(module.exports);