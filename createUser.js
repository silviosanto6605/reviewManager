
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node createUser.js <username> <password>');
  process.exit(1);
}

bcrypt.hash(password, 10, function(err, hash) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const db = new sqlite3.Database('users.db');
  // Crea la tabella se non esiste
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // Inserisce il nuovo utente
    db.run("INSERT INTO Users (username, password) VALUES (?, ?)", [username, hash], function(err) {
      if (err) {
        console.error('Errore durante l\'inserimento dell\'utente:', err);
      } else {
        console.log('Utente creato con successo:', username);
      }
      db.close();
    });
  });
});