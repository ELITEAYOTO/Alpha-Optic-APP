# Optic Preview GUI smoke: hosted Windows CI ONLY, never the user's PC.
param(
  [Parameter(Mandatory=$true)][string]$AppPath,
  [Parameter(Mandatory=$true)][string]$InstallRoot,
  [Parameter(Mandatory=$true)][string]$ReportPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($env:GITHUB_ACTIONS -ne 'true' -or
    $env:RUNNER_ENVIRONMENT -ne 'github-hosted' -or
    $env:RUNNER_OS -ne 'Windows' -or
    $env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP' -or
    -not $env:GITHUB_WORKSPACE -or -not $env:LOCALAPPDATA) {
  throw 'GUI smoke requires GitHub-hosted Windows and the exact Desktop repository.'
}
$root = [IO.Path]::GetFullPath($InstallRoot)
$expected = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Optic Preview'))
if (-not [string]::Equals($root, $expected, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Refusing to start an app outside the Preview installation directory.'
}
$appFile = (Resolve-Path -LiteralPath $AppPath -ErrorAction Stop).Path
if (-not [string]::Equals([IO.Path]::GetDirectoryName($appFile), $root, [StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::GetExtension($appFile) -ne '.exe' -or
    [IO.Path]::GetFileName($appFile) -eq 'uninstall.exe') {
  throw 'Only the installed unsigned Preview executable may be started.'
}
if ((Get-AuthenticodeSignature -LiteralPath $appFile).Status -ne 'NotSigned') {
  throw 'Unexpected Authenticode signature in unsigned Preview.'
}
$reportRoot = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE 'preview-dist'))
$report = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE $ReportPath))
if (-not [string]::Equals([IO.Path]::GetDirectoryName($report), $reportRoot, [StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::GetFileName($report) -ne 'PREVIEW_GUI_LAUNCH.txt') {
  throw 'Unexpected GUI smoke report destination.'
}
if (-not (Test-Path -LiteralPath $reportRoot -PathType Container)) {
  throw 'Missing smoke report directory.'
}

$opened = $false
$webviewOwned = $false
$exitedEarly = $false
$stopped = $false
$reason = 'Native window and WebView2 evidence not obtained'
$app = $null
try {
  $app = Start-Process -FilePath $appFile -WorkingDirectory $root -PassThru
  $deadline = [DateTime]::UtcNow.AddSeconds(35)
  do {
    Start-Sleep -Milliseconds 1000
    $app.Refresh()
    if ($app.HasExited) {
      $exitedEarly = $true
      $reason = "Application exited before successful observation, exit code $($app.ExitCode)."
      break
    }
    if ($app.MainWindowHandle -ne [IntPtr]::Zero) { $opened = $true }
    $children = @(Get-CimInstance -ClassName Win32_Process -Filter ("ParentProcessId = " + [string]$app.Id))
    if (@($children | Where-Object { $_.Name -ieq 'msedgewebview2.exe' }).Count -gt 0) {
      $webviewOwned = $true
    }
    if ($opened -and $webviewOwned) {
      $reason = 'Observed native Optic window and directly-owned WebView2 browser process.'
      break
    }
  } while ([DateTime]::UtcNow -lt $deadline)
} catch {
  $reason = $_.Exception.Message
} finally {
  if ($null -ne $app) {
    try {
      $app.Refresh()
      if (-not $app.HasExited) {
        if ($opened) { [void]$app.CloseMainWindow() }
        if (-not $app.WaitForExit(5000)) {
          $app.Kill($true)
          [void]$app.WaitForExit(10000)
        }
      }
      $app.Refresh()
      $stopped = $app.HasExited
    } catch {
      $stopped = $false
      $reason = 'Application could not be terminated before uninstall.'
    } finally {
      $app.Dispose()
    }
  }

  $pass = $opened -and $webviewOwned -and $stopped -and -not $exitedEarly
  @(
    'OPTIC PREVIEW WEBVIEW2 GUI STARTUP - UNSIGNED CI ONLY, NOT A RELEASE'
    "Source SHA: $env:GITHUB_SHA"
    "Native window observed: $opened"
    "Owned WebView2 process observed: $webviewOwned"
    "Exited before observation: $exitedEarly"
    "Stopped before uninstall: $stopped"
    "Diagnostic: $reason"
    'React content/navigation verified: NO'
    'Screenshot/pixel fidelity verified: NO'
    'WebView2 missing/offline scenario: NOT TESTED'
    'User PC: NOT ACCESSED'
    "Result: $(if ($pass) { 'PASS' } else { 'FAIL' })"
  ) | Set-Content -LiteralPath $report -Encoding utf8
  Get-Content -LiteralPath $report
}
if (-not $pass) {
  throw "WebView2 smoke incomplete: $reason"
}
