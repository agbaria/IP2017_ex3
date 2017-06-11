var db = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res) {
    let gid = parseInt(req.params.id);
    
    if(!isNaN(gid)) {
        if(db.isGame(gid)) {
            let game = db.getGameById(gid); //game = {id, title, posterUrl, price}
            res.status(200).json({success: true, msg: 'success', game: game});
        }
        else {
            res.status(200).json({success: false, msg: 'Game doesn\'t exist'});
        }
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal game ID'});
    }
});

module.exports = router;