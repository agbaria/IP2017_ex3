var db = require('../utils/dbUtils');
var check = require('../utils/typeCheck');
var consts = require('../utils/consts');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	let username = req.body.Username;
    let password = req.body.Password;

    if(checkParams(username, password)) {
        let loginRes = db.login(username, password);
        switch(loginRes.res) {
            case consts.ok:
                res.cookie('username', loginRes.username);
                res.status(200).json({success: true, msg: 'success', firstname: loginRes.firstname, lastname: loginRes.lastname});
            case consts.unexistUsername:
                res.status(200).json({success: false, msg: 'Username doesn\'t exist'});
            case consts.unexistPassword:
                res.status(200).json({success: false, msg: 'Incorrect password'});
        }
    }
    else {
        res.status(400).json({success: false, msg: 'Username or password are illegal'});
    }
});

function checkParams(username, password) {
    if (check.checkUsername(username) !== consts.ok)
        return false;
    else if (check.checkPassword(password) !== consts.ok)
        return false;
    else return true;
}

module.exports = router;