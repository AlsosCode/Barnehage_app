// tools/print-project-map.js
// Leser project-map.json og skriver en kompakt oversikt til konsollen.
// Kjører med: node tools/print-project-map.js

const fs = require('fs');

function printNode(node, indent = '') {
  if (!node) return;
  if (node.type === 'file') {
    console.log(indent + '📄 ' + node.name);
    return;
  }
  console.log(indent + '📁 ' + node.name);
  if (node.children) {
    for (const c of node.children) printNode(c, indent + '  ');
  }
}

function main() {
  const data = JSON.parse(fs.readFileSync('project-map.json', 'utf8'));
  console.log('Root:', data.root);
  console.log('Generert:', data.generatedAt);
  console.log('Oppsummering:', data.summary);
  console.log('\nTre:\n');
  printNode(data.tree, '');
}

main();
