(function () {
    'use strict';

    var stream = require('stream');
    var util = require('util');
    var Writable = stream.Writable;

    module.exports = MemoryStream;

    /* Writable memory stream */
    function MemoryStream(key, options) {
        // allow use without new operator
        if (!(this instanceof MemoryStream)) {
            return new MemoryStream(key, options);
        }
        Writable.call(this, options); // init super
        this.key = key; // save key
        this.memStore = { };
        this.memStore[key] = new Buffer(''); // empty
    }
    util.inherits(MemoryStream, Writable);

    MemoryStream.prototype._write = function (chunk, enc, cb) {
        // our memory store stores things in buffers
        var buffer = (Buffer.isBuffer(chunk)) ?
            chunk :  // already is Buffer use it
            new Buffer(chunk, enc);  // string, convert

        // concat to the buffer already there
        this.memStore[this.key] = Buffer.concat([this.memStore[this.key], buffer]);
        cb();
    };

})();