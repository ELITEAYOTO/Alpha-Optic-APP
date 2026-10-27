# Optic Preview NSIS install/uninstall validation.
# MUST run ONLY on a GitHub-hosted Windows CI runner, never on an end-user PC.
# Unsigned prototype package; not a release certification.
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
    -not $env:LOCALAPPDATA -or
    -not $env:APPDATA) {
  throw 'Preview lifecycle is restricted to GitHub-hosted Windows on the exact Desktop repository.'
}

$bundleDir = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE 'src-tauri\target\release\bundle\nsis'))
$expectedInstaller = [IO.Path]::GetFullPath((Join-Path $bundleDir 'Optic Preview_0.0.1_x64-setup.exe'))
$installer = (Resolve-Path -LiteralPath $InstallerPath -ErrorAction Stop).Path
if (-not [string]::Equals($installer, $expectedInstaller, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Refusing to execute anything except the exact CI-produced Optic Preview installer.'
}

$reportDir = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE 'preview-dist'))
$expectedReport = [IO.Path]::GetFullPath((Join-Path $reportDir 'LIFECYCLE.txt'))
$report = [IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE $ReportPath))
if (-not [string]::Equals($report, $expectedReport, [StringComparison]::OrdinalIgnoreCase) -or
    -not (Test-Path -LiteralPath $reportDir -PathType Container)) {
  throw 'Report must be preview-dist/LIFECYCLE.txt inside the GitHub workspace.'
}

if ((Get-AuthenticodeSignature -LiteralPath $installer).Status -ne 'NotSigned') {
  throw 'Expected an unsigned Optic Preview CI candidate.'
}

$installDir = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Optic Preview'))
$uninstaller = Join-Path $installDir 'uninstall.exe'
$userUninstall = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall'
$machineUninstall = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall'

function Find-PreviewRegistration([string]$root) {
  $items = @(Get-ChildItem -LiteralPath $root -ErrorAction SilentlyContinue)
  return @($items | ForEach-Object {
    $entry = Get-ItemProperty -LiteralPath $_.PSPath -ErrorAction Stop
    $label = $entry.PSObject.Properties['DisplayName']
    if ($null -ne $label -and $label.Value -eq 'Optic Preview') { $entry }
  })
}

function Invoke-Bounded([string]$path, [string]$action) {
  $proc = Start-Process -FilePath $path -ArgumentList '/S' -PassThru
  try {
    if (-not $proc.WaitForExit(120000)) {
      $proc.Kill($true)
      throw "$action timed out after 120 seconds"
    }
    if ($proc.ExitCode -ne 0) { throw "$action exited with code $($proc.ExitCode)" }
  } finally {
    $proc.Dispose()
  }
}

# A synthetic state probe lives outside the NSIS-owned binary directory.
# This is NOT real Optic settings migration or a cross-PC synchronization test.
$profileDir = [IO.Path]::GetFullPath((Join-Path $env:APPDATA 'dev.optic.desktop.preview'))
$probeFile = Join-Path $profileDir '__optic_preview_nsis_ci_probe__.txt'
$probeValue = 'OPTIC_PREVIEW_CI_STATE_PROBE_V1; synthetic, non-secret'

# Do not overwrite anything, even on the isolated Windows runner.
if ((Test-Path -LiteralPath $profileDir) -or
    (Test-Path -LiteralPath $installDir) -or
    @(Find-PreviewRegistration $userUninstall).Count -gt 0 -or
    @(Find-PreviewRegistration $machineUninstall).Count -gt 0) {
  throw 'An Optic Preview installation already exists; refusing to replace it.'
}

