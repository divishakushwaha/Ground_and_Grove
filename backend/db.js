// Opens the SQLite file and makes sure the tables exist.
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '..', 'database', 'grounds_and_grooves.db');
const schemaFile = path.join(__dirname, '..', 'database', 'schema.sql');

const db = new Database(dbFile);
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(schemaFile, 'utf8'));

module.exports = db;
