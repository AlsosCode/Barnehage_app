const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');
const VALID_STATUSES = new Set(['checked_in', 'checked_out', 'home']);

const GROUP_LABELS = {
  bla: 'Blå gruppe',
  rod: 'Rød gruppe',
};

function normalizeGroupLabel(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const lower = raw.toLowerCase();
  const ascii = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleaned = ascii.replace(/[^a-z]/g, '');

  if (cleaned.includes('bla')) return GROUP_LABELS.bla;
  if (cleaned.includes('rod') || cleaned.includes('roed') || cleaned.includes('red')) {
    return GROUP_LABELS.rod;
  }
  return raw;
}

function groupKey(value) {
  const label = normalizeGroupLabel(value);
  const lower = String(label || '').toLowerCase();
  const ascii = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleaned = ascii.replace(/[^a-z]/g, '');

  if (cleaned.includes('bla')) return 'bla';
  if (cleaned.includes('rod') || cleaned.includes('roed') || cleaned.includes('red')) {
    return 'rod';
  }
  return '';
}

function normalizeStatus(status) {
  return VALID_STATUSES.has(status) ? status : 'home';
}

function normalizeChild(child) {
  const group = normalizeGroupLabel(child.group);
  return {
    ...child,
    name: child.name || 'Ukjent barn',
    age: typeof child.age === 'number' ? child.age : '',
    group,
    status: normalizeStatus(child.status),
    allergies: Array.isArray(child.allergies) ? child.allergies : [],
    consentGiven: !!child.consentGiven,
  };
}

function normalizeParent(parent) {
  return {
    ...parent,
    address: parent.address || '',
    verified: !!parent.verified,
    childrenIds: Array.isArray(parent.childrenIds) ? parent.childrenIds : [],
  };
}

function normalizeActivity(activity) {
  const group = normalizeGroupLabel(activity.group);
  return {
    ...activity,
    group: group || undefined,
  };
}

function normalizeGroup(group) {
  const name = normalizeGroupLabel(group.name) || group.name;
  return {
    ...group,
    name,
    currentCount: typeof group.currentCount === 'number' ? group.currentCount : 0,
    totalCapacity: typeof group.totalCapacity === 'number' ? group.totalCapacity : 0,
  };
}

function normalizeMessage(message) {
  return {
    id: message.id,
    parentId:
      typeof message.parentId === 'number'
        ? message.parentId
        : parseInt(message.parentId, 10) || 0,
    sender: message.sender === 'staff' ? 'staff' : 'parent',
    content: String(message.content || '').trim(),
    createdAt: message.createdAt || new Date().toISOString(),
    read: !!message.read,
  };
}

function normalizeDatabase(db) {
  return {
    children: Array.isArray(db.children) ? db.children.map(normalizeChild) : [],
    parents: Array.isArray(db.parents) ? db.parents.map(normalizeParent) : [],
    activities: Array.isArray(db.activities) ? db.activities.map(normalizeActivity) : [],
    groups: Array.isArray(db.groups) ? db.groups.map(normalizeGroup) : [],
    messages: Array.isArray(db.messages) ? db.messages.map(normalizeMessage) : [],
  };
}

async function readDatabase() {
  const data = await fs.readFile(DB_PATH, 'utf8');
  return normalizeDatabase(JSON.parse(data));
}

async function writeDatabase(data) {
  const normalized = normalizeDatabase(data);
  await fs.writeFile(DB_PATH, JSON.stringify(normalized, null, 2), 'utf8');
  return true;
}

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
}

// Children
async function getChildren() {
  const db = await readDatabase();
  return db.children;
}

async function getChildById(id) {
  const db = await readDatabase();
  return db.children.find((child) => child.id === parseInt(id, 10));
}

async function addChild(payload) {
  const db = await readDatabase();
  const parent = db.parents.find((p) => p.id === parseInt(payload.parentId, 10));
  if (!parent) {
    const err = new Error('Parent not found');
    err.status = 400;
    throw err;
  }

  const newChild = normalizeChild({
    id: nextId(db.children),
    name: payload.name,
    birthDate: payload.birthDate || '',
    age: typeof payload.age === 'number' ? payload.age : '',
    group: normalizeGroupLabel(payload.group),
    allergies: Array.isArray(payload.allergies) ? payload.allergies : [],
    status: normalizeStatus(payload.status),
    checkedInAt: payload.status === 'checked_in' ? new Date().toISOString() : null,
    checkedOutAt: null,
    parentId: parseInt(payload.parentId, 10),
    consentGiven: !!payload.consentGiven,
  });

  db.children.push(newChild);
  const updatedChildrenIds = Array.from(
    new Set([...(parent.childrenIds || []), newChild.id]),
  );
  const parentIndex = db.parents.findIndex((p) => p.id === parent.id);
  db.parents[parentIndex] = normalizeParent({
    ...parent,
    childrenIds: updatedChildrenIds,
  });

  await writeDatabase(db);
  return newChild;
}

async function updateChild(id, updates) {
  const db = await readDatabase();
  const index = db.children.findIndex((child) => child.id === parseInt(id, 10));
  if (index === -1) return null;

  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.age !== undefined) payload.age = updates.age;
  if (updates.group !== undefined) payload.group = normalizeGroupLabel(updates.group);
  if (updates.status !== undefined) payload.status = normalizeStatus(updates.status);
  if (updates.checkedInAt !== undefined) payload.checkedInAt = updates.checkedInAt;
  if (updates.checkedOutAt !== undefined) payload.checkedOutAt = updates.checkedOutAt;
  if (updates.allergies !== undefined && Array.isArray(updates.allergies)) {
    payload.allergies = updates.allergies;
  }
  if (updates.consentGiven !== undefined) payload.consentGiven = !!updates.consentGiven;

  db.children[index] = normalizeChild({ ...db.children[index], ...payload });
  await writeDatabase(db);
  return db.children[index];
}

