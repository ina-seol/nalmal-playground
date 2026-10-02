// words/*.txt 네 학년 파일을 페이지의 파일 읽기 기능(parseFile)으로 읽어 학년별 묶음 JSON을 만듭니다.
// 실행: node build-library.js <playwright-core 폴더> <결과 JSON 경로>
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright-core'));
const root = path.join(__dirname, '..');
const GRADES = [['g3', 3], ['g4', 4], ['g5', 5], ['g6', 6]];
const body = fs.readFileSync(path.join(root, 'nalmal-playground.html'), 'utf8');
const preview = path.join(__dirname, 'preview.html');
fs.writeFileSync(preview, '<!doctype html><html><head><meta charset=utf8></head><body>' + body + '</body></html>');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const p = await browser.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///' + preview.replace(/\\/g, '/')); await p.waitForTimeout(200);
  const sets = [], report = [];
  for (const [id, g] of GRADES) {
    const text = fs.readFileSync(path.join(root, 'words', `${g}학년_영어_천재_함순애.txt`), 'utf8');
    const r = await p.evaluate(t => window.__nmParse(t), text);
    sets.push({ id, name: `천재(함) ${g}학년`, title: `${g}학년 영어 낱말 복습`, sample: false, units: r.units });
    report.push(`${g}학년: 단원 ${r.units.length}개, 낱말 ${r.words}개, 문장 ${r.sentences}개, 읽지 못한 줄 ${r.skipped}개 | ` + r.units.map(u => u.name).join(' / '));
  }
  fs.writeFileSync(process.argv[3], JSON.stringify({ sets }));
  console.log(report.join('\n'));
  if (errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await browser.close();
})();
