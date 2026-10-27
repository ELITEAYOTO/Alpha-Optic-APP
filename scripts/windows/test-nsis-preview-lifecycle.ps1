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
    -not $env:LOCALAPPDATA) {
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

# Do not overwrite anything, even on the isolated Windows runner.
if ((Test-Path -LiteralPath $installDir) -or
    @(Find-PreviewRegistration $userUninstall).Count -gt 0 -or
    @(Find-PreviewRegistration $machineUninstall).Count -gt 0) {
  throw 'An Optic Preview installation already exists; refusing to replace it.'
}

$errors = [System.Collections.Generic.List[string]]::new()
$installed = $false
$uninstalled = $false
$hash = (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash

try {
  Invoke-Bounded $installer 'NSIS Preview installation'
  $entries = @(Find-PreviewRegistration $userUninstall)
  if ($entries.Count -ne 1 -or
      @(Find-PreviewRegistration $machineUninstall).Count -ne 0 -or
      $entries[0].DisplayVersion -ne '0.0.1') {
    throw 'Optic Preview registration is not exactly one HKCU record with expected version.'
  }
  if (-not (Test-Path -LiteralPath $installDir -PathType Container) -or
      -not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) {
    throw 'Expected current-user Preview installation or owned uninstaller is missing.'
  }
  $executables = @(Get-ChildItem -LiteralPath $installDir -Filter '*.exe' -File |
    Where-Object { $_.Name -ne 'uninstall.exe' })
  if ($executables.Count -ne 1 -or $executables[0].Length -lt 1024) {
    throw 'Expected exactly one installed Preview executable.'
  }
  if ((Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash -ne $hash) {
    throw 'Installer content changed during the test.'
  }
  $installed = $true
} catch {
  $errors.Add("Install/check: $($_.Exception.Message)")
} finally {
  # Cleanup is deliberately restricted to the uninstaller produced in the exact
  # previously absent Preview directory. Never recursively delete user data.
  if (Test-Path -LiteralPath $uninstaller -PathType Leaf) {
    try {
      Invoke-Bounded $uninstaller 'NSIS Preview uninstallation'
      $deadline = [DateTime]::UtcNow.AddSeconds(30)
      do {
        $remainingUser = @(Find-PreviewRegistration $userUninstall).Count
        $remainingMachine = @(Find-PreviewRegistration $machineUninstall).Count
        $remainingDir = Test-Path -LiteralPath $installDir
        if ($remainingUser -eq 0 -and $remainingMachine -eq 0 -and -not $remainingDir) { break }
        Start-Sleep -Milliseconds 500
      } while ([DateTime]::UtcNow -lt $deadline)
      if ($remainingUser -ne 0 -or $remainingMachine -ne 0 -or $remainingDir) {
        throw "Preview uninstall left remnants (HKCU=$remainingUser, HKLM=$remainingMachine, directory=$remainingDir)."
      }
      $uninstalled = $true
    } catch {
      $errors.Add("Uninstall: $($_.Exception.Message)")
    }
  } else {
    $errors.Add('Cleanup: no owned Preview uninstaller was found; ephemeral runner must be discarded.')
  }
  $pass = $errors.Count -eq 0 -and $installed -and $uninstalled
  @(
    'OPTIC PREVIEW NSIS LIFECYCLE — UNSIGNED / GITHUB-HOSTED CI ONLY'
    "Source SHA: $env:GITHUB_SHA"
    "Installer SHA256: $hash"
    "HKCU install: $installed"
    "Uninstall and owned-path cleanup: $uninstalled"
    'React visuals / WebView2 missing / upgrade / Windows 10: NOT TESTED'
    'Updater signature / Authenticode / release readiness: NOT TESTED'
    'Optic AI Bridge / user PC: NOT TOUCHED'
    "Result: $(if ($pass) { 'PASS' } else { 'FAIL' })"
  ) | Set-Content -LiteralPath $report -Encoding utf8
  Get-Content -LiteralPath $report
}
if (-not $pass) {
  throw ("Optic Preview lifecycle failed: " + ($errors -join '; '))
}
