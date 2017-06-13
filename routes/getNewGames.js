var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../utils/dbConfig');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    let epoch = d.getTime() / 1000;
    getNewGames(epoch, res, next);
});

function getNewGames(epoch, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request(
				`SELECT GameID, GameTitle, ReleaseDate, PosterURL, Price FROM Games
				WHERE ReleaseDate > ${epoch}
                ORDER BY ReleaseDate ASC;`,
                function(err, rowCount, rows) {
                    if(!err) {
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
                    }
                    else {
                        console.log(err)
                        next(err);
                    }
                }
            );

            connection.execSql(request);
        }
    });
};

module.exports = router;