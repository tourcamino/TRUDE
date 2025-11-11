/*
 * Gas Check: parses hardhat-gas-reporter output file and enforces thresholds.
 * Usage:
 *   node scripts/gas-check.js [reports/gas-report.txt] [gas-thresholds.json]
 */
const fs = require('fs');
const path = require('path');

function parseNumber(n) {
  if (!n) return NaN;
  return parseInt(String(n).replace(/[^0-9]/g, ''), 10);
}

function parseReport(reportPath) {
  const text = fs.readFileSync(reportPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    if (!line.includes('|')) continue;
    const parts = line
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    // Expect at least: Contract, Method, Min, Max, Avg, # calls
    if (parts.length < 6) continue;
    if (/^Contract$/i.test(parts[0]) && /^Method$/i.test(parts[1])) continue; // header
    if (/^·/.test(parts[0]) || parts[0].includes('-------')) continue; // separator
    const [contract, method, min, max, avg] = parts;
    const calls = parts[5];
    const avgNum = parseNumber(avg);
    if (!contract || !method || !Number.isFinite(avgNum)) continue;
    rows.push({
      key: `${contract}#${method}`,
      contract,
      method,
      min: parseNumber(min),
      max: parseNumber(max),
      avg: avgNum,
      calls: parseNumber(calls),
    });
  }
  return rows;
}

function main() {
  const reportPath = process.argv[2] || path.join('reports', 'gas-report.txt');
  const thresholdsPath = process.argv[3] || path.join('gas-thresholds.json');
  if (!fs.existsSync(reportPath)) {
    console.error(`Gas Check: report file not found: ${reportPath}`);
    process.exit(2);
  }
  if (!fs.existsSync(thresholdsPath)) {
    console.error(`Gas Check: thresholds file not found: ${thresholdsPath}`);
    process.exit(2);
  }

  const rows = parseReport(reportPath);
  const thresholds = JSON.parse(fs.readFileSync(thresholdsPath, 'utf8'));

  const violations = [];
  const warnMissing = [];
  for (const [key, limit] of Object.entries(thresholds)) {
    const row = rows.find((r) => r.key === key);
    if (!row) {
      warnMissing.push(key);
      continue;
    }
    if (row.avg > limit) {
      violations.push({ key, avg: row.avg, limit });
    }
  }

  if (warnMissing.length) {
    console.warn('Gas Check: thresholds not found in report for keys:');
    for (const k of warnMissing) console.warn(`  - ${k}`);
  }

  if (violations.length) {
    console.error('Gas Check: violations found:');
    for (const v of violations) {
      console.error(`  - ${v.key}: avg ${v.avg} > limit ${v.limit}`);
    }
    process.exit(1);
  }

  console.log('Gas Check: OK — no violations.');
}

main();