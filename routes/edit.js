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

    // Aggiungi un log per verificare i dati passati
    console.log('Album data:', row);

    res.render('edit', { title: 'Edit album entry', album: row });
  });

  db.close();
})


router.post('/', function(req, res) {
  // modificare il record nel database sqlite fatto di (Cover, Nome,Artista,Data,Voto,Possesso,Genere)
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

module.exports = router;