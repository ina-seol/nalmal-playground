// 바뀐 게임 규칙을 실제로 플레이해서 확인합니다 (짝꿍 카드 장수, 사천성 끝까지 풀기, 머지 단계, 문장 점수, 풍선 개수)
// 실행: node rules-test.js <playwright-core 폴더>
const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright-core'));
const url = 'file:///' + path.join(__dirname, 'preview.html').replace(/\\/g, '/');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const p = await browser.newPage({ viewport: { width: 1366, height: 657 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(300);
  const out = {};
  // 1. memory
  await p.keyboard.press('1'); await p.waitForTimeout(200);
  out.memoryCards = await p.locator('.mcard').count();
  await p.keyboard.press('Escape');
  // 2. shisen: solve the whole board by trying word/meaning pairs
  await p.keyboard.press('2'); await p.waitForTimeout(300);
  out.shisenStart = await p.evaluate(() => ({ rocks: document.querySelectorAll('.ss-rock').length, tiles: document.querySelectorAll('.ss-tile').length, cols: getComputedStyle(document.querySelector('.ss-board')).getPropertyValue('--cols') }));
  out.shisenSolve = await p.evaluate(async () => {
    const words = JSON.parse(document.getElementById('deck-data').textContent).units.flatMap(u => u.words);
    const meaningOf = {}; words.forEach(w => { meaningOf[w.w] = meaningOf[w.w] || new Set(); meaningOf[w.w].add(w.m); });
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let removed = 0, reshuffles = 0, t0 = Date.now();
    while (Date.now() - t0 < 90000) {
      if (document.querySelector('.modal-back')) return { removed, done: true, reshuffles };
      const tiles = [...document.querySelectorAll('.ss-tile')];
      if (!tiles.length) { await sleep(300); continue; }
      let progressed = false;
      outer: for (const a of tiles.filter(t => t.classList.contains('w'))) {
        for (const b of tiles.filter(t => t.classList.contains('m') && meaningOf[a.textContent] && meaningOf[a.textContent].has(t.textContent))) {
          const before = document.querySelectorAll('.ss-tile').length;
          a.click(); b.click();
          if (document.querySelector('.ss-tile.vanish') || document.querySelector('.ss-line polyline').getAttribute('points')) {
            await sleep(560); if (document.querySelectorAll('.ss-tile').length < before) { removed++; progressed = true; break outer; }
          }
          const s = document.querySelector('.ss-tile.sel'); if (s) s.click();
        }
      }
      if (!progressed) { document.querySelector('[data-ss=shuffle]').click(); reshuffles++; await sleep(100); }
    }
    return { removed, done: false, reshuffles };
  });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // 3. merge: two Lv1 stars -> Lv3 (same level +2), Lv3 + Lv1 -> Lv4
  await p.keyboard.press('3'); await p.waitForTimeout(300);
  out.merge = await p.evaluate(async () => {
    const words = JSON.parse(document.getElementById('deck-data').textContent).units.flatMap(u => u.words);
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const cells = () => [...document.querySelectorAll('.mg-cell')];
    const label = el => el.getAttribute('aria-label');
    async function makeStar() {
      for (let tries = 0; tries < 30; tries++) {
        const cs = cells();
        for (const a of cs.filter(c => /^낱말 /.test(label(c)))) {
          const w = label(a).slice(3), ms = words.filter(x => x.w === w).map(x => '뜻 ' + x.m);
          const b = cs.find(c => ms.includes(label(c)));
          if (b) { a.click(); await sleep(30); cells()[+b.dataset.i].click(); await sleep(30); return +b.dataset.i; }
        }
        document.querySelector('[data-mg=spawn]').click(); await sleep(30);
      }
      return -1;
    }
    async function mergeStars(i, j) { cells()[i].click(); await sleep(30); cells()[j].click(); await sleep(30); return label(cells()[j]); }
    const a = await makeStar(), b = await makeStar();
    const lv3 = await mergeStars(a, b);
    const c = await makeStar();
    const lv4 = await mergeStars(c, b);
    return { lv3, lv4, stats: document.getElementById('stats').textContent, ladderLit: document.querySelectorAll('.ladder i.got').length, ladderTotal: document.querySelectorAll('.ladder i').length };
  });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // 4. sentence: solve two sentences perfectly -> 100 then +120 (streak bonus)
  await p.keyboard.press('4'); await p.waitForTimeout(300);
  out.sentence = await p.evaluate(async () => {
    const sents = JSON.parse(document.getElementById('deck-data').textContent).units.flatMap(u => u.sentences);
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const scores = [];
    for (let round = 0; round < 2; round++) {
      const chips = [...document.querySelectorAll('.sp-pool .chip')].map(c => c.textContent);
      const key = chips.slice().sort().join('|');
      const s = sents.find(x => x.split(' ').slice().sort().join('|') === key);
      for (const tok of s.split(' ')) { const btn = [...document.querySelectorAll('.sp-pool button.chip')].find(b => b.textContent === tok); btn.click(); await sleep(20); }
      const gain = (document.querySelector('.gain') || {}).textContent;
      scores.push({ gain, stats: document.getElementById('stats').textContent });
      await sleep(1250);
    }
    return { rounds: document.querySelector('.sp-count').textContent, scores };
  });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // 5. balloon
  await p.keyboard.press('5'); await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  const y1 = await p.$$eval('.balloon', b => b.map(e => new DOMMatrix(getComputedStyle(e).transform).m42));
  await p.waitForTimeout(500);
  const y2 = await p.$$eval('.balloon', b => b.map(e => new DOMMatrix(getComputedStyle(e).transform).m42));
  out.balloon = { count: y1.length, keys: await p.$$eval('.balloon .k', k => k.map(e => e.textContent).sort().join('')), pxPerSec: y1.map((y, i) => Math.round((y - y2[i]) / 0.5)) };
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
