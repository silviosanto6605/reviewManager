var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();

router.get('/', function(req, res) {
  var results = [];
  var db = new sqlite3.Database('data.db');

  // Modifica della query SQL per ordinare per data di ascolto decrescente
  db.all(`SELECT * FROM Album ORDER BY 
          strftime('%Y-%m-%d', substr(Data, 7, 4) || '-' || substr(Data, 4, 2) || '-' || substr(Data, 1, 2)) DESC`, 
  function(err, rows) {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    rows.forEach(function(row) {
      results.push(row);
    });

    res.render('view', { title: 'Album ascoltati🎵', data: results });
  });

  db.close();
});

module.exports = router;