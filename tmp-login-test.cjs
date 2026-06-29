const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[autocomplete="username"]', '12345678');
  await page.fill('input[autocomplete="current-password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  console.log('BODY_LEN:', (await page.textContent('body'))?.trim().length);
  console.log('ROOT_HTML:', (await page.locator('#root').innerHTML()).slice(0, 500));
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})().catch(e => { console.error('SCRIPT_ERR', e); process.exit(1); });
