// tools/validate-project-map.js
// Validerer at project-map.json samsvarer med filsystemet.
// Kjør: node tools/validate-project-map.js

const fs = require('fs');
const fsp = fs.promises;

function flatten(node, out = []) {
  if (!node) return out;
  if (node.type === 'file') {
    out.push(node.path);
  } else if (node.children) {
    for (const c of node.children) flatten(c, out);
  }
  return out;
}

async function exists(p) {
  try { await fsp.stat(p); return true; } catch { return false; }
}

async function main() {
  const raw = fs.readFileSync('project-map.json', 'utf8');
  const map = JSON.parse(raw);
  const files = flatten(map.tree);

  const missing = [];
  for (const p of files) {
    // bare valider filer, ikke katalognoder
    const ok = await exists(p);
    if (!ok) missing.push(p);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalMappedFiles: files.length,
    missingCount: missing.length,
    missing,
  };

  fs.writeFileSync('PROJECT_MAP_VALIDATION.json', JSON.stringify(report, null, 2), 'utf8');

  if (missing.length) {
    console.error(`⚠️  ${missing.length} filer fra kartet mangler på disk. Se PROJECT_MAP_VALIDATION.json`);
    process.exit(2);
  } else {
    console.log('✅ Kartet matcher filsystemet (alle filer funnet).');
  }
}

main().catch((e) => {
  console.error('Validering feilet:', e);
  process.exit(1);
});
