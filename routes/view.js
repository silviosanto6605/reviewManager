var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
const { MAIN_DB } = require('../config/initDb');

router.get('/', function (req, res) {
  const db = new sqlite3.Database(MAIN_DB);
  db.all(`SELECT * FROM Album ORDER BY 
            strftime('%Y-%m-%d', substr(Data, 7, 4) || '-' || substr(Data, 4, 2) || '-' || substr(Data, 1, 2)) DESC`,
    function (err, rows) {
      if (err) {
        console.error(err);
        db.close();
        return res.status(500).send('Internal Server Error');
      }
      if (!rows || rows.length === 0) {
        db.close();
        return res.render('view', {
          title: 'Album ascoltati🎵',
          data: null,
          message: 'Nessun album trovato nel database.'
        });
      }
      res.render('view', {
        title: 'Album ascoltati🎵',
        data: rows,
        message: null
      });
      db.close();
    });
});

router.post('/download-csv', function (req, res) {
  const db = new sqlite3.Database(MAIN_DB);
  db.all('SELECT * FROM Album ORDER BY ID ASC', function (err, rows) {
    if (err) {
      console.error(err);
      db.close();
      return res.status(500).send('Internal Server Error');
    }
    let csvContent = 'ID,Cover,Nome,Artista,Data,Voto,Genere,Possesso\n';
    rows.forEach(row => {
      const esc = v => `"${String(v).replace(/"/g,'""')}"`;
      csvContent += `${row.ID},${esc(row.Cover)},${esc(row.Nome)},${esc(row.Artista)},${esc(row.Data)},${row.Voto},${esc(row.Genere)},${esc(row.Possesso)}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('albums.csv');
    res.send(csvContent);
    db.close();
  });
});

module.exports = router;