// ##############################
// variables used to load data from local files
// #############################
import fs from 'fs';
import path from 'path';
import * as d3 from 'd3';

function getTsvDataFromDisk(dir) {
  const dataDirectory = path.join(process.cwd(), dir)
  const fileNames = fs.readdirSync(dataDirectory)

  const allData = fileNames.map(fileName => {

    const id = fileName.replace(/\.tsv$/, '')
    const fullPath = path.join(dataDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    console.log(fileContents)

    const parsed_csv = d3.tsv.parseRows(fileContents)
    const headings = parsed_csv.shift()
    // Combine the data with the id
    return {
        id,
        headings,
        'table': parsed_csv
    }
  })
  //const result = allData.reduce(function(map, obj) {
  //  map[obj.id] = obj.val;
  //  return map;
  //}, {});

  return allData
}

module.exports = {
  getTsvDataFromDisk
};
