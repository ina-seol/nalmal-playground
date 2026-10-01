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
[System.IO.File]::WriteAllText((Join-Path $root 'nalmal-playground.html'), $out, (New-Object System.Text.UTF8Encoding $false))
"built nalmal-playground.html ({0:N0} KB)" -f ((Get-Item (Join-Path $root 'nalmal-playground.html')).Length / 1KB)