async function checkInChild(id) {
  const updates = {
    status: 'checked_in',
    checkedInAt: new Date().toISOString(),
    checkedOutAt: null,
  };
  return updateChild(id, updates);
}

async function checkOutChild(id) {
  const updates = {
    status: 'checked_out',
    checkedOutAt: new Date().toISOString(),
  };
  return updateChild(id, updates);
}

// Parents
async function getParents() {
  const db = await readDatabase();
  return db.parents;
}

async function getParentById(id) {
  const db = await readDatabase();
  return db.parents.find((parent) => parent.id === parseInt(id, 10));
}

async function createParent(parent) {
  const db = await readDatabase();

  const newParent = {
    id: nextId(db.parents),
    name: parent.name,
    email: parent.email,
    phone: parent.phone,
    address: parent.address || '',
    verified: !!parent.verified,
    childrenIds: parent.childrenIds || [],
  };

  db.parents.push(newParent);
  await writeDatabase(db);

  return newParent;
}

async function updateParent(id, updates) {
  const db = await readDatabase();
  const index = db.parents.findIndex((parent) => parent.id === parseInt(id, 10));

  if (index === -1) return null;

  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.verified !== undefined) payload.verified = !!updates.verified;
  if (updates.childrenIds !== undefined) payload.childrenIds = updates.childrenIds;

  db.parents[index] = normalizeParent({ ...db.parents[index], ...payload });
  await writeDatabase(db);

  return db.parents[index];
}

// Activities
async function getActivities() {
  const db = await readDatabase();
  return db.activities
    .map(normalizeActivity)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function addActivity(activity) {
  const db = await readDatabase();
  const newActivity = {
    id: nextId(db.activities),
    ...activity,
    createdAt: new Date().toISOString(),
  };
  if (newActivity.group) {
    newActivity.group = normalizeGroupLabel(newActivity.group);
  }
  db.activities.push(newActivity);
  await writeDatabase(db);
  return newActivity;
}

async function getActivitiesByGroup(groupName) {
  const db = await readDatabase();
  const key = groupKey(groupName);

  return db.activities
    .filter((activity) => groupKey(activity.group) === key)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Groups & stats
async function getGroups() {
  const db = await readDatabase();
  return db.groups.map(normalizeGroup);
}

async function updateGroup(id, updates) {
  const db = await readDatabase();
  const index = db.groups.findIndex((group) => group.id === parseInt(id, 10));

  if (index === -1) return null;

  const payload = {};
  if (updates.name !== undefined) payload.name = normalizeGroupLabel(updates.name);
  if (updates.totalCapacity !== undefined) payload.totalCapacity = updates.totalCapacity;
  if (updates.currentCount !== undefined) payload.currentCount = updates.currentCount;

  db.groups[index] = normalizeGroup({ ...db.groups[index], ...payload });
  await writeDatabase(db);
  return db.groups[index];
}

async function getStats() {
  const db = await readDatabase();
  const children = db.children;

  const totalChildren = children.length;
  const checkedIn = children.filter((c) => c.status === 'checked_in').length;
  const checkedOut = children.filter((c) => c.status === 'checked_out').length;
  const home = children.filter((c) => c.status === 'home').length;

  const counts = {};
  children.forEach((c) => {
    const key = groupKey(c.group);
    if (!counts[key]) counts[key] = 0;
    if (c.status === 'checked_in') counts[key] += 1;
  });

  const groups = db.groups.map((g) => {
    const key = groupKey(g.name);
    return {
      ...g,
      currentCount: counts[key] || 0,
    };
  });

  return {
    totalChildren,
    checkedIn,
    checkedOut,
    home,
    groups,
  };
}

// Messages
async function getMessages() {
  const db = await readDatabase();
  return db.messages
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function getMessagesForParent(parentId) {
  const all = await getMessages();
  const idNum = parseInt(parentId, 10);
  return all.filter((m) => m.parentId === idNum);
}

async function addMessage(payload) {
  const db = await readDatabase();
  const parentId = parseInt(payload.parentId, 10);
  const parent = db.parents.find((p) => p.id === parentId);
  if (!parent) {
    const err = new Error('Parent not found');
    err.status = 400;
    throw err;
  }

  const content = String(payload.content || '').trim();
  if (!content) {
    const err = new Error('Message content is required');
    err.status = 400;
    throw err;
  }

  const newMessage = normalizeMessage({
    id: nextId(db.messages),
    parentId,
    sender: payload.sender === 'staff' ? 'staff' : 'parent',
    content,
    createdAt: new Date().toISOString(),
    read: false,
  });

  db.messages.push(newMessage);
  await writeDatabase(db);
  return newMessage;
}

async function markMessageRead(id) {
  const db = await readDatabase();
  const index = db.messages.findIndex((m) => m.id === parseInt(id, 10));
  if (index === -1) return null;

  db.messages[index] = {
    ...db.messages[index],
    read: true,
  };
  await writeDatabase(db);
  return normalizeMessage(db.messages[index]);
}

module.exports = {
  readDatabase,
  writeDatabase,
  getChildren,
  getChildById,
  addChild,
  updateChild,
  checkInChild,
  checkOutChild,
  getParents,
  getParentById,
  createParent,
  updateParent,
  getActivities,
  getActivitiesByGroup,
  addActivity,
  getGroups,
  updateGroup,
  getStats,
  getMessages,
  getMessagesForParent,
  addMessage,
  markMessageRead,
  groupKey,
  normalizeGroupLabel,
};

