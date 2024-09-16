var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();

router.get('/', function (req, res) {
  var results = [];
  var db = new sqlite3.Database('data.db');

  // Check if the Album table exists, and create it if not
  db.run(`CREATE TABLE IF NOT EXISTS Album (
      ID INTEGER PRIMARY KEY,
      Cover TEXT,
      Nome TEXT,
      Artista TEXT,
      Data TEXT,
      Voto REAL,
      Genere TEXT,
      Possesso TEXT
  )`, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error creating table');
    }

    // Query the database for all albums and order by the date in descending order
    db.all(`SELECT * FROM Album ORDER BY 
            strftime('%Y-%m-%d', substr(Data, 7, 4) || '-' || substr(Data, 4, 2) || '-' || substr(Data, 1, 2)) DESC`,
      function (err, rows) {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        // If no rows are returned, send an error message to the view
        if (rows.length === 0) {
          return res.render('view', {
            title: 'Album ascoltati🎵',
            data: null,
            message: 'Nessun album trovato nel database.'
          });
        }

        rows.forEach(function (row) {
          results.push(row);
        });

        // Render the view with the results
        res.render('view', {
          title: 'Album ascoltati🎵',
          data: results,
          message: null
        });
      });
  });

  db.close();
});

router.post('/download-csv', function (req, res) {
  var db = new sqlite3.Database('data.db');

  db.all('SELECT * FROM Album ORDER BY ID ASC', function (err, rows) {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    let csvContent = 'ID,Cover,Nome,Artista,Data,Voto,Genere,Possesso\n';
    rows.forEach(row => {
      csvContent += `${row.ID},"${row.Cover}","${row.Nome}","${row.Artista}","${row.Data}",${row.Voto},"${row.Genere}","${row.Possesso}"\n`;
    });

    // Set headers to indicate file download
    res.header('Content-Type', 'text/csv');
    res.attachment('albums.csv');
    res.send(csvContent);
  });

  db.close();
});

module.exports = router;