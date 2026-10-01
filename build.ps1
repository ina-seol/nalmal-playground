# 원본(nalmal-playground.src.html)에 SB 어그로 글꼴을 넣어 nalmal-playground.html 을 만듭니다.
# 게시된 페이지는 jsdelivr 글꼴을 불러올 수 없어서 글꼴 파일을 페이지 안에 직접 넣습니다.
$root = $PSScriptRoot
$src = [System.IO.File]::ReadAllText((Join-Path $root 'nalmal-playground.src.html'), [System.Text.Encoding]::UTF8)
$faces = @(@{ f = 'SBAggroL.woff'; w = 300 }, @{ f = 'SBAggroM.woff'; w = 500 }, @{ f = 'SBAggroB.woff'; w = 700 })
$css = ($faces | ForEach-Object {
  $b64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes((Join-Path $root "fonts\$($_.f)")))
  "@font-face{font-family:'Aggravo';src:url(data:font/woff;base64,$b64) format('woff');font-weight:$($_.w);font-display:swap}"
}) -join ''
$out = $src.Replace('<!--FONTS-->', "<style id=`"font-style`">$css</style>")
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $root 'nalmal-playground.html'), $out, $utf8)
"built nalmal-playground.html ({0:N0} KB)" -f ((Get-Item (Join-Path $root 'nalmal-playground.html')).Length / 1KB)

# GitHub Pages 용 index.html: Claude 게시 때 자동으로 붙는 문서 틀(doctype, viewport)을 직접 붙입니다.
$head = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>낱말 놀이터</title><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  '<meta name="description" content="초등 낱말 복습 미니게임 5종"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
[System.IO.File]::WriteAllText((Join-Path $root 'index.html'), $head + $out + '</body></html>', $utf8)
"built index.html for GitHub Pages ({0:N0} KB)" -f ((Get-Item (Join-Path $root 'index.html')).Length / 1KB)
