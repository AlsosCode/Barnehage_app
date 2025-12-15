// tools/generate-project-map.js
// Node.js script som genererer project-map.json ved å traversere repoet.
// Kjører med: node tools/generate-project-map.js
// Ingen eksterne biblioteker.
// Filtre for store mapper (node_modules, build, osv). Skipper symlinks.

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const EXCLUDES = new Set([
  'node_modules', '.git', '.next', '.expo', 'dist', 'build', 'out',
  'android', 'ios', '.turbo', '.vercel', '.cache', '.DS_Store',
]);
const MAX_DEPTH = 12;

function isExcluded(name) {
  return EXCLUDES.has(name) || name.startsWith('.');
}

async function statSafe(p) {
  try { return await fsp.lstat(p); } catch { return null; }
}

async function readDirSafe(p) {
  try { return await fsp.readdir(p); } catch { return []; }
}

async function walk(dir, depth = 0) {
  if (depth > MAX_DEPTH) return null;
  const base = path.basename(dir);
  if (depth > 0 && isExcluded(base)) return null;

  const entries = await readDirSafe(dir);
  const children = [];

  for (const name of entries) {
    if (isExcluded(name)) continue;
    const full = path.join(dir, name);
    const st = await statSafe(full);
    if (!st) continue;

    if (st.isSymbolicLink()) continue; // skip symlinks
    if (st.isDirectory()) {
      const node = await walk(full, depth + 1);
      if (node) children.push(node);
    } else if (st.isFile()) {
      children.push({ type: 'file', name, path: full });
    }
  }

  // sort: dirs first, then files
  children.sort((a, b) => {
    const aDir = a.type !== 'file';
    const bDir = b.type !== 'file';
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return { type: 'dir', name: base, path: dir, children };
}

function groupPaths(flatFiles) {
  const groups = { frontend: [], backend: [], shared: [], other: [] };
  for (const p of flatFiles) {
    const lower = p.toLowerCase();
    const isFront =
      lower.includes('/src/') || lower.includes('/app/') ||
      lower.includes('/components/') || lower.includes('/screens/') ||
      lower.includes('/navigation/') || lower.includes('/theme/');
    const isBack =
      lower.includes('/server/') || lower.includes('/api/') ||
      lower.includes('/backend/') || lower.includes('/controllers/') ||
      lower.includes('/services/') || lower.includes('/models/') ||
      lower.includes('/migrations/') || lower.includes('/middlewares/');
    const isShared =
      lower.includes('/shared/') || lower.includes('/types/') ||
      lower.includes('/utils/') || lower.includes('/constants/');

    if (isFront) groups.frontend.push(p);
    else if (isBack) groups.backend.push(p);
    else if (isShared) groups.shared.push(p);
    else groups.other.push(p);
  }
  return groups;
}

function flatten(node, out = []) {
  if (!node) return out;
  if (node.type === 'file') {
    out.push(node.path);
    return out;
  }
  if (node.children) {
    for (const c of node.children) flatten(c, out);
  }
  return out;
}

async function main() {
  const root = process.cwd();
  const tree = await walk(root, 0);
  const files = flatten(tree);
  const groups = groupPaths(files);

  const summary = {
    totalFiles: files.length,
    frontend: groups.frontend.length,
    backend: groups.backend.length,
    shared: groups.shared.length,
    other: groups.other.length,
  };

  const payload = {
    root,
    generatedAt: new Date().toISOString(),
    node: process.version,
    excludes: Array.from(EXCLUDES),
    summary,
    groups,
    tree, // full trestruktur
  };

  const outPath = path.join(root, 'project-map.json');
  await fsp.writeFile(outPath, JSON.stringify(payload, null, 2), 'utf8');

  // valgfri kort MD-oversikt
  const md = [
    '# Project Map',
    '',
    `Generert: ${payload.generatedAt}`,
    '',
    '## Oppsummering',
    `- Filer totalt: ${summary.totalFiles}`,
    `- Frontend: ${summary.frontend}`,
    `- Backend: ${summary.backend}`,
    `- Shared: ${summary.shared}`,
    `- Øvrig: ${summary.other}`,
    '',
    '## Nøkkelmapper (finnes om de er detektert)',
    '- Frontend: src/, app/, components/, screens/, navigation/, theme/',
    '- Backend: server/, api/, backend/, controllers/, services/, models/, migrations/, middlewares/',
    '- Shared: shared/, types/, utils/, constants/',
    '',
    '> Dette filtreet er grunnlag for videre arbeid og holdes oppdatert ved å kjøre scriptet på nytt.',
    '',
  ].join('\n');

  await fsp.writeFile(path.join(root, 'PROJECT_MAP.md'), md, 'utf8');

  console.log('✅ project-map.json og PROJECT_MAP.md generert.');
}

main().catch((err) => {
  console.error('Feil ved generering av Project Map:', err);
  process.exit(1);
});
