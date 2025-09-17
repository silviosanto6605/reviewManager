var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var multer = require('multer');
var csvParser = require('csv-parser');
var fs = require('fs');
var path = require('path');
const { MAIN_DB } = require('../config/initDb');

var router = express.Router();

// Set up multer for handling file uploads
var upload = multer({
  dest: 'uploads/'
});

// Route to get a specific album for editing
router.get('/', function (req, res) {
  var db = new sqlite3.Database(MAIN_DB);
  var albumId = req.query.id;

  if (!albumId) {
    return res.status(400).send('Bad Request: Missing ID');
  }

  db.get(`SELECT * FROM Album WHERE ID = ?`, [albumId], function (err, row) {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      return res.status(404).send('Album not found');
    }

    res.render('edit', {
      title: 'Edit album entry',
      album: row
    });
  });

  db.close();
});

// Route to update existing album
router.post('/', function (req, res) {
  var db = new sqlite3.Database(MAIN_DB);
  var albumId = req.query.id;

  if (!albumId) {
    return res.status(400).send('Bad Request: Missing ID');
  }

  var {
    cover,
    name,
    artist,
    date,
    rating,
    possession,
    genre
  } = req.body;

  if (!cover || !name || !artist || !date || !rating || !possession || !genre) {
    return res.status(400).send('Bad Request: Missing required fields');
  }

  db.run(`UPDATE Album SET Cover = ?, Nome = ?, Artista = ?, Data = ?, Voto = ?, Possesso = ?, Genere = ? WHERE ID = ?`,
    [cover, name, artist, date, rating, possession, genre, albumId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      res.redirect('/edit?id=' + albumId);
    });

  db.close();
});

// Route to add a new album
router.post('/add', function (req, res) {
  var db = new sqlite3.Database(MAIN_DB);
  var {
    cover,
    name,
    artist,
    date,
    rating,
    possession,
    genre
  } = req.body;

  if (!cover || !name || !artist || !date || !rating || !possession || !genre) {
    return res.status(400).send('Bad Request: Missing required fields');
  }

  db.run(`INSERT INTO Album (Cover, Nome, Artista, Data, Voto, Genere, Possesso) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [cover, name, artist, date, rating, genre, possession],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      console.log('Nuovo album aggiunto ID:', this.lastID, name, artist, date);
      res.redirect('/view');
    });
  db.close();
});

router.post('/add/csv', upload.single('csvFile'), function (req, res) {
  var db = new sqlite3.Database(MAIN_DB);

  // Verifica che il file sia presente
  if (!req.file) {
    return res.status(400).send('Bad Request: Nessun file CSV caricato');
  }

  var csvFilePath = path.join(__dirname, '../', req.file.path);

  // Leggi e analizza il file CSV
  var albums = [];

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      albums.push(row);
    })
    .on('end', () => {
      // Trova il massimo ID una volta prima di importare gli album
      db.serialize(() => {
        const insertStmt = db.prepare(`INSERT INTO Album (Cover, Nome, Artista, Data, Voto, Genere, Possesso) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        let inserted = 0;
        let skipped = 0;
        albums.forEach(album => {
          const { Cover, Nome, Artista, Data, Voto, Genere, Possesso } = album;
          if (!Cover || !Nome || !Artista || !Data || !Voto || !Genere || !Possesso) {
            skipped++;
            return;
          }
          db.get('SELECT 1 FROM Album WHERE Nome = ? AND Artista = ? AND Data = ?', [Nome, Artista, Data], (err, existing) => {
            if (err) {
              console.error('Errore query album:', err);
              return;
            }
            if (!existing) {
              insertStmt.run([Cover, Nome, Artista, Data, Voto, Genere, Possesso], (err) => {
                if (err) console.error('Errore inserimento album CSV:', err);
              });
              inserted++;
            } else {
              skipped++;
            }
          });
        });
        insertStmt.finalize(() => {
          fs.unlink(csvFilePath, () => {});
          console.log('Import CSV completata. Inseriti:', inserted, 'Saltati:', skipped);
          res.redirect('/view');
        });
      });
    });
});



// This inserts a new album into the database
function insertAlbum() { /* legacy removed */ }





module.exports = router;