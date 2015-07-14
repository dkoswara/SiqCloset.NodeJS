(function () {
    'use strict';

    //to export as a constructor function
    module.exports = Workbook;

    function Workbook(){
        if(!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }

    Workbook.prototype.insertWorksheet = insertWorksheet;

    function insertWorksheet(worksheet){
        this.SheetNames.push(worksheet.name);
        this.Sheets[worksheet.name] = worksheet;
    }

})();