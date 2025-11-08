#!/usr/bin/env node
const fs = require('fs');

function fail(msg) {
  console.error(`Slither CI failed: ${msg}`);
  process.exit(1);
}

function rankFromImpact(impactRaw) {
  const s = String(impactRaw || '').toLowerCase();
  if (s === 'high') return 3;
  if (s === 'medium') return 2;
  if (s === 'low') return 1;
  // informational or unknown
  return 0;
}

const path = process.argv[2];
if (!path) fail('missing report path argument');

if (!fs.existsSync(path)) fail(`report not found at ${path}`);

let json;
try {
  json = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (e) {
  fail(`cannot parse JSON report: ${e.message}`);
}

// Support multiple JSON shapes across slither versions
const detectors = (json.results && json.results.detectors) || json.detectors || [];

if (!Array.isArray(detectors)) {
  fail('unexpected report format: detectors not an array');
}

const thresholdEnv = String(process.env.SLITHER_MIN_SEVERITY || 'medium').toLowerCase();
const thresholdRank = thresholdEnv === 'high' ? 3 : thresholdEnv === 'low' ? 1 : 2; // default medium

if (detectors.length === 0) {
  console.log('Slither CI: no findings for mandatory detectors.');
  process.exit(0);
}

let failCount = 0;
let warnCount = 0;
console.log(`Slither CI: evaluating findings with severity threshold='${thresholdEnv}'.`);
for (const d of detectors) {
  const id = d.check || d.id || 'unknown';
  const impact = d.impact || d.level || d.severity || 'unknown';
  const rank = rankFromImpact(impact);
  const msg = d.description || d.check || id;
  if (rank >= thresholdRank) {
    console.log(`ERROR [${impact}] - ${id}: ${msg}`);
    failCount++;
  } else {
    console.log(`WARN  [${impact}] - ${id}: ${msg}`);
    warnCount++;
  }
}

if (failCount > 0) {
  fail(`mandatory detector findings at or above threshold (errors=${failCount}, warnings=${warnCount}).`);
} else {
  console.log(`Slither CI: no findings at or above threshold (warnings=${warnCount}).`);
  process.exit(0);
}