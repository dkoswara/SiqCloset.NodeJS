(function(model){
    'use strict';

    var modelNames = {
        SmtpSetting: 'SmtpSetting',
        MailOption: 'MailOption',
        User: 'User',
        Role: 'Role'
    };

    model.modelNames = modelNames;

    registerToDb();

    function registerToDb(){
        var mongoose = require('mongoose');

        var modelSchemas = [
            {
                name: modelNames.SmtpSetting,
                schema: {
                    serviceName: String,
                    username: String,
                    password: String
                }
            },
            {
                name: modelNames.MailOption,
                schema: {
                    from: String,
                    to: String,
                    cc: String,
                    toSendShipmentTracking: Boolean,
                    toSendShipmentSchedule: Boolean
                }
            },
            {
                name: modelNames.User,
                schema: {
                    username: String,
                    password: String,
                    email: String,
                    roles: [{type: mongoose.Schema.Types.ObjectId, ref: modelNames.Role}]
                }
            },
            {
                name: modelNames.Role,
                schema: {
                    name: String
                }
            }
        ];

        modelSchemas.forEach(registerSchema);

        function registerSchema(model){
            var ModelSchema = new mongoose.Schema(model.schema);
            mongoose.model(model.name, ModelSchema);
        }
    }
})(module.exports);