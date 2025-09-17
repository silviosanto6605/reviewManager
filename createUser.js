require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const { USERS_DB } = require('./config/initDb');

const username = process.env.USER;
const password = process.env.PASSWORD;

if (!username || !password) {
  console.log('USER o PASSWORD non specificati: nessun utente creato.');
  process.exit(0);
}

const db = new sqlite3.Database(USERS_DB);
db.run(`CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

db.get('SELECT id FROM Users WHERE username = ?', [username], (err, row) => {
  if (err) {
    console.error('Errore accesso DB:', err);
    process.exit(1);
  }
  if (row) {
    console.log('Utente già presente, nessuna azione:', username);
    db.close();
    return;
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Errore hash password:', err);
      process.exit(1);
    }
    db.run('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hash], (err) => {
      if (err) {
        console.error('Errore inserimento utente:', err);
      } else {
        console.log('Utente creato:', username);
      }
      db.close();
    });
  });
});