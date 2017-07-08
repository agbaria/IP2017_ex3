var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
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
    let query = 'SELECT * from games WHERE Publisher LIKE @name;';
    let params = [{name: 'name', type: TYPES.VarChar, value: `%${name}%`}];
    
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
    }).catch(next);
};

module.exports = router;