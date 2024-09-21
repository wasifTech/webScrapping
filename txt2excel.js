// txt2excel.js 

const fs = require('fs');
const xlsx = require('xlsx');

// Read the text file
const data = fs.readFileSync('verses_data.txt', 'utf-8');

// Split the data into lines
const lines = data.split('\n');

// Arrays to store extracted data
let urlsData = [];
let versesData = {};
let currentSura = null;

// Iterate over the lines and extract URLs and suras
lines.forEach(line => {
  line = line.trim();
  
  // Extract URL
  if (line.startsWith('URL:')) {
    const url = line.replace('URL:', '').trim();
    urlsData.push(url);
  }

  // Extract sura number and initialize new sura column in versesData
  else if (line.startsWith('sura_')) {
    currentSura = line;
    if (!versesData[currentSura]) {
      versesData[currentSura] = [];
    }
  }

  // Extract verse numbers for the current sura
  else if (currentSura && line !== '') {
    versesData[currentSura].push(line);
  }
});

// Create a new workbook
let wb = xlsx.utils.book_new();

// Sheet 1: URLs
let urlSheetData = urlsData.map((url, index) => ({
  uID: index + 1,
  URL: url
}));
let urlSheet = xlsx.utils.json_to_sheet(urlSheetData, { header: ["uID", "URL"] });
xlsx.utils.book_append_sheet(wb, urlSheet, 'URLs');

// Sheet 2: Verses
let verseSheetData = [];
let headers = Object.keys(versesData);
let maxVerses = Math.max(...headers.map(sura => versesData[sura].length));

// Prepare headers and verse rows
for (let i = 0; i < maxVerses; i++) {
  let row = {};
  headers.forEach(header => {
    row[header] = versesData[header][i] || ''; // Fill missing rows with empty strings
  });
  verseSheetData.push(row);
}

let verseSheet = xlsx.utils.json_to_sheet(verseSheetData, { header: headers });
xlsx.utils.book_append_sheet(wb, verseSheet, 'Verses');

// Write the workbook to a file
xlsx.writeFile(wb, 'myQdata.xlsx');

console.log('Excel file has been created successfully.');

