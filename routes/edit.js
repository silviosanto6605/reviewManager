var express = require('express');
var sqlite3 = require('sqlite3').verbose();

var router = express.Router();

router.get('/', function(req, res) {
  var db = new sqlite3.Database('data.db');
  var albumId = req.query.id;

  if (!albumId) {
    return res.status(400).send('Bad Request: Missing ID');
  }

  db.get(`SELECT * FROM Album WHERE ID = ?`, [albumId], function(err, row) {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      return res.status(404).send('Album not found');
    }


    res.render('edit', { title: 'Edit album entry', album: row });
  });

  db.close();
})


router.post('/', function(req, res) {
  var db = new sqlite3.Database('data.db');
  var albumId = req.query.id;

  if (!albumId) {
    return res.status(400).send('Bad Request: Missing ID');
  }

  var cover = req.body.cover;
  var name = req.body.name;
  var artist = req.body.artist;
  var date = req.body.date;
  var rating = req.body.rating;
  var possession = req.body.possession;
  var genre = req.body.genre;

  if (!cover || !name || !artist || !date || !rating || !possession || !genre) {
    return res.status(400).send('Bad Request: Missing required fields');
  }

  db.run(`UPDATE Album SET Cover = ?, Nome = ?, Artista = ?, Data = ?, Voto = ?, Possesso = ?, Genere = ? WHERE ID = ?`,
    [cover, name, artist, date, rating, possession, genre, albumId],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      res.redirect('/edit?id=' + albumId);
    });

  db.close();
});

router.post('/add', function(req, res) {
  console.log(req.body);
  var db = new sqlite3.Database('data.db');

  var cover = req.body.cover;
  var name = req.body.name;
  var artist = req.body.artist;
  var date = req.body.date;
  var rating = req.body.rating;
  var possession = req.body.possession;
  var genre = req.body.genre;

  if (!cover || !name || !artist || !date || !rating || !possession || !genre) {
    return res.status(400).send('Bad Request: Missing required fields');
  }

  // Fetch the highest current ID
  db.get('SELECT MAX(ID) as maxId FROM Album', function(err, row) {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    var newId = (row.maxId || 0) + 1; // Increment from the max ID or start at 1 if no records exist

    // Insert the new album with the generated ID
    db.run(`INSERT INTO Album (ID, Cover, Nome, Artista, Data, Voto, Genere, Possesso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, cover, name, artist, date, rating, genre, possession],
      function(err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        // Redirect after adding the new album
        res.redirect('/view');
      });

    db.close();
  });
});






module.exports = router;