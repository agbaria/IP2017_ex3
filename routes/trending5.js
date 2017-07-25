var utils = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var d = new Date();
	d.setDate(d.getDate() - 7);
	getTrending5(d.getTime() / 1000, res, next);
});

function getTrending5(ts, res, next) {
    let query = `Select gameid, GameTitle, PosterURL, Price from games where gameid in (
			SELECT TOP 5 GameID
			FROM Orders LEFT JOIN GamesInOrders
			ON Orders.OrderID = GamesInOrders.OrderID
			WHERE ShipmentDate > ${ts}
			GROUP BY GameID
			ORDER BY COUNT(GameID) ASC;)`;
    
    utils.Select(query, []).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

        if(rowCount) {
            let games = [];
            for(let i = 0; i < rowCount; i++) {
                let row = rows[i];
                var game = {
                    id: row[0].value,
                    title: row[1].value,
                    posterURL: row[2].value,
                    price: row[3].value
                };
                games.push(game);
            }

            res.status(200).json({success: true, msg: 'Success', games: games});
        }
        else {
            res.status(200).json({success: false, msg: 'No games', games: []});
        }
    }).catch(next);
};

module.exports = router;
