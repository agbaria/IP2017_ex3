var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
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
    let query = 'SELECT QuesID FROM UserQuestions WHERE UserID=@username;';
    let params = [{name: 'username', type: TYPES.VarChar, value: username}];
    
    utils.Select(query, params).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

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
    }).catch(next);
};

function getQuestions(ques, res, next) {
    let query = `SELECT QuesID, question FROM SecurityQuestions WHERE QuesID IN (${ques.join()});`;
    
    utils.Select(query, params).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

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
    }).catch(next);
};

module.exports = router;