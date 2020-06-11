import xlsx from 'xlsx';
import fs from 'fs';


let jsonFiles = [
  'src/config/en.json',
  'src/config/zh.json',
];

export default class JsonToExcel {
  constructor () {
    this.init();
  }

  init () {
    let filePath;
    for (let i in jsonFiles) {
      filePath = jsonFiles[i];
      fs.readFile(filePath, 'utf8', (err, data) => {
        let jData = JSON.parse(data);
        for (let j in jData) {
          console.log(`${j}: ${jData[j]}`);
        }
      });
    }
  }
}