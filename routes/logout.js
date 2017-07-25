var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    let uid = req.body.username;
    let token = req.body.token;

    let query = `UPDATE Users SET LogedIn=0 WHERE UserID=@username;`;
    let params = [{name: 'username', type: TYPES.VarChar, value: uid}];
    
    utils.Select(query, params).then(function(ans) {
        if(ans.count) {
            delete res.app.get('tokens').username;
            res.status(200).json({success: true, msg: 'logout successfully'});
        } else res.status(500).json({success: false, msg: 'Internal server error'});
    }).catch(next);
});

module.exports = router;