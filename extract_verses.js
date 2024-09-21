//  extract_verses.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util'); // Importing util to use promisified setTimeout

const delay = util.promisify(setTimeout); // Promisified delay function

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

//  const sura_no = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Array of sura numbers

  for (const s_no of sura_no) {
    const url = `http://localhost/web_scrap/getContents/pages/page_${s_no}/quran.com/${s_no}.html`;
    // Display the processing message in the console
    console.log(`Processing URL for sura ${s_no}: ${url}`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    try {
      // Wait for the verse list container to load
      await page.waitForSelector('.SidebarNavigation_verseListContainer__tE5ut', { timeout: 10000 });

      // Extract verse numbers
      const verseNumbers = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.SidebarNavigation_verseListContainer__tE5ut a')).map(a => {
          const match = a.href.match(/startingVerse=(\d+)/);
          return match ? match[1] : null;
        }).filter(Boolean); // Filter out null values if any
      });

      if (verseNumbers.length > 0) {
        console.log(`Verse numbers for sura ${s_no}:`, verseNumbers);

        // Write data to text file in the specified format
        const textFilePath = './verses_data.txt';
        fs.appendFileSync(textFilePath, `URL: ${url}\n`);
        fs.appendFileSync(textFilePath, `SURA Number : sura_${s_no}\n`);
        fs.appendFileSync(textFilePath, verseNumbers.join('\n') + '\n\n'); // Each verse on a new line
      } else {
        console.log(`No verse numbers found for sura ${s_no}.`);

        // Write "No verses found" to text file
        fs.appendFileSync('./verses_data.txt', `sura_${s_no}\nURL: ${url}\nNo verses found.\n\n`);
      }
    } catch (err) {
      console.log(`Error or no content for sura ${s_no}. Moving to the next sura.`);

      // Log error and move to the next sura in the text file
      fs.appendFileSync('./verses_data.txt', `sura_${s_no}\nURL: ${url}\nError: ${err.message}\n\n`);
    }

    // Pause for 2 seconds before processing the next sura
    await delay(2000); // Ensures a 2-second pause between sura processing
  }

  await browser.close();
})();
