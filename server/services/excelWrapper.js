(function (exports) {
    'use strict';

    var XLSX = require('xlsx');
    var XLS = require('xlsjs');
    var Workbook = require('./Workbook');
    var Worksheet = require('./Worksheet');
    var arrayUtils = require('../utilities/arrayUtils');

    exports.parseWorksheetToModel = parseWorksheetToModel;
    exports.readXlsx = readXlsx;
    exports.readXls = readXls;
    exports.writeWorkbook = writeWorkbook;
    exports.createWorkbook = createWorkbook;
    exports.createWorksheet = createWorksheet;

    function readXlsx(data){
        return XLSX.read(data, {type: 'binary'});
    }

    function readXls(data){
        return XLS.read(data, {type: 'binary'});
    }

    function writeWorkbook(workbook){
        var wopts = { bookType:'xlsx', type:'binary' };
        var wbout = XLSX.write(workbook,wopts);
        return arrayUtils.binStr2ArrBuf(wbout);
    }

    function createWorkbook(){
        var workbook = new Workbook();
        return workbook;
    }

    function createWorksheet(name){
        var worksheet = new Worksheet(name);
        return worksheet;
    }

    function parseWorksheetToModel(worksheet, Model){
        var arrays = [];
        var objects = XLSX.utils.sheet_to_json(worksheet);
        objects.forEach(function(o){
            arrays.push(_convertToModel(o, Model));
        });
        return arrays;
    }

    function _convertToModel(val, Model) {
        var model = new Model();
        Object.keys(val).forEach(function(k){
            var theValue = val[k];
            if(_isString(theValue)) { theValue = theValue.trim(); }
            if(_isNumeric(theValue)) { theValue = parseFloat(theValue); }
            var correspondingKey = k.replace(/ /g,'');
            model[correspondingKey] = theValue;
        });
        return model;
    }

    function _isString(o) {
        return (typeof o === "string");
    }

    function _isNumeric(o) {
        return !isNaN(parseFloat(o)) && isFinite(o);
    }

})(module.exports);