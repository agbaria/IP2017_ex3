var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    let epoch = d.getTime() / 1000;
    getNewGames(epoch, res, next);
});

function getNewGames(epoch, res, next) {
    let query = `SELECT GameID, GameTitle, ReleaseDate, PosterURL, Price FROM Games
				WHERE ReleaseDate > @epoch
                ORDER BY ReleaseDate ASC;`;
    let params = [{name: 'epoch', type: TYPES.Int, value: epoch}];
    
    utils.Select(query, params).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

        if(rowCount) {
            let games = [];
            for(let i = 0; i < rowCount; i++) {
                let row = rows[i];
                var game = {
                    id: row[0].value,
                    title: row[1].value,
                    releaseDate: row[2].value,
                    posterURL: row[3].value,
                    price: row[4].value
                };
                games.push(game);
            }

            res.status(200).json({success: true, msg: 'Success', games: games});
        }
        else {
            res.status(200).json({success: false, msg: 'No games from last month', games: []});
        }
    }).catch(next);
};

module.exports = router;