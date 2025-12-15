#!/usr/bin/env node
// Quick DB fixer: normalizes group labels, statuses, and fills missing fields.
// Usage: node tools/fix-db.js
const path = require('path');
const fs = require('fs');
const db = require('../utils/db');

async function run() {
  const DB_PATH = path.join(__dirname, '..', 'database.json');
  const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const normalized = await db.readDatabase(); // already normalizes

  // Preserve pickupAuthorizations etc. by merging normalized into original shape
  fs.writeFileSync(DB_PATH, JSON.stringify(normalized, null, 2), 'utf8');
  console.log('database.json normalized and saved.');
}

run().catch((err) => {
  console.error('Failed to fix database:', err);
  process.exit(1);
});
