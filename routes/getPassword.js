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
    let ques = req.body.questions;
    let ans = req.body.answers;

    if(check.checkUsername(username) === consts.ok) {
        getPassword(username, ques, ans, res, next);
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal username'});
    }
});

function getPassword(uid, ques, ans, res, next) {
    if(!checkQuesAns(ques, ans)) {
        res.status(200).json({success: false, msg: 'Something wrong with questions/answers param'});
        return;
    }

    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request (
                `SELECT QuesID, Answer FROM UserQuestions WHERE UserID=@uid;`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            let q = [];
                            let a = [];
                            for(let i = 0; i < rowCount; i++) {
                                let row = rows[i];
                                q.push(row[0].value);
                                a.push(row[1].value);
                            }

                            let chRes = checkUserAnswers({q, a}, ques, ans);
                            if(!chRes) {
                                getActuallPassword(uid, res, next);
                            }
                            else {
                                res.status(200).json({success: false, msg: chRes});
                            }
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

            request.addParameter('uid', TYPES.VarChar, uid);
            connection.execSql(request);
        }
    });
};

function checkQuesAns(ques, ans) {
    if(!Array.isArray(ques) || !Array.isArray(ans))
        return false;
    if(ques.length !== ans.length)
        return false;
    return true;
}

function checkUserAnswers(userSec, ques, ans) {
    let qNum = userSec.q.length;
    while(qNum != 0) {
        let qID = userSec.q[qNum - 1];

        let i = 0;
        for(; i < ques.length; i++)
            if(ques[i] == qID)
                break;
        
        if(i < ques.length){
            if(ans[i] === userSec.a[qNum - 1])
                qNum--;
            else
                return `Wrong answer for question ${i + 1}`
        }
        else return `Missing answer for question: id=${qID}`;
    }
    return '';
};

function getActuallPassword(uid, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request (
                `SELECT Password FROM Users WHERE UserID=@uid;`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            let pass = rows[0][0].value;
                            res.status(200).json({success: true, msg: 'success', password: pass});
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

            request.addParameter('uid', TYPES.VarChar, uid);
            connection.execSql(request);
        }
    });
};

module.exports = router;