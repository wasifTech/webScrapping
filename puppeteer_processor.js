//  puppeteer_processor.js

const puppeteer = require('puppeteer');
const fs = require('fs');

// Get sura_no and URL from command-line arguments
const s_no = process.argv[2];
const url = process.argv[3];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log(`Processing sura ${s_no} at URL: ${url}`);
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
      fs.appendFileSync(textFilePath, `sura_${s_no}\n`);
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

  await browser.close();
})();
