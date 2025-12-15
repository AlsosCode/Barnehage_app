// tools/summarize-project-map.js
// Lager menneskelig dokument (docs/PROJECT_STRUCTURE.md) ut fra project-map.json
// Kjør: node tools/summarize-project-map.js

const fs = require('fs');
const path = require('path');

function header(txt) { return `## ${txt}\n`; }

function list(arr) {
  return arr.map((x) => `- \`${x}\``).join('\n') + (arr.length ? '\n' : '');
}

function summarizeGroups(groups) {
  const parts = [];
  parts.push(header('Frontend (detektert)'));
  parts.push(list(groups.frontend || []));
  parts.push(header('Backend (detektert)'));
  parts.push(list(groups.backend || []));
  parts.push(header('Shared (detektert)'));
  parts.push(list(groups.shared || []));
  parts.push(header('Øvrig'));
  parts.push(list(groups.other || []));
  return parts.join('\n');
}

function main() {
  const data = JSON.parse(fs.readFileSync('project-map.json', 'utf8'));
  const outDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const md = [
    '# Prosjektstruktur',
    '',
    `Generert: ${new Date().toISOString()}`,
    '',
    'Denne filen er generert automatisk fra `project-map.json` og viser en oversikt over prosjektets struktur.',
    '',
    '---',
    '',
    '### Oppsummering',
    '',
    `- Filer totalt: **${data.summary.totalFiles}**`,
    `- Frontend: **${data.summary.frontend}**`,
    `- Backend: **${data.summary.backend}**`,
    `- Shared: **${data.summary.shared}**`,
    `- Øvrig: **${data.summary.other}**`,
    '',
    '---',
    '',
    summarizeGroups(data.groups),
    '',
    '> Kjør `npm run gen:map` for å oppdatere kartet og `npm run map:docs` for å regenerere dette dokumentet.',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'PROJECT_STRUCTURE.md'), md, 'utf8');
  console.log('✅ docs/PROJECT_STRUCTURE.md opprettet/oppdatert.');
}

main();
