// main_controller.js

const { exec } = require('child_process');

// const sura_no = [41, 42, 43, 44]; // Array of sura numbers

// In this array, to start counting from 71-80, set value to 80 as const numOfSuras = 80;
// set let index = 70
// Dynamically generating the sura_no array

const numOfSuras = 114; // Set this to the number of suras you want to process, e.g., 100+
const sura_no = Array.from({ length: numOfSuras }, (_, i) => i + 1); // This creates an array [1, 2, ..., numOfSuras]

let index = 0;

// Helper function to introduce a delay (in milliseconds)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const processSura = () => {
  if (index < sura_no.length) {
    const s_no = sura_no[index];
    const url = `http://localhost/web_scrap/getContents/pages/page_${s_no}/quran.com/${s_no}.html`;

    // Call the puppeteer script with the URL and sura_no as arguments
    exec(`node puppeteer_processor.js ${s_no} ${url}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing sura ${s_no}: ${error.message}`);
      } else {
        console.log(`Successfully processed data for sura ${s_no}. Output: ${stdout}`);
      }
    });

    // Move to the next URL after 6 seconds
    index++;
    setTimeout(processSura, 6000); // Call the next sura after 6 seconds
  } else {
    console.log("All suras processed.");
  }
};

// Start processing
processSura();
