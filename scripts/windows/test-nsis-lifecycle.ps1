# Windows GitHub-hosted runner ONLY. Do not run on a developer's PC.
# This smoke checks an UNSIGNED test artifact; it is NOT a release qualification.
param(
  [Parameter(Mandatory = $true)][string]$InstallerPath,
  [Parameter(Mandatory = $true)][string]$ReportPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($env:GITHUB_ACTIONS -ne 'true' -or
    $env:RUNNER_ENVIRONMENT -ne 'github-hosted' -or
    $env:RUNNER_OS -ne 'Windows' -or
    $env:GITHUB_REPOSITORY -ne 'ELITEAYOTO/Alpha-Optic-APP' -or
    -not $env:GITHUB_WORKSPACE -or
    -not $env:LOCALAPPDATA) {
  throw 'NSIS lifecycle test is restricted to a GitHub-hosted Windows runner for Alpha-Optic-APP.'
}

$installer = (Resolve-Path -LiteralPath $InstallerPath -ErrorAction Stop).Path
$bundleRoot = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE 'src-tauri\target\release\bundle\nsis'))
$bundlePrefix = $bundleRoot.TrimEnd('\') + '\'
if (-not $installer.StartsWith($bundlePrefix, [StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::GetFileName($installer) -ne 'Optic Smoke Test_0.0.1_x64-setup.exe') {
  throw 'Refusing to execute anything except the expected CI-produced NSIS smoke installer.'
}

$reportDir = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE 'smoke-dist'))
$report = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE $ReportPath))
if (-not [string]::Equals([IO.Path]::GetDirectoryName($report), $reportDir, [StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::GetFileName($report) -ne 'LIFECYCLE.txt') {
  throw 'Lifecycle report destination must be smoke-dist/LIFECYCLE.txt.'
}

if ((Get-AuthenticodeSignature -LiteralPath $installer).Status -ne 'NotSigned') {
  throw 'Only the expected unsigned CI smoke installer may be exercised here.'
}

$installDir = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Optic Smoke Test'))
$uninstaller = Join-Path $installDir 'uninstall.exe'
$userUninstall = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall'
$machineUninstall = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall'

function Find-Registration([string]$root) {
  $items = @(Get-ChildItem -LiteralPath $root -ErrorAction SilentlyContinue)
  return @($items | ForEach-Object {
    $record = Get-ItemProperty -LiteralPath $_.PSPath -ErrorAction Stop
    $display = $record.PSObject.Properties['DisplayName']
    if ($null -ne $display -and $display.Value -eq 'Optic Smoke Test') { $record }
  })
}

function Invoke-BoundedProcess([string]$path, [string]$arguments, [string]$label) {
  $process = Start-Process -FilePath $path -ArgumentList $arguments -PassThru
  try {
    if (-not $process.WaitForExit(120000)) {
      $process.Kill($true)
      throw "$label exceeded the 120-second timeout"
    }
    if ($process.ExitCode -ne 0) {
      throw "$label returned a non-zero code: $($process.ExitCode)"
    }
  } finally {
    $process.Dispose()
  }
}

# Fail before touching anything if a prior install is present.
if ((Test-Path -LiteralPath $installDir) -or
    @(Find-Registration $userUninstall).Count -ne 0 -or
    @(Find-Registration $machineUninstall).Count -ne 0) {
  throw 'A smoke installation already exists. Refusing to overwrite or remove it.'
}

$errors = [System.Collections.Generic.List[string]]::new()
$installed = $false
$uninstalled = $false
$guiLaunch = $false
$shaBefore = (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash

try {
  Invoke-BoundedProcess $installer '/S' 'Silent NSIS installation'

  $userEntries = @(Find-Registration $userUninstall)
  if ($userEntries.Count -ne 1) {
    throw "Expected one HKCU uninstall registration, found $($userEntries.Count)."
  }
  if (@(Find-Registration $machineUninstall).Count -ne 0) {
    throw 'The currentUser smoke installer unexpectedly registered in HKLM.'
  }
  if ($userEntries[0].DisplayVersion -ne '0.0.1') {
    throw "Unexpected installed version: $($userEntries[0].DisplayVersion)"
  }
  if (-not (Test-Path -LiteralPath $installDir -PathType Container) -or
      -not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) {
    throw 'Expected per-user install directory or uninstaller is missing.'
  }

  $executables = @(Get-ChildItem -LiteralPath $installDir -File -Filter '*.exe' |
    Where-Object { $_.Name -ne 'uninstall.exe' })
  if ($executables.Count -ne 1 -or $executables[0].Length -lt 1024) {
    throw "Expected one installed application executable, found $($executables.Count)."
  }
  if ((Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash -ne $shaBefore) {
    throw 'Installer bytes changed during install smoke.'
  }
  $installed = $true
  Write-Output "NSIS smoke: installed to current-user location; version 0.0.1; app binary and uninstaller present."
  & './scripts/windows/test-webview2-launch.ps1' -AppPath $executables[0].FullName -InstallRoot $installDir -ReportPath 'smoke-dist/GUI_LAUNCH.txt'
  $guiLaunch = $true
  Write-Output 'NSIS smoke: native window and owned WebView2 startup evidence verified.'
} catch {
  $errors.Add("Install/check: $($_.Exception.Message)")
} finally {
  # Only the exact, previously absent smoke path may be removed by its OWN uninstaller.
  if (Test-Path -LiteralPath $uninstaller -PathType Leaf) {
    try {
      Invoke-BoundedProcess $uninstaller '/S' 'Silent NSIS uninstallation'

      # NSIS uninstall may briefly continue cleanup in a child process.
      $deadline = [DateTime]::UtcNow.AddSeconds(30)
      do {
        $userRemaining = @(Find-Registration $userUninstall).Count
        $machineRemaining = @(Find-Registration $machineUninstall).Count
        $dirRemaining = Test-Path -LiteralPath $installDir
        if ($userRemaining -eq 0 -and $machineRemaining -eq 0 -and -not $dirRemaining) { break }
        Start-Sleep -Milliseconds 500
      } while ([DateTime]::UtcNow -lt $deadline)

      if ($userRemaining -ne 0 -or $machineRemaining -ne 0 -or $dirRemaining) {
        throw "Uninstall left remnants (HKCU=$userRemaining, HKLM=$machineRemaining, directory=$dirRemaining)."
      }
      $uninstalled = $true
      Write-Output 'NSIS smoke: uninstaller finished, registration and test directory removed.'
    } catch {
      $errors.Add("Uninstall: $($_.Exception.Message)")
    }
  } else {
    $errors.Add('Cleanup: no owned uninstaller was found; runner must be discarded.')
  }
  $reportLines = @(
    'OPTIC NSIS CURRENT-USER LIFECYCLE SMOKE — UNSIGNED / NOT A RELEASE'
    "Source SHA: $env:GITHUB_SHA"
    'Executor: GitHub-hosted Windows runner'
    "Install checks passed: $installed"
    "Uninstall checks passed: $uninstalled"
    "Native GUI/WebView2 startup passed: $guiLaunch"
    'GUI startup checked; React pixels/content NOT TESTED'
    'WebView2 absent/offline scenario: NOT TESTED'
    'Windows update/downgrade: NOT TESTED'
    'Bridge installation/control: NOT ATTEMPTED'
    "Result: $(if ($errors.Count -eq 0 -and $installed -and $uninstalled -and $guiLaunch) { 'PASS' } else { 'FAIL' })"
  )
  $reportLines | Set-Content -LiteralPath $report -Encoding utf8
  Get-Content -LiteralPath $report
}

if ($errors.Count -gt 0 -or -not $installed -or -not $uninstalled -or -not $guiLaunch) {
  throw ("NSIS install/uninstall smoke failed: " + ($errors -join '; '))
}
