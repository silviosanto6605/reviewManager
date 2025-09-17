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
  console.log('[CSV] Inizio processamento upload CSV');
  var db = new sqlite3.Database(MAIN_DB);

  // Verifica che il file sia presente
  if (!req.file) {
    console.error('[CSV] Errore: Nessun file CSV caricato');
    return res.status(400).send('Bad Request: Nessun file CSV caricato');
  }

  console.log('[CSV] File ricevuto:', {
    originalname: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  });

  var csvFilePath = path.join(__dirname, '../', req.file.path);
  console.log('[CSV] Percorso file completo:', csvFilePath);

  // Verifica che il file esista fisicamente
  if (!fs.existsSync(csvFilePath)) {
    console.error('[CSV] Errore: File non trovato sul filesystem:', csvFilePath);
    db.close();
    return res.status(500).send('Errore: File CSV non trovato');
  }

  // Controlla dimensione e permessi del file
  try {
    const stats = fs.statSync(csvFilePath);
    console.log('[CSV] Stats file:', {
      size: stats.size,
      isFile: stats.isFile(),
      mode: stats.mode.toString(8)
    });
  } catch (statErr) {
    console.error('[CSV] Errore lettura stats file:', statErr);
    db.close();
    return res.status(500).send('Errore: Impossibile leggere il file CSV');
  }

  // Leggi e analizza il file CSV
  var albums = [];
  var csvStream = fs.createReadStream(csvFilePath, { encoding: 'utf8' });

  csvStream
    .pipe(csvParser({
      skipEmptyLines: true,
      headers: ['ID', 'Cover', 'Nome', 'Artista', 'Data', 'Voto', 'Genere', 'Possesso'] // Header fissi
    }))
    .on('headers', (headers) => {
      console.log('[CSV] Headers utilizzati:', headers);
    })
    .on('data', (row) => {
      console.log('[CSV] Riga letta:', row);
      albums.push(row);
    })
    .on('error', (parseError) => {
      console.error('[CSV] Errore parsing CSV:', parseError);
      db.close();
      fs.unlink(csvFilePath, () => {});
      return res.status(500).send('Errore parsing CSV: ' + parseError.message);
    })
    .on('end', () => {
      console.log('[CSV] Parsing completato. Righe trovate:', albums.length);
      
      if (albums.length === 0) {
        console.warn('[CSV] Nessuna riga trovata nel CSV');
        db.close();
        fs.unlink(csvFilePath, () => {});
        return res.status(400).send('File CSV vuoto o non valido');
      }

      // Processa album in modo sequenziale per evitare race conditions
      processAlbumsSequentially(db, albums, csvFilePath, res);
    });
});

// Funzione per processare gli album sequenzialmente
function processAlbumsSequentially(db, albums, csvFilePath, res) {
  let inserted = 0;
  let skipped = 0;
  let processed = 0;
  let errors = [];

  console.log('[CSV] Inizio processamento sequenziale di', albums.length, 'album');

  function processNext() {
    if (processed >= albums.length) {
      // Processamento completato
      console.log(`[CSV] Processamento completato. Inseriti: ${inserted}, Saltati: ${skipped}, Errori: ${errors.length}`);
      
      if (errors.length > 0) {
        console.error('[CSV] Errori durante processamento:', errors);
      }

      db.close();
      fs.unlink(csvFilePath, (unlinkErr) => {
        if (unlinkErr) console.error('[CSV] Errore rimozione file temporaneo:', unlinkErr);
      });

      return res.redirect('/view');
    }

    const album = albums[processed];
    processed++;

    console.log(`[CSV] Processando album ${processed}/${albums.length}:`, album);

    // Salta la riga di header se contiene i nomi delle colonne
    if (album.Nome === 'Nome' || album.Nome === 'nome' || 
        album.Artista === 'Artista' || album.Artista === 'artista' ||
        album.Cover === 'Cover' || album.Cover === 'cover') {
      console.log('[CSV] Riga di header rilevata e saltata:', album);
      skipped++;
      return setImmediate(processNext);
    }

    // Normalizza le chiavi e gestisci sia header che indici numerici
    let normalizedAlbum = {};
    
    // Se i dati sono sotto chiavi _0, _1, _2... (senza header)
    if (album._0 !== undefined) {
      console.log('[CSV] Dati rilevati senza header, usando mapping indici');
      normalizedAlbum = {
        ID: album._0,
        Cover: album._1,
        Nome: album._2,
        Artista: album._3,
        Data: album._4,
        Voto: album._5,
        Genere: album._6,
        Possesso: album._7
      };
    } else {
      // Se i dati sono sotto le chiavi corrette (con header)
      console.log('[CSV] Dati rilevati con header, usando chiavi dirette');
      Object.keys(album).forEach(key => {
        const normalizedKey = key.trim();
        normalizedAlbum[normalizedKey] = album[key] ? album[key].trim() : '';
      });
    }

    console.log('[CSV] Album normalizzato:', normalizedAlbum);

    const { Cover, Nome, Artista, Data, Voto, Genere, Possesso } = normalizedAlbum;

    // Validazione campi obbligatori
    if (!Cover || !Nome || !Artista || !Data || !Voto || !Genere || !Possesso) {
      console.warn(`[CSV] Album ${processed} saltato per campi mancanti:`, {
        Cover: !!Cover,
        Nome: !!Nome,
        Artista: !!Artista,
        Data: !!Data,
        Voto: !!Voto,
        Genere: !!Genere,
        Possesso: !!Possesso,
        raw: normalizedAlbum
      });
      skipped++;
      return setImmediate(processNext);
    }

    // Controlla duplicati
    db.get('SELECT COUNT(*) as count FROM Album WHERE Nome = ? AND Artista = ? AND Data = ?', 
      [Nome, Artista, Data], 
      (err, row) => {
        if (err) {
          console.error(`[CSV] Errore verifica duplicato per ${Nome}:`, err);
          errors.push(`Errore verifica: ${err.message}`);
          return setImmediate(processNext);
        }

        if (row && row.count > 0) {
          console.log(`[CSV] Album già esistente saltato: ${Nome} - ${Artista}`);
          skipped++;
          return setImmediate(processNext);
        }

        // Inserisci nuovo album
        const votoNumerico = parseFloat(Voto) || 0;
        
        db.run(`INSERT INTO Album (Cover, Nome, Artista, Data, Voto, Genere, Possesso) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [Cover, Nome, Artista, Data, votoNumerico, Genere, Possesso],
          function(insertErr) {
            if (insertErr) {
              console.error(`[CSV] Errore inserimento ${Nome}:`, insertErr);
              errors.push(`Errore inserimento ${Nome}: ${insertErr.message}`);
            } else {
              console.log(`[CSV] Album inserito con successo: ID ${this.lastID} - ${Nome} - ${Artista}`);
              inserted++;
            }
            setImmediate(processNext);
          });
      });
  }

  // Avvia processamento
  processNext();
}



// This inserts a new album into the database
function insertAlbum() { /* legacy removed */ }





module.exports = router;