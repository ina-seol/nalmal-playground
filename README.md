# 낱말 놀이터

초등 3~6학년 영어 낱말 복습용 미니게임 모음입니다. 선생님이 낱말과 문장을 넣으면, 학생들은 한 링크에서 다섯 가지 게임으로 복습합니다. 크롬북에서 터치와 키보드 모두로 할 수 있습니다.

천재교육(함순애) 영어 **3·4·5·6학년** 낱말과 핵심 표현이 들어 있습니다. 첫 화면에서 학년을 고르고(키보드 숫자 `3`~`6`), 홈 화면에서 단원을 1개부터 12개까지 골라 복습합니다.

| 학년 | 단원 | 낱말 | 문장 | 바로가기 | 원본 목록 |
|---|---|---|---|---|---|
| 3학년 | 12 | 144 | 44 | https://ina-seol.github.io/nalmal-playground/#g3 | [words/3학년_영어_천재_함순애.txt](words/3학년_영어_천재_함순애.txt) |
| 4학년 | 12 | 127 | 43 | https://ina-seol.github.io/nalmal-playground/#g4 | [words/4학년_영어_천재_함순애.txt](words/4학년_영어_천재_함순애.txt) |
| 5학년 | 12 | 143 | 47 | https://ina-seol.github.io/nalmal-playground/#g5 | [words/5학년_영어_천재_함순애.txt](words/5학년_영어_천재_함순애.txt) |
| 6학년 | 12 | 134 | 43 | https://ina-seol.github.io/nalmal-playground/#g6 | [words/6학년_영어_천재_함순애.txt](words/6학년_영어_천재_함순애.txt) |

바로가기 주소로 열면 학년 고르기를 건너뛰고 그 학년이 바로 열립니다.

| 게임 | 하는 법 |
|---|---|
| 짝꿍 카드 | 카드 24장을 뒤집어 낱말과 뜻의 짝을 찾아요 |
| 낱말 사천성 | 10×8 판에서 바위를 피해, 두 번 이하로 꺾이는 선으로 짝을 이어 판을 비워요 |
| 낱말 머지 | 낱말과 뜻을 합쳐 별을 만들고 16단계 황금왕관까지 키워요 (별끼리 +1, 같은 단계끼리 +2) |
| 문장 퍼즐 | 문장 10개를 완성하며 점수를 모아요. 실수 없이 연속으로 맞히면 보너스 |
| 풍선 팡팡 | 빠르게 떠오르는 풍선 6개 중 뜻에 맞는 낱말을 터뜨려요 |

**바로 하기:** https://ina-seol.github.io/nalmal-playground/

키보드: 첫 화면에서 `3`~`6` 학년 고르기, 홈에서 `1`~`5` 게임 시작, 방향키 이동, `Enter` 고르기, `Esc` 놀이 목록 또는 학년 고르기, `M` 배경음악 켜고 끄기.

## 파일

| 파일 | 설명 |
|---|---|
| `nalmal-playground.src.html` | 고칠 때 여는 원본 |
| `build.ps1` | 원본에 글꼴을 넣어 `nalmal-playground.html` 을 만듭니다 |
| `nalmal-playground.html` | 완성된 페이지 (글꼴 포함, Claude 게시용) |
| `index.html` | GitHub Pages 용 페이지 (`build.ps1` 이 함께 만듭니다) |
| `bgm.mp3` | 배경음악 (페이지와 같은 폴더에 두어야 재생됩니다) |
| `fonts/` | SB 어그로 글꼴 |
| `shots/capture.js`, `shots/audio-test.js` | Playwright 화면 캡처와 소리 동작 확인 스크립트 |

## 만들기

PowerShell 에서:

```powershell
.\build.ps1
```

## 낱말 바꾸기

페이지를 이 컴퓨터에서 열면 위쪽 **낱말 바꾸기** 버튼으로 단원별 낱말과 문장을 고치거나 텍스트 파일(.txt, .csv)로 올릴 수 있습니다. `Lesson 1` 처럼 시작하는 줄이 새 단원이 됩니다.

```
Lesson 1 My Name Is Amy
[낱말]
name, 이름
friend, 친구
[문장]
What's your name?
Lesson 2 I'm Happy
[낱말]
happy, 행복한
```
