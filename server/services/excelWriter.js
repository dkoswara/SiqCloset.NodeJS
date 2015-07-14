(function (exports) {
    'use strict';
    var Excel = require('exceljs');
    var _ = require('lodash');
    var stringFormat = require('string-format');
    var moment = require('moment');

    var boldArial = { name: 'Arial', size: 10, bold: true };
    var boldCalibri = { name: 'Calibri', size: 11, bold: true };
    var arial = { name: 'Arial', size: 10 };
    var thousandSeparator = '#,##0';
    var usCurrency = '$#,##0.00';
    var topThinBorder = { top: {style: 'thin'} };
    var leftAlignment = { horizontal: 'left' };

    exports.writeCustomerShippingAddress = writeCustomerShippingAddress;
    exports.writeBatchInvoice = writeBatchInvoice;
    exports.writeShipmentInvoice = writeShipmentInvoice;

    function writeBatchInvoice(customerItemLists) {
        var workbook = _buildWorkbook(createHeader, createBody);
        return workbook;

        function createHeader(rows) {
            rows.push(new ExcelRow(1, null, null, ['Tax Rate', 1.09]));
            rows.push(new ExcelRow(2, null, null, ['IDR Currency', 13300]));
            rows.push(new ExcelRow(4, null, null, ['Customer Name', 'Item Name', 'MSRP', 'MSRP + Tax', 'MSRP + Tax in IDR',	'Shipping',	'Price + Shipping',	'Fees', 'Price + Shipping + Fees', 'Sold Price', 'Actual Profit', 'Ratio', 'DP', 'Balance']));
        }

        function createBody(rows) {
            var thousandSeparatorStyle = new ExcelStyle(null, null, thousandSeparator);
            var sortedByName = _.sortBy(customerItemLists, 'Name');
            var currRow = 6;
            var currRowStr = currRow.toString();
            sortedByName.forEach(function(o) {
                var cells = [
                    new ExcelCell('A', o.Name),
                    new ExcelCell('B', o.ItemName),
                    new ExcelCell('C', o.MSRP),
                    new ExcelCell('D', {formula: 'C' + currRowStr + '*' + 'B1'}),
                    new ExcelCell('E', {formula: 'D' + currRowStr + '*' + 'B2'}, thousandSeparatorStyle),
                    new ExcelCell('F', '', thousandSeparatorStyle),
                    new ExcelCell('G', {formula: 'E' + currRowStr + '+' + 'F' + currRowStr}, thousandSeparatorStyle),
                    new ExcelCell('H', '', thousandSeparatorStyle),
                    new ExcelCell('I', {formula: 'G' + currRowStr + '+' + 'H' + currRowStr}, thousandSeparatorStyle),
                    new ExcelCell('J', o.SoldPrice, thousandSeparatorStyle),
                    new ExcelCell('K', {formula: 'J' + currRowStr + '-' + 'G' + currRowStr}, thousandSeparatorStyle),
                    new ExcelCell('L', {formula: 'I' + currRowStr + '/' + 'B2' + '/' + 'D' + currRowStr}),
                    new ExcelCell('M', o.DP, thousandSeparatorStyle),
                    new ExcelCell('N', {formula: 'J' + currRowStr + '-' + 'M' + currRowStr}, thousandSeparatorStyle)
                ];
                var row = new ExcelRow(currRow, null, cells);
                rows.push(row);

                currRow++;
                currRowStr = currRow.toString();
            });
        }
    }

    function writeShipmentInvoice(customerItemLists, params) {
        var workbook = _buildWorkbook(createHeader, createBody);
        return workbook;

        function createHeader(rows) {
            var shipmentDate = new Date(params.shipmentDate).setFullYear(new Date().getFullYear());
            var cells = [
                new ExcelCell('F', 'Invoice Shipment ' + moment(shipmentDate).format('MMMM DD, YYYY')),
                new ExcelCell('G', 'MARKING DARWINHBP/BY AIR VIA BALI')
            ];
            var row = new ExcelRow(2, new ExcelStyle(boldCalibri), cells);
            rows.push(row);
        }

        function createBody(rows) {
            var groupedByBox = _.groupBy(customerItemLists, 'Box');
            var currRow = 4;
            Object.keys(groupedByBox).forEach(function(boxNo) {
                rows.push(new ExcelRow(currRow++, new ExcelStyle(boldCalibri), [new ExcelCell('E', 'Box ' + boxNo)]));

                var box = params.boxes.filter(function(o) {
                    return parseInt(o.boxNo) === parseInt(boxNo);
                })[0];

                rows.push(new ExcelRow(currRow++, null, [new ExcelCell('F', 'Tracking Number'), new ExcelCell('G', box.trackingNumber)]));
                rows.push(new ExcelRow(currRow++, null, [new ExcelCell('F', 'Weight'), new ExcelCell('G', box.weight + ' kg')]));

                var latestEstDeliveryDate = new Date(box.latestEstDeliveryDate).setFullYear(new Date().getFullYear());
                rows.push(new ExcelRow(currRow++, null, [new ExcelCell('F', 'Latest estimated delivery date'), new ExcelCell('G', moment(latestEstDeliveryDate).format('dddd, MMM DD YYYY'))]));

                rows.push(new ExcelRow(currRow++, null, [new ExcelCell('F', 'Shipping Cost'), new ExcelCell('G', parseFloat(box.shippingCost), new ExcelStyle(null, null, usCurrency, leftAlignment))]));

                currRow++;

                rows.push(new ExcelRow(currRow++, new ExcelStyle(boldCalibri), [new ExcelCell('G', 'Price in USD'), new ExcelCell('H', 'Qty')]));

                var startRowForSum = currRow;
                var sortedByCode = _.sortBy(groupedByBox[boxNo], 'Code');
                sortedByCode.forEach(function(o){
                    var values = ['', '', '', '', o.Code, o.ItemName, o.SampaiInvoice, o.Quantity];
                    var subRow = new ExcelRow(currRow++, null, null, values);
                    rows.push(subRow);
                });
                var endRowForSum = currRow - 1;
                var cells = [
                    new ExcelCell('F', 'Total', new ExcelStyle(null, topThinBorder, null)),
                    new ExcelCell('G', { formula: stringFormat('SUM(G{0}:G{1})', startRowForSum.toString(), endRowForSum.toString()) }, new ExcelStyle(null, topThinBorder, null))
                ];
                var sumRow = new ExcelRow(currRow++, null, cells);
                rows.push(sumRow);

                currRow++;
            });
        }
    }

    function writeCustomerShippingAddress(customerShippingAddresses) {
        var workbook = _buildWorkbook(createHeader, createBody);
        return workbook;

        function createHeader(rows) {
            var values = ['', '', 'Item', 'Buyer', 'Address', 'Telp', 'Shipping Via'];
            var row = new ExcelRow(2, new ExcelStyle(boldArial), null, values);
            rows.push(row);
        }

        function createBody(rows){
            var boxes = _.groupBy(customerShippingAddresses, 'BoxNo');
            var currRow = 4;

            Object.keys(boxes).forEach(function(boxNo){
                var cells = [new ExcelCell('B', 'Box ' + boxNo)];
                var row = new ExcelRow(currRow++, new ExcelStyle(boldArial), cells);
                rows.push(row);
                var sortedByName = _.sortBy(boxes[boxNo], 'CustomerName');
                currRow++;
                sortedByName.forEach(function(box){
                    var values = [box.Placement || '', box.ItemCode, box.ItemName, box.CustomerName, box.Address, box.PhoneNo];
                    var row = new ExcelRow(currRow++, new ExcelStyle(arial), null, values);
                    rows.push(row);
                });
                currRow++;
            });
        }
    }

    function _buildWorkbook(createHeaderFn, createBodyFn) {
        var workbook = new Excel.Workbook();
        var worksheet = workbook.addWorksheet('Sheet1');
        var rows = [];
        createHeaderFn(rows);
        createBodyFn(rows);

        _buildWorksheet(worksheet, rows);
        _autoAdjustColWidth(worksheet);

        return workbook;
    }

    function _buildWorksheet(ws, rows) {
        rows.forEach(function(r) {
            var row = ws.getRow(r.number);

            if(r.values.length > 0) {
                row.values = r.values;
            }

            r.cells.forEach(function(c) {
                var cell = row.getCell(c.column);
                if(!cell.value) { cell.value = c.value; }
                if(c.style) {
                    Object.keys(c.style).forEach(function(k){
                        var val = c.style[k];
                        if (val) { cell[k] = val; }
                    });
                }
            });

            //have to apply row style last
            if(r.style && r.style.font) {
                row.font = r.style.font;
            }
        });
    }

    function _autoAdjustColWidth(ws) {
        ws.columns.forEach(function(col){
            var maxWidth = 8;
            col.eachCell(function(cell, rowNumber){
                var length = cell.value ? cell.value.toString().length : 0;
                if(length > maxWidth) {
                    maxWidth = length;
                }
            });
            col.width = maxWidth;
        });
    }

    var ExcelRow = function(number, style, cells, values) {
        this.number = number;
        this.style = style;
        this.cells = cells || [];
        this.values = values || []; //contiguous values. will populate columns in order.
    };

    var ExcelCell = function(col, val, style) {
        this.column = col;
        this.value = val;
        this.style = style;
    };

    var ExcelStyle = function(font, border, numFmt, alignment) {
        this.font = font;
        this.border = border;
        this.numFmt = numFmt;
        this.alignment = alignment;
    };

})(module.exports);