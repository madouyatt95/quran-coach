import { chromium, devices } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.join(process.cwd(), 'screenshots_appstore');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR);
}

const APP_URL = 'http://localhost:4173';

const DEVICES = [
  { name: 'iPhone_15_Pro_Max', viewport: { width: 1290, height: 2796 }, deviceScaleFactor: 1 }, // Required 6.5" size is 1284 x 2778 or 1290 x 2796
  { name: 'iPad_Pro_13', viewport: { width: 2048, height: 2732 }, deviceScaleFactor: 1 } // Required 13" size is 2068 x 2800 or 2048 x 2732
];

const PAGES = [
  { name: '01_Home', action: async (page) => { 
      await page.goto(APP_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); 
  }},
  { name: '02_Read', action: async (page) => { 
      await page.evaluate(() => {
        const link = document.querySelector('nav a[href="/read"]');
        if (link) link.click();
      });
      await page.waitForTimeout(2000); 
  }},
  { name: '03_Listen', action: async (page) => {
      await page.evaluate(() => {
        const link = document.querySelector('nav a[href="/listen"]');
        if (link) link.click();
      });
      await page.waitForTimeout(2000); 
  }},
  { name: '04_Hifdh', action: async (page) => { 
      await page.evaluate(() => {
        const link = document.querySelector('nav a[href="/hifdh"]');
        if (link) link.click();
      });
      await page.waitForTimeout(2000); 
  }},
  { name: '05_Quiz', action: async (page) => { 
      await page.evaluate(() => {
        const link = document.querySelector('nav a[href="/quiz"]');
        if (link) link.click();
      });
      await page.waitForTimeout(2000); 
  }}
];

async function captureScreenshots() {
  const browser = await chromium.launch();
  
  for (const device of DEVICES) {
    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      colorScheme: 'dark',
    });
    
    const page = await context.newPage();
    
    // Inject mock data to populate UI
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('quran-coach-settings', JSON.stringify({ state: { theme: 'dark' } }));
    });
    
    for (const appPage of PAGES) {
      console.log(`Capturing ${device.name} - ${appPage.name}...`);
      
      // Execute the navigation action
      await appPage.action(page);
      
      // Hide scrollbars for cleaner screenshots
      await page.addStyleTag({ content: '::-webkit-scrollbar { display: none; }' });
      
      const deviceDir = path.join(OUT_DIR, device.name);
      if (!fs.existsSync(deviceDir)) {
        fs.mkdirSync(deviceDir);
      }
      
      await page.screenshot({ 
        path: path.join(deviceDir, `${appPage.name}.png`),
        fullPage: false 
      });
    }
    await context.close();
  }
  
  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureScreenshots().catch(console.error);
