const xlsx = require('xlsx');
const fs = require('fs');
const { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } = require('constants');

let zh = [
  './src/config/zh.json',
];
let en = [
  './src/config/en.json',
];
let defLanType = 'zh';
let sameSheet = true;


class JsonToExcel {
  constructor () {
    this.init();
    this.count = 0;
    this.totalFileLen = zh.length + en.length;
    this.sheetDataArr = [];
  }

  init () {
    this.readLanFiles(zh, 'zh');
    this.readLanFiles(en, 'en');
  }

  readLanFiles (_arr, _lanType) {
    let filePath, sheetData;
    for (let i in _arr) {
      filePath = _arr[i];
      fs.readFile(filePath, 'utf8', (err, data) => {
        this.count ++;
        if (!data) {
          return;
        }
        let jData = JSON.parse(data);
        sheetData = this.jsonToSheetData(jData, _lanType);
        this.sheetDataArr.push(sheetData);
        if (this.sheetDataArr.length === this.totalFileLen) {
          if (sameSheet) {
            this.jsonToExcelSameSheet();
          } else {
            this.jsonToExcelDiffSheet();
          }
        }
      });
    }
  }

  jsonToSheetData (_jsonData, _lanType) {
    var dataArr = [], perData;
    var sheetData;

    for (let i in _jsonData) {
      perData = {};
      perData.key = i;
      perData[_lanType] = _jsonData[i];
      dataArr.push(perData);
    }
    
    sheetData = dataArr;

    return sheetData;
  }

  jsonToExcelDiffSheet () {
    var sheet1, excel;
    excel = xlsx.utils.book_new();
    for (let i in this.sheetDataArr) {
      sheet1 = xlsx.utils.json_to_sheet(this.sheetDataArr[i]);
      xlsx.utils.book_append_sheet(excel, sheet1);
    }

    xlsx.writeFile(excel, 'out1.xlsx');
  }

  jsonToExcelSameSheet () {
    var sheet1, excel, totalSheetData, otherTotalSheetDataMap = {}, otherSheetDataArr = [], isFind = false, key = 'key';

    var perSheetData, perData, perSheetDataDetail;
    for (let i in this.sheetDataArr) {
      isFind = false;
      perSheetData = this.sheetDataArr[i];
      for (let j in perSheetData) {
        perSheetDataDetail = perSheetData[j];
        for (let m in perSheetDataDetail) {
          if (defLanType === m) {
            isFind = true;
            break;
          }
        }
        break;
      }
      
      if (isFind) {
        totalSheetData = this.sheetDataArr[i];
      } else {
        otherSheetDataArr.push(this.sheetDataArr[i]);
      }
    }

    let perTotalSheetData;
    for (let i in totalSheetData) {
      perTotalSheetData = totalSheetData[i];
      otherTotalSheetDataMap[perTotalSheetData.key] = {};
    }

    let otherSheetData, perOtherSheetData;
    for (let i in otherSheetDataArr) {
      otherSheetData = otherSheetDataArr[i];
      for (let j in otherSheetData) {
        perOtherSheetData = otherSheetData[j];
        for (let m in perOtherSheetData) {
          if (key !== m && !!otherTotalSheetDataMap[perOtherSheetData[key]]) {
            otherTotalSheetDataMap[perOtherSheetData[key]][m] = perOtherSheetData[m];
          }
        }
      }
    }

    for (let i in totalSheetData) {
      perData = totalSheetData[i];
      if (!!otherTotalSheetDataMap[perData[key]]) {
        for (let j in otherTotalSheetDataMap[perData[key]]) {
          perData[j] = otherTotalSheetDataMap[perData[key]][j];
        }
      }
    }
    sheet1 = xlsx.utils.json_to_sheet(totalSheetData);
    excel = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(excel, sheet1);
    xlsx.writeFile(excel, 'out.xlsx');
  }
}

module.exports = JsonToExcel;