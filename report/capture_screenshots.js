const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  // 1. Figure 1: Homepage
  console.log('1. Capturing Homepage...');
  await page.goto('http://localhost:5000/?page=home', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig1_homepage.png') });

  // 2. Figure 2: Assistant Form Initial State
  console.log('2. Capturing Assistant Initial State...');
  await page.goto('http://localhost:5000/?page=assistant', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig2_assistant_initial.png') });

  // 3. Figure 3: Autocomplete Dropdown
  console.log('3. Capturing Autocomplete Dropdown...');
  const inputs = await page.$$('input[type="text"]');
  if (inputs.length >= 2) {
    await inputs[0].click();
    await inputs[0].type('Samsung', { delay: 30 });
    await new Promise(r => setTimeout(r, 600));

    await inputs[1].click();
    await inputs[1].type('Galaxy A14', { delay: 30 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig3_autocomplete_dropdown.png') });
  }

  // 4. Figure 4: AI Diagnosis Result with Verified Pricing
  console.log('4. Generating & Capturing Diagnosis Result with Verified Pricing...');
  const diagRes1 = await fetch('http://localhost:5000/api/repair/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'smartphones',
      brand: 'Samsung',
      model: 'Galaxy A14 5G',
      problemDescription: 'The battery drops from 80% to 10% in under two hours and phone gets warm around back panel.'
    })
  });
  const data1 = await diagRes1.json();
  console.log('Diagnosis 1 received:', data1.diagnosis?.issue_title, 'Pricing:', !!data1.diagnosis?.verified_pricing);

  await page.goto('http://localhost:5000/?page=assistant', { waitUntil: 'networkidle0' });
  await page.evaluate((d) => window.__setDiagnosis(d), data1.diagnosis);
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig4_diagnosis_result.png') });

  // 5. Figure 5: Physical Bench Inspection Required (PMIC / Electrical Fault)
  console.log('5. Generating & Capturing Inspection Required State...');
  const diagRes2 = await fetch('http://localhost:5000/api/repair/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'smartphones',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      problemDescription: 'Phone suddenly shut down completely with burnt electronics smell and hot spot near PMIC logic board. Completely unresponsive to charger.',
      errorCode: 'PMIC_POWER_SHORT'
    })
  });
  const data2 = await diagRes2.json();
  console.log('Diagnosis 2 received:', data2.diagnosis?.issue_title, 'Bench inspection:', data2.diagnosis?.requires_bench_inspection);

  await page.goto('http://localhost:5000/?page=assistant', { waitUntil: 'networkidle0' });
  await page.evaluate((d) => window.__setDiagnosis(d), data2.diagnosis);
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig5_inspection_required.png') });

  // 6. Figure 6: Live Repair Cost Intelligence Engine
  console.log('6. Capturing Live Cost Intelligence Engine...');
  await page.goto('http://localhost:5000/?page=costs', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig6_costs_engine.png') });

  // 7. Figure 7: Multi-Tier Price Comparison (Apple iPhone 15 Pro Max)
  console.log('7. Searching iPhone 15 Pro Max and Capturing Pricing Matrix...');
  const searchInput = await page.$('input[placeholder*="Search" i], input[placeholder*="model" i]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('iPhone 15 Pro Max', { delay: 30 });
    await new Promise(r => setTimeout(r, 1200));
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig7_price_comparison.png') });

  // 8. Figure 8: Admin Dashboard
  console.log('8. Logging in as Admin & Capturing Admin Dashboard...');
  await page.goto('http://localhost:5000/?page=home', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('repairsathi_user', JSON.stringify({
      id: 'admin-uuid-001',
      name: 'System Admin',
      email: 'admin@repairsathi.ai',
      role: 'admin'
    }));
    localStorage.setItem('repairsathi_token', 'mock_admin_token_2026');
  });
  await page.goto('http://localhost:5000/?page=admin', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fig8_admin_dashboard.png') });

  console.log('Done! All screenshots captured successfully.');
  await browser.close();
}

run().catch(err => {
  console.error('Capture run failed:', err);
  process.exit(1);
});
