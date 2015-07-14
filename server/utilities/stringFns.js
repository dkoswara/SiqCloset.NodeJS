(function (exports) {
    'use strict';

    exports.removeExtraWhitespace = removeExtraWhitespace;
    exports.boldText = boldText;
    exports.underlineText = underlineText;
    exports.getUppercaseLetter = getUppercaseLetter;

    function getUppercaseLetter(num) {
        return String.fromCharCode(65 + num);
    }

    function removeExtraWhitespace(strVal){
        return strVal.replace(/^\s+|\s+$|\s+(?=\s)/g, '');
    }

    function boldText(text) {
        return '<b>' + text + '</b>';
    }

    function underlineText(text) {
        return '<u>' + text + '</u>';
    }

})(module.exports);
