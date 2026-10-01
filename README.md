# 낱말 놀이터

초등 3~4학년 낱말 복습용 미니게임 모음입니다. 선생님이 낱말과 문장을 넣으면, 학생들은 한 링크에서 다섯 가지 게임으로 복습합니다. 크롬북에서 터치와 키보드 모두로 할 수 있습니다.

지금은 **4학년 영어 (천재교육, 함순애) Lesson 1~12** 낱말 127개와 핵심 표현 43개가 들어 있습니다. 홈 화면에서 `전체` 또는 `L1`~`L12` 를 골라 단원별로 복습합니다. 원본 목록은 [`words/4학년_영어_천재_함순애.txt`](words/4학년_영어_천재_함순애.txt) 에 있습니다.

| 게임 | 하는 법 |
|---|---|
| 짝꿍 카드 | 카드를 뒤집어 낱말과 뜻의 짝을 찾아요 |
| 낱말 사천성 | 두 번 이하로 꺾이는 선으로 짝을 이어 판을 비워요 |
| 낱말 머지 | 낱말과 뜻을 합쳐 별을 만들고, 별을 키워 왕관까지 |
| 문장 퍼즐 | 흩어진 낱말 조각을 순서대로 놓아 문장을 완성해요 |
| 풍선 팡팡 | 뜻에 맞는 낱말 풍선이 날아가기 전에 터뜨려요 |

**바로 하기:** https://ina-seol.github.io/nalmal-playground/

키보드: 홈에서 `1`~`5` 게임 시작, 방향키 이동, `Enter` 고르기, `Esc` 놀이 목록, `M` 배경음악 켜고 끄기.

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
