(function (exports) {
    'use strict';

    exports.arrBuff2BinStr = arrBuff2BinStr;
    exports.binStr2ArrBuf = binStr2ArrBuf;

    function arrBuff2BinStr(arraybuffer){
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");
        return bstr;
    }

    function binStr2ArrBuf(binStr) {
        var buf = new ArrayBuffer(binStr.length);
        var view = new Uint8Array(buf);
        for (var i=0; i!=binStr.length; ++i) view[i] = binStr.charCodeAt(i) & 0xFF;
        return buf;
    }

})(module.exports);