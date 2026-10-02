// Playwright 캡처: 데스크톱(크롬북 1366x768)과 모바일(390x844, 터치)에서 화면별 스크린샷 + 넘침 검사
// 실행: node capture.js <playwright-core 폴더> <출력 폴더> [접미사]
const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright-core'));
const out = process.argv[3];
const suffix = process.argv[4] || '';
// 게시할 때 붙는 틀(viewport 메타 포함)과 같은 모양으로 감싼 미리보기 파일
const fs = require('fs');
const body = fs.readFileSync(path.join(__dirname, '..', 'nalmal-playground.html'), 'utf8');
const preview = path.join(__dirname, 'preview.html');
fs.writeFileSync(preview, '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px/1.5 system-ui,sans-serif;background:#f7f7f5}img{max-width:100%}[hidden]{display:none!important}</style></head><body>' + body + '</body></html>');
const url = 'file:///' + preview.replace(/\\/g, '/');

const SCREENS = [
  ['start', async p => {}],
  ['home', async p => {}],
  ['memory', async p => { await p.keyboard.press('1'); await p.waitForTimeout(200); const c = p.locator('.mcard'); await c.nth(0).click(); await c.nth(1).click(); await p.waitForTimeout(500); }],
  ['shisen', async p => { await p.keyboard.press('2'); await p.waitForTimeout(200); await p.click('[data-ss=hint]'); await p.waitForTimeout(100); }],
  ['merge', async p => { await p.keyboard.press('3'); await p.waitForTimeout(200); for (let i = 0; i < 6; i++) await p.click('[data-mg=spawn]'); await p.locator('.mg-cell.has').first().click(); await p.waitForTimeout(400); }],
  ['sentence', async p => { await p.keyboard.press('4'); await p.waitForTimeout(200); await p.locator('.sp-pool .chip[data-t]').first().click(); await p.waitForTimeout(200); }],
  ['balloon', async p => { await p.keyboard.press('5'); await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(2600); }],
  ['teacher', async p => { await p.click('#teachBtn'); await p.waitForTimeout(300); }],
  ['result', async p => { await p.keyboard.press('1'); await p.waitForTimeout(200);
    // 덱의 낱말-뜻 짝을 읽어 카드 순서대로 짝을 맞춰 결과 창 띄우기
    const pairs = await p.evaluate(() => {
      const data = JSON.parse(document.getElementById('deck-data').textContent);
      const deck = data.sets.flatMap(s => s.units.flatMap(u => u.words));
      const texts = [...document.querySelectorAll('.mcard .front b')].map(e => e.textContent);
      const out = [], used = new Set();
      texts.forEach((t, i) => { if (used.has(i)) return; const w = deck.find(d => d.w === t); if (!w) return;
        const j = texts.findIndex((x, k) => !used.has(k) && k !== i && x === w.m); if (j >= 0) { used.add(i); used.add(j); out.push([i, j]); } });
      return out;
    });
    for (const [a, b] of pairs) { await p.locator(`[data-i="${a}"]`).click(); await p.locator(`[data-i="${b}"]`).click(); await p.waitForTimeout(120); }
    await p.waitForTimeout(1300); }]
];

const CHECK = () => {
  const issues = [];
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) issues.push(`page scrolls sideways: ${de.scrollWidth} > ${de.clientWidth}`);
  document.querySelectorAll('button, .label, .label h2, .label p, .stats, .chip, .ss-tile, .mg-word b, .mface b, .balloon, .lcd h1, .strip span, .kbd, .notice p, .goal li').forEach(el => {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== 'auto') issues.push(`text overflow x: ${el.className || el.tagName} "${(el.textContent || '').trim().slice(0, 30)}" ${el.scrollWidth}>${el.clientWidth}`);
    if (r.right > innerWidth + 1 || r.left < -1) { if (!el.classList.contains('balloon')) issues.push(`off-screen: ${el.className || el.tagName} "${(el.textContent || '').trim().slice(0, 30)}" ${Math.round(r.left)}..${Math.round(r.right)}`); }
  });
  issues.push(`fonts: Aggravo700=${document.fonts.check('700 20px Aggravo')} DotGothicLatin=${[...document.fonts].some(f => /Dot/.test(f.family) && f.status === 'loaded')}`);
  issues.push(`docHeight=${de.scrollHeight} viewport=${innerHeight}`);
  return issues;
};

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const report = {};
  for (const [dev, opts] of [['desktop', { viewport: { width: 1366, height: 657 }, deviceScaleFactor: 1, hasTouch: true }], ['mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
    const ctx = await browser.newContext(opts);
    for (const [name, act] of SCREENS) {
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', e => errs.push('pageerror: ' + e.message));
      p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
      await p.goto(name === 'start' ? url : url + '#g4'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
      try { await act(p); } catch (e) { errs.push('action failed: ' + e.message.split('\n')[0]); }
      const issues = await p.evaluate(CHECK);
      await p.screenshot({ path: path.join(out, `${dev}-${name}${suffix}.png`), fullPage: name !== 'balloon' });
      report[`${dev}-${name}`] = errs.concat(issues);
      await p.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 1));
})();