$errors = [System.Collections.Generic.List[string]]::new()
$firstInstalled = $false
$firstRemoved = $false
$secondInstalled = $false
$secondRemoved = $false
$probeCreated = $false
$probeKept = $false
$shaBefore = (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash

function Confirm-Installed {
  $entries = @(Find-PreviewRegistration $userUninstall)
  if ($entries.Count -ne 1 -or
      @(Find-PreviewRegistration $machineUninstall).Count -ne 0 -or
      $entries[0].DisplayVersion -ne '0.0.1') {
    throw 'Optic Preview registration must be exactly one HKCU entry with expected version.'
  }
  if (-not (Test-Path -LiteralPath $installDir -PathType Container) -or
      -not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) {
    throw 'Expected Preview install directory or owned uninstaller is missing.'
  }
  $executables = @(Get-ChildItem -LiteralPath $installDir -Filter '*.exe' -File |
    Where-Object { $_.Name -ne 'uninstall.exe' })
  if ($executables.Count -ne 1 -or $executables[0].Length -lt 1024) {
    throw 'Expected exactly one installed Preview executable.'
  }
  if ((Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash -ne $shaBefore) {
    throw 'Installer content changed during the cycle.'
  }
}

function Confirm-Uninstalled {
  # The NSIS child may finish briefly after the parent process exits.
  $deadline = [DateTime]::UtcNow.AddSeconds(30)
  do {
    $userRemain = @(Find-PreviewRegistration $userUninstall).Count
    $machineRemain = @(Find-PreviewRegistration $machineUninstall).Count
    $dirRemain = Test-Path -LiteralPath $installDir
    if ($userRemain -eq 0 -and $machineRemain -eq 0 -and -not $dirRemain) { break }
    Start-Sleep -Milliseconds 500
  } while ([DateTime]::UtcNow -lt $deadline)
  if ($userRemain -ne 0 -or $machineRemain -ne 0 -or $dirRemain) {
    throw "Preview cleanup incomplete (HKCU=$userRemain, HKLM=$machineRemain, dir=$dirRemain)."
  }
}

function Confirm-SyntheticProfile {
  if (-not (Test-Path -LiteralPath $probeFile -PathType Leaf) -or
      [IO.File]::ReadAllText($probeFile) -ne $probeValue) {
    throw 'Synthetic AppData probe changed or disappeared after NSIS uninstall/reinstall.'
  }
}

# Cycle 1: a clean per-user installation and uninstallation.
try {
  Invoke-Bounded $installer 'Initial NSIS Preview installation'
  Confirm-Installed
  $firstInstalled = $true
  [void](New-Item -ItemType Directory -Path $profileDir -ErrorAction Stop)
  [IO.File]::WriteAllText($probeFile, $probeValue)
  $probeCreated = $true
} catch {
  $errors.Add("Initial install/check: $($_.Exception.Message)")
} finally {
  if (Test-Path -LiteralPath $uninstaller -PathType Leaf) {
    try {
      Invoke-Bounded $uninstaller 'Initial NSIS Preview uninstallation'
      Confirm-Uninstalled
      $firstRemoved = $true
    } catch {
      $errors.Add("Initial uninstall: $($_.Exception.Message)")
    }
  } else {
    $errors.Add('Initial cleanup: no owned uninstaller exists; ephemeral runner must be discarded.')
  }
}

# Cycle 2: reinstall the SAME version from the SAME checked installer bytes.
# This is a clean reinstall, NOT an actual newer-version upgrade or rollback.
if ($firstInstalled -and $firstRemoved -and $probeCreated -and $errors.Count -eq 0) {
  try {
    Confirm-SyntheticProfile
    Invoke-Bounded $installer 'Clean reinstallation of Optic Preview'
    Confirm-Installed
    $secondInstalled = $true
    Confirm-SyntheticProfile
  } catch {
    $errors.Add("Reinstall/check: $($_.Exception.Message)")
  } finally {
    if (Test-Path -LiteralPath $uninstaller -PathType Leaf) {
      try {
        Invoke-Bounded $uninstaller 'Second NSIS Preview uninstallation'
        Confirm-Uninstalled
        $secondRemoved = $true
      } catch {
        $errors.Add("Second uninstall: $($_.Exception.Message)")
      }
    } else {
      $errors.Add('Second cleanup: no owned uninstaller exists; ephemeral runner must be discarded.')
    }
  }
}

if ($probeCreated) {
  try {
    Confirm-SyntheticProfile
    $probeKept = $true
  } catch {
    $errors.Add("Profile preservation: $($_.Exception.Message)")
  }
}

$pass = ($errors.Count -eq 0 -and $firstInstalled -and $firstRemoved -and
         $secondInstalled -and $secondRemoved -and $probeKept)

@(
  'OPTIC PREVIEW NSIS CLEAN REINSTALL — UNSIGNED / HOSTED CI ONLY'
  "Source SHA: $env:GITHUB_SHA"
  "Installer SHA256: $shaBefore"
  "First install/HKCU: $firstInstalled"
  "First uninstall: $firstRemoved"
  "Same-version clean reinstall/HKCU: $secondInstalled"
  "Second uninstall: $secondRemoved"
  "Synthetic AppData probe unchanged: $probeKept"
  'Real Optic settings/cross-PC sync/version upgrade: NOT TESTED'
  'WebView2 absent, React visuals, Windows 10/11 clean: NOT TESTED'
  'Updater signature / Authenticode / release readiness: NOT TESTED'
  'Optic AI Bridge / user PC: NOT TOUCHED'
  "Result: $(if ($pass) { 'PASS' } else { 'FAIL' })"
) | Set-Content -LiteralPath $report -Encoding utf8
Get-Content -LiteralPath $report

# The only AppData content created by this test is its synthetic probe.
# Never delete other files, even if they appeared during a failed cycle.
if ($probeCreated) {
  try {
    if (Test-Path -LiteralPath $probeFile -PathType Leaf) {
      Remove-Item -LiteralPath $probeFile -Force -ErrorAction Stop
    }
    if ((Test-Path -LiteralPath $profileDir -PathType Container) -and
        @(Get-ChildItem -LiteralPath $profileDir -Force).Count -eq 0) {
      Remove-Item -LiteralPath $profileDir -ErrorAction Stop
    }
  } catch {
    $errors.Add("Synthetic probe cleanup: $($_.Exception.Message)")
  }
}
if (-not $pass -or $errors.Count -ne 0) {
  throw ("Optic Preview clean-reinstall smoke failed: " + ($errors -join '; '))
}
