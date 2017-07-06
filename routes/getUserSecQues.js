var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var config = require('../utils/dbConfig');
var check = require('../utils/typeCheck');
var consts = require('../utils/consts');
var express = require('express');
var router = express.Router();


router.post('/', function(req, res, next) {
    let username = req.body.username;

    if(check.checkUsername(username) === consts.ok) {
        getUserQues(username, res, next);
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal username'});
    }
});

function getUserQues(username, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request (
                `SELECT QuesID FROM UserQuestions WHERE UserID=@username;`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            let ques = [];
                            for(let i = 0; i < rowCount; i++) {
                                let row = rows[i];
                                ques.push(row[0].value);
                            }
                            getQuestions(ques, res, next);
                        }
                        else {
                            res.status(200).json({success: false, msg: 'Username doesn\'t exist'});
                        }
                    }
                    else {
						console.log(err)
                        next(err);
                    }
                }
            );

            request.addParameter('username', TYPES.VarChar, username);
            connection.execSql(request);
        }
    });
};

function getQuestions(ques, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {

            request = new Request (
                `SELECT QuesID, question FROM SecurityQuestions WHERE QuesID IN (${ques.join()});`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            let userQues = [];
                            for(let i = 0; i < rowCount; i++) {
                                let row = rows[i];
                                userQues.push({id: row[0].value, question: row[1].value});
                            }

                            res.status(200).json({success: true, msg: 'success', questions: userQues});
                        }
                        else {
                            res.status(200).json({success: false, msg: 'User questions are **ed up'});
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