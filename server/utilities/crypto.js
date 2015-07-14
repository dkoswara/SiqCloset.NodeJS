(function(cryptoUtils){
    'use strict';

    cryptoUtils.encrypt = encrypt;
    cryptoUtils.decrypt = decrypt;

    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'sfdaset34534f';

    function encrypt(value){
        var cipher = crypto.createCipher(algorithm,password);
        var crypted = cipher.update(value,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    function decrypt(value){
        var decipher = crypto.createDecipher(algorithm,password);
        var dec = decipher.update(value,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }

})(module.exports);
