param(
  [string]$OutDir = "reports"
)

$ErrorActionPreference = "Stop"
Write-Host "[slither] Preparing output directory: $OutDir" -ForegroundColor Cyan
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

function Has-Docker {
  try { Get-Command docker -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

if (Has-Docker) {
  Write-Host "[slither] Running via Docker" -ForegroundColor Cyan
  $cmd = @(
    "docker", "run", "--rm",
    "-v", "$(Get-Location)":/src,
    "-w", "/src",
    "trailofbits/slither",
    ".",
    "--config", "slither.config.json",
    "--json", "$OutDir/slither.json"
  )
  & $cmd[0] $cmd[1..($cmd.Length-1)]
} else {
  Write-Host "[slither] Docker non trovato. Prova WSL: npm run slither:wsl" -ForegroundColor Yellow
  throw "Slither runner requires Docker or WSL; install Docker Desktop or use WSL script."
}

Write-Host "[slither] Report JSON: $OutDir/slither.json" -ForegroundColor Green