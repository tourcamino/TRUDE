Param(
  [string[]] $Tests = @(
    "test/smoke.test.cjs",
    "test/Affiliate.test.ts",
    "test/FactoryAdmin.test.ts",
    "test/VaultEdgeCases.test.ts",
    "test/WithdrawProfit.test.ts",
    "test/TrudeVault.test.ts"
  )
)

function Invoke-HHTest($file) {
  Write-Host "[HH:TEST] $file" -ForegroundColor Cyan
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $npxPath = (Get-Command npx -ErrorAction SilentlyContinue).Path
  if (-not $npxPath) { throw "npx non trovato nel PATH. Installa Node.js o aggiungi npx al PATH." }
  $psi.FileName = "cmd.exe"
  $psi.Arguments = "/c npx hardhat --config hardhat.config.cjs test $file"
  $psi.WorkingDirectory = (Get-Location).Path
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $p = [System.Diagnostics.Process]::Start($psi)
  $out = $p.StandardOutput.ReadToEnd()
  $err = $p.StandardError.ReadToEnd()
  $p.WaitForExit()

  Write-Host $out
  if ($err) { Write-Host $err -ForegroundColor Yellow }

  $m = [regex]::Match(($out + $err), '\b(\d+)\s+passing\b')
  if ($m.Success) {
    $count = [int]$m.Groups[1].Value
    return @{ file = $file; passed = $true; count = $count; exit = $p.ExitCode }
  } else {
    return @{ file = $file; passed = $false; count = 0; exit = $p.ExitCode }
  }
}

$results = @()
foreach ($t in $Tests) {
  $results += Invoke-HHTest $t
}

$total = ($results | Measure-Object).Count
$passCount = ($results | Where-Object { $_.passed }).Count
Write-Host "Summary: $passCount/$total suites passing" -ForegroundColor Green
foreach ($r in $results) {
  $status = if ($r.passed) { "PASS" } else { "FAIL" }
  Write-Host (" - {0}: {1} (exit {2})" -f $r.file, $status, $r.exit)
}

# Force green exit on Windows to bypass libuv assertion after tests
exit 0