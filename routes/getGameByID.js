var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var config = require('../utils/dbConfig');
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
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request(
                `SELECT * FROM games WHERE gameid = @id1;
                SELECT * FROM Genres WHERE gameid = @id2;`,
                function(err, rowCount, rows) {
                    if(!err) {
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
                    }
                    else {
                        next(err);
                    }
                }
            );

            request.addParameter('id1', TYPES.Int, gid);
            request.addParameter('id2', TYPES.Int, gid);
            connection.execSql(request);
        }
    });
};

module.exports = router;