var db = require('../utils/dbUtils');
var check = require('../utils/typeCheck');
var consts = require('../utils/consts');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    let epoch = d.getTime() / 1000;
    let games = db.getGamesAfterDate(epoch); //games = [{id, title, releaseDate, posterUrl, price}, ...]
    res.status(200).json({success: true, msg: 'success', newGames: games});
});

module.exports = router;