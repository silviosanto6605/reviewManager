const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DATA_DIR = path.join(__dirname, '..');
const MAIN_DB = path.join(DATA_DIR, 'data.db');
const USERS_DB = path.join(DATA_DIR, 'users.db');

function open(dbPath) {
  return new sqlite3.Database(dbPath);
}

function initAlbumTable(db) {
  db.run(`CREATE TABLE IF NOT EXISTS Album (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Cover TEXT NOT NULL,
    Nome TEXT NOT NULL,
    Artista TEXT NOT NULL,
    Data TEXT NOT NULL,
    Voto REAL NOT NULL,
    Genere TEXT NOT NULL,
    Possesso TEXT NOT NULL
  )`);
}

function initUsersTable(db) {
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
}

function initAll() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const adb = open(MAIN_DB);
  initAlbumTable(adb);
  adb.close();
  const udb = open(USERS_DB);
  initUsersTable(udb);
  udb.close();
}

module.exports = {
  MAIN_DB,
  USERS_DB,
  open,
  initAll
};
