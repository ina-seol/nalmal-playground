// 배경음악 켜기/끄기와 효과음(Web Audio) 동작 확인
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright-core'));
const body = fs.readFileSync(path.join(__dirname, '..', 'nalmal-playground.html'), 'utf8');
const preview = path.join(__dirname, 'preview.html');
fs.writeFileSync(preview, '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>' + body + '</body></html>');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', args: ['--autoplay-policy=user-gesture-required'] });
  const p = await browser.newPage({ viewport: { width: 1366, height: 657 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  // count Web Audio nodes the page creates
  await p.addInitScript(() => { window.__osc = 0; window.__noise = 0; const pl = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__bgm = this; return pl.call(this); };
    const o = AudioContext.prototype.createOscillator; AudioContext.prototype.createOscillator = function () { window.__osc++; return o.call(this); };
    const b = AudioContext.prototype.createBufferSource; AudioContext.prototype.createBufferSource = function () { window.__noise++; return b.call(this); }; });
  await p.goto('file:///' + preview.replace(/\\/g, '/')); await p.waitForTimeout(400);
  const out = {};
  out.labelsBefore = [await p.textContent('#bgmBtn'), await p.textContent('#sfxBtn')];
  await p.click('#bgmBtn'); await p.waitForTimeout(1800);
  out.afterBgmOn = await p.evaluate(() => { const a = [...document.querySelectorAll('audio')]; return { label: document.querySelector('#bgmBtn').textContent, pressed: document.querySelector('#bgmBtn').getAttribute('aria-pressed') }; });
  // the Audio element is not in the DOM; read its state through the media session of the page
  out.bgm = await p.evaluate(() => { const a = window.__bgm; return a ? { src: a.src.split('/').pop(), paused: a.paused, time: +a.currentTime.toFixed(2), loop: a.loop, volume: a.volume, duration: Math.round(a.duration) } : null; });
  await p.keyboard.press('1'); await p.waitForTimeout(200);
  await p.locator('.mcard').nth(0).click(); await p.locator('.mcard').nth(1).click(); await p.waitForTimeout(1300);
  await p.keyboard.press('Escape'); await p.keyboard.press('5'); await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  await p.keyboard.press('1'); await p.waitForTimeout(300);
  out.sfxNodes = await p.evaluate(() => ({ osc: window.__osc, noise: window.__noise }));
  await p.keyboard.press('Escape'); await p.keyboard.press('m'); await p.waitForTimeout(200);
  out.afterM = await p.textContent('#bgmBtn'); out.pausedAfterM = await p.evaluate(() => window.__bgm && window.__bgm.paused);
  await p.click('#sfxBtn'); const before = await p.evaluate(() => window.__osc);
  await p.keyboard.press('1'); await p.waitForTimeout(200); await p.locator('.mcard').nth(0).click(); await p.waitForTimeout(200);
  out.sfxOffNewOsc = (await p.evaluate(() => window.__osc)) - before;
  out.stored = await p.evaluate(() => ({ bgm: localStorage.getItem('nm-bgm'), sfx: localStorage.getItem('nm-sfx') }));
  out.errors = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
