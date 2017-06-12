var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../utils/dbConfig');
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
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request (
                `SELECT UserID FROM Users WHERE UserID='${username}' AND Password='${password}';`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            actuallyLogin(username, res, next);
                        }
                        else {
                            res.status(200).json({success: false, msg: 'Username or password are incorrect'});
                        }
                    }
                    else {
						console.log(err)
                        next(err);
                    }
                }
            );

            connection.execSql(request);
        }
    });
};

function actuallyLogin(username, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request(
                `UPDATE Users SET LogedIn=1 WHERE UserID='${username}';
                SELECT FirstName, LastName FROM Users WHERE UserID='${username}';`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            let row = rows[0];
                            res.status(200).json({success: true, msg: 'success', firstname: row[0].value, lastname: row[1].value});
                        }
                        else {
                            next(new Error('Login failed'));
                        }
                    }
                    else {
						console.log(err)
                        next(err);
                    }
                }
            );

            connection.execSql(request);
        }
    });
};

module.exports = router;