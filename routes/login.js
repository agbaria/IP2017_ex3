var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
var check = require('../utils/typeCheck');
var consts = require('../utils/consts');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	let username = req.body.username;
    let password = req.body.password;

    if(checkParams(username, password)) {
        login(username, password, res, next);
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

function login(username, password, res, next) {
    let query = 'SELECT UserID FROM Users WHERE UserID=@username AND Password=@password;';
    let params = [{name: 'username', type: TYPES.VarChar, value: username}, 
                  {name: 'password', type: TYPES.VarChar, value: password}];
    
    utils.Select(query, params).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

        if(rowCount) {
            actuallyLogin(username, res, next);
        }
        else {
            res.status(200).json({success: false, msg: 'Username or password are incorrect'});
        }
    }).catch(next);
};

function actuallyLogin(username, res, next) {
    let query = `UPDATE Users SET LogedIn=1 WHERE UserID=@username;
                 SELECT FirstName, LastName FROM Users WHERE UserID=@username;`;
    let params = [{name: 'username', type: TYPES.VarChar, value: username}];
    
    utils.Select(query, params).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

        if(rowCount) {
            let salt = Math.floor(Math.random() * 10000);
            let token = hash(username + salt);
            res.app.get('tokens').username = token;

            let row = rows[0];
            res.status(200).json({success: true, msg: 'success', token: token, firstname: row[0].value, lastname: row[1].value});
        }
        else {
            next(new Error('Login failed'));
        }
    }).catch(next);
};

function hash(str) {
    let hash = 0, chr;
    for (let i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return "" + hash;
}

module.exports = router;