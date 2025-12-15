// Simple driver wrapper so we can swap JSON file DB with Mongo later
const driver = process.env.DB_DRIVER || 'json';

// Default JSON file-backed database implementation
const jsonImpl = require('./dbJson');
let impl = jsonImpl;

if (driver === 'mongo') {
  try {
    // Placeholder – implement Mongo-backed version in utils/db.mongo.js
    // with the same exported functions as utils/dbJson.js
    // eslint-disable-next-line global-require
    impl = require('./db.mongo');
  } catch (err) {
    // Fallback to JSON if Mongo driver is not implemented yet
    // eslint-disable-next-line no-console
    console.warn(
      '[dbDriver] DB_DRIVER=mongo set but utils/db.mongo.js not implemented, falling back to JSON driver.',
    );
    impl = jsonImpl;
  }
}

module.exports = impl;
