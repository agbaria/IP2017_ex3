var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../utils/dbConfig');
var express = require('express');
var router = express.Router();

router.get('/:name', function(req, res, next) {
    let name = req.params.name;
    if(name.length < 50) {
        getGamesByPublisher(name, res, next);
    }
    else {
        res.status(400).json({success: false, msg: 'Compant name is too long'});
    }
});

function getGamesByPublisher(name, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err);
            next(err);
        }
        else {
            request = new Request(
                `SELECT * from games WHERE Publisher LIKE '%${name}%';`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            let games = [];
                            for(let i = 0; i < rowCount; i++) {
                                let row = rows[i];
                                var game = {
                                    id: row[0].value,
                                    title: row[1].value,
                                    posterURL: row[5].value,
                                    publisher: row[7].value,
                                    price: row[8].value
                                };
                                games.push(game);
                            }
                            
                            res.status(200).json({success: true, msg: 'success', games: games});
                        }
                        else {
                            res.status(200).json({success: false, msg: 'No matching companies found'});
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