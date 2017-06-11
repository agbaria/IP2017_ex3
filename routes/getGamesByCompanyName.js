var db = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/:name', function(req, res) {
    let name = req.params.name;
    let games = db.getGamesByPublisher(name); //games = [{id, title, posterUrl, price}, ...]
    res.status(200).json({success: true, msg: 'success', games: games});
});

module.exports = router;