var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res, next) {
    let gid = parseInt(req.params.id);
    if(!isNaN(gid)) {
        getGameById(gid, res, next);
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal game ID'});
    }
});

function getGameById(gid, res, next) {
    let query = `SELECT * FROM games WHERE gameid = @id;
                SELECT * FROM Genres WHERE gameid = @id;`;
    let params = [{name: 'id', type: TYPES.Int, value: gid}];

    utils.Select(query, params).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

        if(rowCount) {
            let row = rows[0];
            let genres = [];
            for(let i = 1; i < rowCount; i++)
                genres.push(rows[i][1].value);

            var game = {
                id: gid,
                title: row[1].value,
                platformId: row[2].value,
                releaseDate: row[3].value,
                overview: row[4].value,
                posterURL: row[5].value,
                esrb: row[6].value,
                publisher: row[7].value,
                price: row[8].value,
                stokAmount: row[9].value,
                genres: genres
            };

            res.status(200).json({success: true, msg: 'success', game: game});
        }
        else {
            res.status(200).json({success: false, msg: 'Game doesn\'t exist'});
        }
    }).catch(next);
};

module.exports = router;