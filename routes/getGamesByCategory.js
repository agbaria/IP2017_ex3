var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var config = require('../utils/dbConfig');
var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res, next) {
    let pid = parseInt(req.params.id);
    
    if(!isNaN(pid)) {
        getGamesByPlatformId(pid, res, next);
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal category ID'});
    }
});

function getGamesByPlatformId(pid, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request(
                `SELECT * from games WHERE PlatformId = @id;`,
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
                                    price: row[8].value
                                };
                                games.push(game);
                            }

                            res.status(200).json({success: true, msg: 'success', games: games});
                        }
                        else {
                            res.status(200).json({success: false, msg: 'Category doesn\'t exist'});
                        }
                    }
                    else {
                        next(err);
                    }
                }
            );

            request.addParameter('id', TYPES.Int, pid);
            connection.execSql(request);
        }
    });
};

module.exports = router;