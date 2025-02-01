var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var sqlite3 = require('sqlite3').verbose();

// Rimuoviamo l'array statico degli utenti
// var users = [ ... ];

router.get('/', function(req, res) {
  res.render('login', { title: 'Login', message: null });
});

router.post('/', function(req, res) {
  var { username, password } = req.body;
  // Usa il nuovo database per il login
  var db = new sqlite3.Database('users.db');

  db.get("SELECT * FROM Users WHERE username = ?", [username], function(err, row) {
    if (err) {
      console.error(err);
      return res.render('login', { title: 'Login', message: 'Errore interno' });
    }
    if (!row) {
      return res.render('login', { title: 'Login', message: 'Credenziali non valide' });
    }
    bcrypt.compare(password, row.password, function(err, result) {
      if (result) {
        req.session.user = row;
        res.redirect('/view');
      } else {
        res.render('login', { title: 'Login', message: 'Credenziali non valide' });
      }
    });
  });
  db.close();
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;