// 선생님 화면에서 낱말 파일을 올리고 저장하는 흐름을 그대로 실행해, 저장된 단원 데이터를 출력합니다.
// 실행: node import-test.js <playwright-core 폴더> <낱말 파일> <제목> <결과 JSON 경로>
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright-core'));
const [, , , wordFile, title, outJson] = process.argv;
const body = fs.readFileSync(path.join(__dirname, '..', 'nalmal-playground.html'), 'utf8');
const preview = path.join(__dirname, 'preview.html');
fs.writeFileSync(preview, '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>' + body + '</body></html>');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const p = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///' + preview.replace(/\\/g, '/')); await p.waitForTimeout(300);
  await p.click('#teachBtn'); await p.waitForTimeout(200);
  await p.fill('#t-title', title);
  await p.setInputFiles('#fileIn', wordFile); await p.waitForTimeout(300);
  const preview1 = (await p.textContent('#filePreview')).slice(0, 200);
  await p.click('[data-fp=replaceAll]'); await p.waitForTimeout(200);
  const options = await p.$$eval('#unitSel option', o => o.map(x => x.textContent));
  await p.click('#saveBtn'); await p.waitForTimeout(400);
  const saved = await p.evaluate(() => localStorage.getItem('nm-local-deck'));
  fs.writeFileSync(outJson, saved);
  const home = await p.evaluate(() => ({ units: [...document.querySelectorAll('.unit')].map(b => b.textContent), meta: document.querySelector('.lcd-meta').textContent, name: (document.querySelector('.unit-name') || {}).textContent }));
  await p.click('.unit[data-unit="2"]'); await p.waitForTimeout(150);
  const l3 = await p.evaluate(() => ({ name: document.querySelector('.unit-name').textContent, meta: document.querySelector('.lcd-meta').textContent, strip: document.querySelector('.strip').textContent.slice(0, 60) }));
  await p.keyboard.press('4'); await p.waitForTimeout(200);
  const sentenceGame = await p.evaluate(() => ({ h2: document.querySelector('.ghead h2').textContent, chips: [...document.querySelectorAll('.sp-pool .chip')].map(c => c.textContent) }));
  console.log(JSON.stringify({ preview1, options, home, l3, sentenceGame, errs }, null, 1));
  await browser.close();
})();
