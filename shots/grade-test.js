// 학년 고르기 흐름 확인: 숫자키 선택, 학년별 단원 선택 기억, #g6 바로가기, 선생님 저장이 고른 학년만 바꾸는지
// 실행: node grade-test.js <playwright-core 폴더>
const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright-core'));
const url = 'file:///' + path.join(__dirname, 'preview.html').replace(/\\/g, '/');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const p = await browser.newPage({ viewport: { width: 1366, height: 657 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const home = () => p.evaluate(() => ({ title: document.querySelector('.lcd h1').textContent, grade: document.getElementById('gradeBtn').textContent, meta: document.querySelector('.lcd-meta span') && document.querySelector('.lcd-meta span').textContent, on: document.querySelectorAll('.unit.on').length, firstUnit: (document.querySelector('.unit .ut') || {}).textContent }));
  const out = {};
  await p.goto(url); await p.waitForTimeout(300);
  out.start = await p.evaluate(() => ({ cards: [...document.querySelectorAll('.set-card')].map(c => c.querySelector('.set-body b').textContent + (c.disabled ? '(닫힘)' : '')), gradeBtnHidden: document.getElementById('gradeBtn').hidden }));
  await p.keyboard.press('3'); await p.waitForTimeout(200);
  out.g3 = await home();
  await p.click('[data-units=none]'); await p.click('[data-unit="0"]'); await p.waitForTimeout(100);
  out.g3pickedL1 = await home();
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  out.backToStart = await p.evaluate(() => !!document.querySelector('.sets'));
  await p.keyboard.press('5'); await p.waitForTimeout(150);
  out.g5 = await home();
  await p.click('#gradeBtn'); await p.waitForTimeout(150); await p.keyboard.press('3'); await p.waitForTimeout(150);
  out.g3again = await home();
  // a #g6 link skips the picker
  await p.goto(url + '#g6'); await p.reload(); await p.waitForTimeout(300);
  out.hashG6 = await home();
  // teacher save on 6th grade changes only the 6th grade
  await p.click('#teachBtn'); await p.waitForTimeout(200);
  out.teacherFor = await p.textContent('.howto b');
  await p.fill('#t-title', '6학년 시험 제목'); await p.click('#saveBtn'); await p.waitForTimeout(300);
  out.afterSave = await home();
  out.savedTitles = await p.evaluate(() => JSON.parse(localStorage.getItem('nm-local-deck')).sets.map(s => s.id + ':' + s.title + ':' + s.units.length));
  await p.evaluate(() => localStorage.removeItem('nm-local-deck'));
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
