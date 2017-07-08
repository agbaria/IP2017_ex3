var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
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
    let query = 'SELECT * from games WHERE PlatformId = @id;';
    let params = [{name: 'id', type: TYPES.Int, value: pid}];
    
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
                    price: row[8].value
                };
                games.push(game);
            }

            res.status(200).json({success: true, msg: 'success', games: games});
        }
        else {
            res.status(200).json({success: false, msg: 'Category doesn\'t exist'});
        }
    }).catch(next);
};

module.exports = router;