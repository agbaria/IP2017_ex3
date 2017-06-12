var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
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
                `SELECT * from games WHERE gameid = ${gid};
                SELECT * FROM Genres WHERE gameid = ${gid};`,
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
                                PlatformId: row[2].value,
                                ReleaseDate: row[3].value,
                                Overview: row[4].value,
                                PosterURL: row[5].value,
                                ESRB: row[6].value,
                                Publisher: row[7].value,
                                Price: row[8].value,
                                StokAmount: row[9].value,
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

            connection.execSql(request);
        }
    });
};

module.exports = router;