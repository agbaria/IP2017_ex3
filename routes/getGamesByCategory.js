var db = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res) {
    let cid = parseInt(req.params.id);
    
    if(!isNaN(cid)) {
        if(db.isPlatform(cid)) {
            let games = db.getGamesByPlatformId(cid); //games = [{id, title, posterUrl, price}, ...]
            res.status(200).json({success: true, msg: 'success', games: games});
        }
        else {
            res.status(200).json({success: false, msg: 'Category doesn\'t exist'});
        }
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal category ID'});
    }
});

module.exports = router;