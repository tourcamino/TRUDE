const fs = require("fs");
const path = require("path");

const root = process.cwd();
const includeExt = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".html", ".css", ".scss", ".yml", ".yaml", ".json", ".toml"]);
const excludeDirs = new Set(["node_modules", "lib", "artifacts", "cache", "coverage", ".git"]);
const italianWords = [
  "benvenuto","impostazioni","profilo","registrazione","accesso","accedi","esci","carica","modifica","salva","annulla","elimina","conferma","errore","attenzione","guida","preferenze","notifiche","messaggi","utente","telefono","indirizzo","città","paese","contatti","fatturazione","ordini","prodotti","carrello","pagamento","spedizione","termini","supporto","informazioni","chi siamo","calendario","statistiche","impostare","impostato","ricerca","filtro","seleziona","selezionato","selezione","caricamento","scarica","scaricato","stato","attivo","disattivo","nuovo","vecchio","aggiorna","aggiornato","aggiornamento","successo","fallito","completato","in corso"
];
const wordsRe = new RegExp("\\b(" + italianWords.join("|") + ")\\b", "i");
const accentRe = /[àèéìòù]/i;

function shouldSkipDir(seg) {
  return excludeDirs.has(seg);
}

function listFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (shouldSkipDir(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...listFiles(p));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (includeExt.has(ext)) out.push(p);
    }
  }
  return out;
}

function scanFile(fp) {
  const rel = path.relative(root, fp);
  const nameHas = accentRe.test(rel) || wordsRe.test(rel);
  const content = fs.readFileSync(fp, "utf8");
  const lines = content.split(/\r?\n/);
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (accentRe.test(line) || wordsRe.test(line)) {
      matches.push({ line: i + 1, text: line.slice(0, 300) });
      if (matches.length >= 3) break;
    }
  }
  return { rel, nameHas, matches };
}

const files = listFiles(root);
const findings = [];
for (const f of files) {
  const r = scanFile(f);
  if (r.nameHas || r.matches.length) findings.push(r);
}

if (findings.length) {
  console.log("Italian content detected:");
  for (const f of findings) {
    console.log("-", f.rel);
    for (const m of f.matches) {
      console.log("  ", m.line + ":", m.text);
    }
  }
  process.exit(1);
} else {
  console.log("English-only check passed");
}
