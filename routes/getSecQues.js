var db = require('../utils/dbUtils');
var check = require('../utils/typeCheck');
var consts = require('../utils/consts');
var express = require('express');
var router = express.Router();


router.get('/:uid', function(req, res) {
    let username = req.params.uid;

    if(check.checkUsername(username) === consts.ok) {
        let uq = db.getUserQues(username); //uq = [{id, ques}, ...], or null if username doesn't exist
        if(uq) {
            res.status(200).json({success: true, msg: 'success', questions: uq});    
        }
        else {
            res.status(200).json({success: false, msg: 'Username doesn\'t exist'});
        }
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal username'});
    }
});

module.exports = router;