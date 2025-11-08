param(
  [switch]$VerboseLog,
  [switch]$HardhatV3
)

function Write-Step($msg) {
  Write-Host "[upgrade] $msg"
}

function Exec($cmd, $cwd) {
  if ($VerboseLog) { Write-Host "[cmd] $cmd" }
  if ($cwd) { Push-Location $cwd }
  try {
    & cmd.exe /c $cmd 2>&1 | ForEach-Object { Write-Host $_ }
    $code = $LASTEXITCODE
    if ($null -eq $code) { $code = 0 }
    return $code
  }
  finally {
    if ($cwd) { Pop-Location }
  }
}

function ExecFile($file, $args, $cwd) {
  if ($VerboseLog) { Write-Host "[exec] $file $args" }
  if ($cwd) { Push-Location $cwd }
  try {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $file
    $psi.Arguments = $args
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    if ($cwd) { $psi.WorkingDirectory = $cwd }
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi
    $p.Start() | Out-Null
    $out = $p.StandardOutput.ReadToEnd()
    $err = $p.StandardError.ReadToEnd()
    $p.WaitForExit()
    if ($out) { Write-Host $out }
    if ($err) { Write-Host $err }
    return $p.ExitCode
  }
  finally {
    if ($cwd) { Pop-Location }
  }
}

$root = (Resolve-Path "$PSScriptRoot\..\").Path

Write-Step "Node/npm version"
ExecFile "node" "--version" $root | Out-Null
ExecFile "npm" "--version" $root | Out-Null

# 1) Aggiorna OZ Upgradeable alla versione coerente con gli import (4.9.6)
Write-Step "Aggiorno @openzeppelin/contracts-upgradeable@4.9.6"
$ozExit = ExecFile "npm" "i @openzeppelin/contracts-upgradeable@4.9.6 --save-exact --legacy-peer-deps" $root
if ($ozExit -ne 0) { Write-Step "[WARN] Install OZ upgradeable non riuscita, proseguo" }

if ($HardhatV3) {
  # 2a) Migrazione a Hardhat v3: allinea plugin, rimuove solidity-coverage
  Write-Step "Migrazione Hardhat v3: aggiorno hardhat, ethers@^4, chai-matchers@^3"
  $hh3Exit = ExecFile "npm" "i -D hardhat@^3 @nomicfoundation/hardhat-ethers@^4 @nomicfoundation/hardhat-chai-matchers@^3" $root
  if ($hh3Exit -ne 0) { Write-Step "[WARN] Aggiornamento Hardhat v3 non riuscito" }
  Write-Step "Rimuovo solidity-coverage (usare coverage Foundry)"
  $rmCovExit = ExecFile "npm" "rm solidity-coverage" $root
  if ($rmCovExit -ne 0) { Write-Step "[WARN] Rimozione solidity-coverage non riuscita o non presente" }
} else {
  # 2b) Mantieni Hardhat major 2 per compatibilità con solidity-coverage
  Write-Step "Aggiorno Hardhat e plugin compatibili (major 2)"
  $hhExit = ExecFile "npm" "i -D hardhat@^2.27.0 @nomicfoundation/hardhat-ethers@^3 @nomicfoundation/hardhat-chai-matchers@^2 solidity-coverage@^0.8.16" $root
  if ($hhExit -ne 0) { Write-Step "[WARN] Aggiornamento Hardhat (major 2) non riuscito, proseguo" }
}

Write-Step "Compilo Hardhat"
$compileExit = ExecFile "npm" "run hh:compile" $root
if ($compileExit -ne 0) { Write-Step "[ERROR] Compilazione Hardhat fallita"; exit $compileExit }

# 3) Aggiorna Foundry a stabile: tenta foundryup, fallback a cargo (installando cmake via winget se possibile)
function Try-Foundryup() {
  $fup1 = Join-Path $env:USERPROFILE ".foundry\bin\foundryup.exe"
  $fup2 = Join-Path $env:USERPROFILE ".foundry\bin\foundryup"
  if (Test-Path $fup1) {
    Write-Step "Eseguo foundryup.exe -v stable"
    return ExecFile $fup1 "-v stable" $root
  }
  elseif (Test-Path $fup2) {
    Write-Step "Eseguo foundryup -v stable"
    return ExecFile $fup2 "-v stable" $root
  }
  else {
    Write-Step "foundryup non trovato"
    return 1
  }
}

function Ensure-CMake() {
  $cm = Get-Command cmake -ErrorAction SilentlyContinue
  if ($cm) { Write-Step "cmake presente: $($cm.Source)"; return 0 }
  Write-Step "cmake non trovato, provo installazione via winget"
  $wg = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $wg) { Write-Step "winget non disponibile"; return 1 }
  $code = ExecFile "winget" "install --id Kitware.CMake -e --silent" $root
  if ($code -eq 0) { Write-Step "cmake installato"; return 0 }
  Write-Step "installazione cmake fallita"
  return 1
}

function Try-CargoFoundry() {
  $cargo = Get-Command cargo -ErrorAction SilentlyContinue
  if (-not $cargo) { Write-Step "Cargo non trovato"; return 1 }
  $cmStatus = Ensure-CMake
  if ($cmStatus -ne 0) { Write-Step "[WARN] cmake assente; skip cargo install"; return 1 }
  Write-Step "Installazione via cargo (forge, cast, anvil)"
  return ExecFile "cargo" "install --locked --git https://github.com/foundry-rs/foundry forge cast anvil" $root
}

Write-Step "Aggiorno Foundry a stabile"
$fuExit = Try-Foundryup
if ($fuExit -ne 0) {
  Write-Step "foundryup fallito, provo cargo"
  $cgExit = Try-CargoFoundry
  if ($cgExit -ne 0) { Write-Step "[WARN] Upgrade Foundry non riuscito, uso versione corrente" }
}

# 4) Verifica forge e rilancio build/test
$forgeExe = Join-Path $env:USERPROFILE ".foundry\bin\forge.exe"
if (-not (Test-Path $forgeExe)) { Write-Step "[ERROR] forge.exe non trovato in $forgeExe"; exit 1 }

Write-Step "Versione Forge"
ExecFile $forgeExe "--version" $root | Out-Null

Write-Step "Forge build"
$fbExit = ExecFile $forgeExe "build" $root
if ($fbExit -ne 0) { Write-Step "[ERROR] forge build fallita"; exit $fbExit }

Write-Step "Forge test locali (Vault.t.sol)"
$ftExit = ExecFile $forgeExe "test --match-path test/Vault.t.sol -vv" $root
if ($ftExit -ne 0) { Write-Step "[WARN] test locali falliti" }

Write-Step "Upgrade completato"
exit 0