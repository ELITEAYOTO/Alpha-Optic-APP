# Read-only verification for a FUTURE officially approved Optic Windows release.
# Never installs, starts, downloads, trusts or adds a certificate.
# The SHA-256 and publisher thumbprint MUST come from the independently checked
# official release record, not from the same untrusted download.
param(
  [Parameter(Mandatory = $true)][string]$InstallerPath,
  [Parameter(Mandatory = $true)][string]$ExpectedSha256,
  [Parameter(Mandatory = $true)][string]$ExpectedPublisherThumbprint
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) {
  throw 'Installer Authenticode verification requires Windows.'
}
if ($ExpectedSha256 -cnotmatch '^[0-9A-Fa-f]{64}$') {
  throw 'Expected SHA-256 must be exactly 64 hexadecimal characters.'
}
if ($ExpectedPublisherThumbprint -cnotmatch '^[0-9A-Fa-f]{40}$') {
  throw 'Expected publisher certificate SHA-1 thumbprint must be exactly 40 hexadecimal characters.'
}

$file = Get-Item -LiteralPath $InstallerPath -ErrorAction Stop
if (-not ($file -is [System.IO.FileInfo]) -or
    $file.Attributes.HasFlag([System.IO.FileAttributes]::ReparsePoint) -or
    $file.Length -lt 1024 -or
    $file.Name -notmatch '^Optic(?: Preview)?[ _-].+-setup\.exe$') {
  throw 'Installer must be a non-link Optic NSIS setup executable with plausible size.'
}

$actualHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToUpperInvariant()
if ($actualHash -cne $ExpectedSha256.ToUpperInvariant()) {
  throw 'Installer SHA-256 mismatch; refusing to approve this file.'
}

$signature = Get-AuthenticodeSignature -LiteralPath $file.FullName
if ($signature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
    $null -eq $signature.SignerCertificate) {
  throw 'Installer Authenticode signature is missing, untrusted or invalid.'
}

$actualThumbprint = $signature.SignerCertificate.Thumbprint.Replace(' ', '').ToUpperInvariant()
if ($actualThumbprint -cne $ExpectedPublisherThumbprint.ToUpperInvariant()) {
  throw 'Installer publisher certificate does not match the independently approved publisher pin.'
}

# A matching SHA and valid expected signature permit inspection only.
# Whether it is safe to run also depends on the official release, OS and
# project compatibility and is not decided by this script.
Write-Output 'Optic Windows installer integrity and trusted-publisher signature: VERIFIED (read-only).'
Write-Output "File: $($file.Name)"
Write-Output "SHA256: $actualHash"
Write-Output "Publisher certificate thumbprint: $actualThumbprint"
Write-Output 'No installer was executed and no certificate store was changed.'
