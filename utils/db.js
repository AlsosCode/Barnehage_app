const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');

// Les hele databasen
async function readDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw error;
  }
}

// Skriv til databasen
async function writeDatabase(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
}

// Hent alle barn
async function getChildren() {
  const db = await readDatabase();
  return db.children;
}

// Hent ett barn basert på ID
async function getChildById(id) {
  const db = await readDatabase();
  return db.children.find(child => child.id === parseInt(id));
}

// Oppdater et barn
async function updateChild(id, updates) {
  const db = await readDatabase();
  const index = db.children.findIndex(child => child.id === parseInt(id));

  if (index === -1) return null;

  db.children[index] = { ...db.children[index], ...updates };
  await writeDatabase(db);
  return db.children[index];
}

// Sjekk inn et barn
async function checkInChild(id) {
  const updates = {
    status: 'checked_in',
    checkedInAt: new Date().toISOString(),
    checkedOutAt: null
  };
  return await updateChild(id, updates);
}

// Sjekk ut et barn
async function checkOutChild(id) {
  const updates = {
    status: 'checked_out',
    checkedOutAt: new Date().toISOString()
  };
  return await updateChild(id, updates);
}

// Hent alle foreldre
async function getParents() {
  const db = await readDatabase();
  return db.parents;
}

// Hent en forelder basert på ID
async function getParentById(id) {
  const db = await readDatabase();
  return db.parents.find(parent => parent.id === parseInt(id));
}

// Oppdater forelder info
async function updateParent(id, updates) {
  const db = await readDatabase();
  const index = db.parents.findIndex(parent => parent.id === parseInt(id));

  if (index === -1) return null;

  db.parents[index] = { ...db.parents[index], ...updates };
  await writeDatabase(db);
  return db.parents[index];
}

// Hent alle aktiviteter
async function getActivities() {
  const db = await readDatabase();
  return db.activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Legg til en ny aktivitet
async function addActivity(activity) {
  const db = await readDatabase();
  const newActivity = {
    id: db.activities.length > 0 ? Math.max(...db.activities.map(a => a.id)) + 1 : 1,
    ...activity,
    createdAt: new Date().toISOString()
  };
  db.activities.push(newActivity);
  await writeDatabase(db);
  return newActivity;
}

// Hent aktiviteter for en gruppe
async function getActivitiesByGroup(groupName) {
  const db = await readDatabase();
  return db.activities
    .filter(activity => activity.group === groupName)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Hent alle grupper
async function getGroups() {
  const db = await readDatabase();
  return db.groups;
}

// Oppdater gruppe
async function updateGroup(id, updates) {
  const db = await readDatabase();
  const index = db.groups.findIndex(group => group.id === parseInt(id));

  if (index === -1) return null;

  db.groups[index] = { ...db.groups[index], ...updates };
  await writeDatabase(db);
  return db.groups[index];
}

// Hent statistikk
async function getStats() {
  const db = await readDatabase();
  const totalChildren = db.children.length;
  const checkedIn = db.children.filter(c => c.status === 'checked_in').length;
  const checkedOut = db.children.filter(c => c.status === 'checked_out').length;
  const home = db.children.filter(c => c.status === 'home').length;

  return {
    totalChildren,
    checkedIn,
    checkedOut,
    home,
    groups: db.groups
  };
}

module.exports = {
  readDatabase,
  writeDatabase,
  getChildren,
  getChildById,
  updateChild,
  checkInChild,
  checkOutChild,
  getParents,
  getParentById,
  updateParent,
  getActivities,
  addActivity,
  getActivitiesByGroup,
  getGroups,
  updateGroup,
  getStats
};
