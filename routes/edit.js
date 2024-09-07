var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var multer = require('multer');
var csvParser = require('csv-parser');
var fs = require('fs');
var path = require('path');

var router = express.Router();

// Set up multer for handling file uploads
var upload = multer({
  dest: 'uploads/'
});

// Route per visualizzare un album specifico per ID
router.get('/', function (req, res) {
  var db = new sqlite3.Database('data.db');
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

// Route per aggiornare un album esistente
router.post('/', function (req, res) {
  var db = new sqlite3.Database('data.db');
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

// Route per aggiungere un nuovo album
router.post('/add', function (req, res) {
  var db = new sqlite3.Database('data.db');
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

  // Fetch the highest current ID
  db.get('SELECT MAX(ID) as maxId FROM Album', function (err, row) {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    var newId = (row.maxId || 0) + 1;

    db.run(`INSERT INTO Album (ID, Cover, Nome, Artista, Data, Voto, Genere, Possesso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, cover, name, artist, date, rating, genre, possession],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
        console.log('Nuovo album aggiunto:', newId, name, artist, date);
        res.redirect('/view');
      });

    db.close();
  });
});

router.post('/add/csv', upload.single('csvFile'), function(req, res) {
  var db = new sqlite3.Database('data.db');

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

      // Trova il valore massimo non coperto per l'ID
      db.get('SELECT MAX(ID) as maxId FROM Album', function(err, row) {
        if (err) {
          console.error('Errore durante la ricerca dell\'ID massimo:', err);
          return res.status(500).send('Internal Server Error');
        }

        var nextId = (row.maxId || 999) + 1; // ID iniziale per i nuovi album

        // Inserisci ogni album nel database
        db.serialize(() => {
          albums.forEach(album => {
            var { ID, Cover, Nome, Artista, Data, Voto, Genere, Possesso } = album;

            // Controlla se ci sono campi mancanti e salta la riga se necessario
            if (!Cover || !Nome || !Artista || !Data || !Voto || !Possesso || !Genere) {
              console.error('Dati mancanti nella riga:', album);
              return;
            }

            // Verifica se un album con lo stesso Nome, Artista e Data esiste già
            db.get(`SELECT * FROM Album WHERE Nome = ? AND Artista = ? AND Data = ?`, [Nome, Artista, Data], function(err, existingAlbum) {
              if (err) {
                console.error('Errore durante la query dell\'album:', err);
                return;
              }

              if (!existingAlbum) {
                // Se l'album non esiste, assegna l'ID e inserisci

                if (!ID || ID >= nextId) {
                  // Usa l'ID fornito se esiste e non è coperto
                  var finalId = ID || nextId;
                  nextId = finalId++; // Incrementa il prossimo ID

                  // Inserisci l'album con l'ID assegnato
                  insertAlbum(db, nextId, Cover, Nome, Artista, Data, Voto, Genere, Possesso);
                } else {    
                  insertAlbum(db, ID, Cover, Nome, Artista, Data, Voto, Genere, Possesso);

                }
              }
              else{
                console.error('Album già esistente:'+Nome);
              }
            });
          });
        });

        // Pulisci: cancella il file CSV caricato
        fs.unlink(csvFilePath, (err) => {
          if (err) {
            console.error('Errore durante l\'eliminazione del file CSV:', err);
          }
        });

        // Reindirizza alla vista principale dopo aver elaborato gli album
        console.log('Importazione file csv completata!');
        res.redirect('/view');
      });
    });
});

// Funzione per inserire l'album nel database
function insertAlbum(db, id, cover, name, artist, date, rating, genre, possession) {
  db.run(`INSERT INTO Album (ID, Cover, Nome, Artista, Data, Voto, Genere, Possesso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, cover, name, artist, date, rating, genre, possession],
    function(err) {
      if (err) {
        console.error('Errore durante l\'inserimento dell\'album:', err);
      }
    });
    console.log('Inserimento dell\'album completato:', id, name, artist, date);
}





module.exports = router;