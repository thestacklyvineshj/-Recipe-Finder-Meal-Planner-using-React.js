// Requires: npx playwright install chromium && npm install playwright (or npx)
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
const base = 'http://localhost:3000';

const shots = [
  { url: '/', file: 'home.png', wait: 3000 },
  { url: '/recipes?category=Chicken', file: 'recipes.png', wait: 4000 },
  { url: '/recipes/52772', file: 'recipe-detail.png', wait: 4000 },
  { url: '/meal-planner', file: 'meal-planner.png', wait: 2000 }
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const { url, file, wait } of shots) {
  await page.goto(`${base}${url}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(outDir, file), fullPage: true });
  console.log('Saved', file);
}

await browser.close();
