var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
    var sqlite3 = require('sqlite3').verbose();
    const { MAIN_DB } = require('../config/initDb');
    var db = new sqlite3.Database(MAIN_DB);

    db.run('DELETE FROM Album WHERE ID = ?', req.body.id, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/view');
    });

    db.close();
});

module.exports = router;