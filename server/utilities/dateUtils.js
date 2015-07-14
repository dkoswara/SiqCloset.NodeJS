(function (exports) {
    'use strict';

    var indoWeekdays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumaat', 'Sabtu'];

    exports.getIndoDays = getIndoDays;

    function getIndoDays(day) {
        return indoWeekdays[day];
    }

})(module.exports);