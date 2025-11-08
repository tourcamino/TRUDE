param(
  [int]$Port = 8545
)

# Start Ganache, run Truffle compile+test for JS files, then run Hardhat tests.
# Emit a consolidated summary at the end.

$ErrorActionPreference = "Stop"

function Start-Ganache {
  param([int]$GanachePort)
  Write-Host "[meta] Starting Ganache on port $GanachePort" -ForegroundColor Cyan
  $cmd = "npx"
  $args = @("ganache", "-p", $GanachePort)

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "cmd.exe"
  $psi.Arguments = "/c $cmd $($args -join ' ')"
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true

  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  [void]$proc.Start()
  Start-Sleep -Milliseconds 1000
  return $proc
}

function Run-Cmd {
  param([string]$Command, [string]$Cwd)
  Write-Host "[meta] Running: $Command" -ForegroundColor Cyan
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "cmd.exe"
  $psi.Arguments = "/c $Command"
  $psi.WorkingDirectory = $Cwd
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  [void]$proc.Start()
  $stdout = $proc.StandardOutput.ReadToEnd()
  $stderr = $proc.StandardError.ReadToEnd()
  $proc.WaitForExit()
  return @{ code = $proc.ExitCode; out = $stdout; err = $stderr }
}

$repoRoot = (Resolve-Path ".").Path
$ganache = $null
$summary = @()

try {
  # 1) Start Ganache
  $ganache = Start-Ganache -GanachePort $Port
  $summary += "Ganache: started on 127.0.0.1:$Port"

  # 2) Truffle compile
  $compile = Run-Cmd -Command "npm run truffle:compile" -Cwd $repoRoot
  if ($compile.code -eq 0) {
    $summary += "Truffle compile: OK"
  } else {
    $summary += "Truffle compile: FAIL ($($compile.code))"
  }

  # 3) Truffle test (explicit JS files)
  $test = Run-Cmd -Command "npm run truffle:test" -Cwd $repoRoot
  if ($test.code -eq 0) {
    $summary += "Truffle test: OK"
  } else {
    $summary += "Truffle test: FAIL ($($test.code))"
  }

  # 4) Hardhat tests via Windows aggregator
  $hh = Run-Cmd -Command "npm run hh:test:win" -Cwd $repoRoot
  if ($hh.code -eq 0) {
    $summary += "Hardhat test (Windows): OK"
  } else {
    $summary += "Hardhat test (Windows): FAIL ($($hh.code))"
  }
}
finally {
  if ($ganache -ne $null -and -not $ganache.HasExited) {
    Write-Host "[meta] Stopping Ganache" -ForegroundColor Cyan
    try { $ganache.Kill() } catch {}
  }
}

Write-Host "`n===== Consolidated Summary =====" -ForegroundColor Green
foreach ($line in $summary) { Write-Host $line }