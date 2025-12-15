// MongoDB-backed implementation placeholder.
// Implement these functions to match the interface in utils/db.js
// and then set DB_DRIVER=mongo in the backend environment.

async function notImplemented(name) {
  const err = new Error(`MongoDB driver is not implemented yet (called ${name})`);
  err.status = 500;
  throw err;
}

module.exports = {
  readDatabase: () => notImplemented('readDatabase'),
  writeDatabase: () => notImplemented('writeDatabase'),
  getChildren: () => notImplemented('getChildren'),
  getChildById: () => notImplemented('getChildById'),
  addChild: () => notImplemented('addChild'),
  updateChild: () => notImplemented('updateChild'),
  checkInChild: () => notImplemented('checkInChild'),
  checkOutChild: () => notImplemented('checkOutChild'),
  getParents: () => notImplemented('getParents'),
  getParentById: () => notImplemented('getParentById'),
  createParent: () => notImplemented('createParent'),
  updateParent: () => notImplemented('updateParent'),
  getActivities: () => notImplemented('getActivities'),
  getActivitiesByGroup: () => notImplemented('getActivitiesByGroup'),
  addActivity: () => notImplemented('addActivity'),
  getGroups: () => notImplemented('getGroups'),
  updateGroup: () => notImplemented('updateGroup'),
  getStats: () => notImplemented('getStats'),
  groupKey: () => notImplemented('groupKey'),
  normalizeGroupLabel: () => notImplemented('normalizeGroupLabel'),
};

