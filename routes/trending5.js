var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../utils/dbConfig');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var d = new Date();
	d.setDate(d.getDate() - 7);
	getTrending5(d.getTime() / 1000, res, next);
});

function getTrending5(ts, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request(
				`SELECT TOP 5 GameID
				FROM Orders LEFT JOIN GamesInOrders
				ON Orders.OrderID = GamesInOrders.OrderID
				WHERE ShipmentDate > ${ts}
				GROUP BY GameID
				ORDER BY COUNT(GameID) ASC;`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            let games = [];
                            for(let i = 0; i < rowCount; i++) {
								let row = rows[i];
								var game = {
									id: row[0].value,
                                    title: row[1].value,
                                    PosterURL: row[5].value,
                                    Price: row[8].value
								};
								games.push(game);
							}

                            res.status(200).json({success: true, msg: 'Success', games: games});
                        }
                        else {
                            res.status(200).json({success: false, msg: 'No games', games: []});
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
