(function () {
    'use strict';

    //to export as a constructor function
    module.exports = Worksheet;

    function Worksheet(name){
        if(!(this instanceof Worksheet)) return new Worksheet();
        this.name = name;
        //set to large range and forget about it
        this.setRange('A1:Z100');
    }

    Worksheet.prototype.setRange = setRange;
    Worksheet.prototype.setValue = setValue;

    function setRange(range) {
        this['!ref'] = range;
    }

    function setValue(range, value){
        var cell = {
            v: value, t: null
        };

        if(typeof value == 'number') cell.t = 'n';
        if(typeof value == 'string') cell.t = 's';

        this[range] = cell;
    }

})();