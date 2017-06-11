var db = require('../utils/dbUtils');
var check = require('../utils/typeCheck');
var consts = require('../utils/consts');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    let username = req.body.username;
    let ques = req.body.questions;
    let ans = req.body.answers;

    if(check.checkUsername(username) !== consts.ok) {
        let chRes = checkAnswers(username, ques, ans);
        if(!chRes) {
            let pass = db.getUserPassword(username);
            res.status(200).json({success: true, msg: 'success', password: pass});
        }
        else {
            res.status(200).json({success: false, msg: chRes});
        }
    }
    else {
        res.status(400).json({success: false, msg: 'Illegal username'});
    }
});

function checkAnswers(uid, ques, ans) {
    if(!checkQuesAns(ques, ans))
        return 'Something wrong with questions/answers param';

    let userSec = db.getUserSecAnswers(uid); //userSec = {ques = [], ans = []}, or null if user doesn't exist.
    if(!userSec)
        return 'Username doesn\'t exist';
    
    let qNum = userSec.ques.length;
    while(qNum != 0) {
        let qID = userSec.ques[qNum - 1];

        let i = 0;
        for(; i < ques.length; i++)
            if(ques[i] == qID)
                break;
        
        if(i < ques.length){
            if(ans[i] === userSec.ans[qNum - 1])
                qNum--;
            else
                return `Wrong answer for question ${i + 1}`
        }
        else return `Missing answer for question: id=${qID}`;
    }
    return '';
}

function checkQuesAns(ques, ans) {
    if(!Array.isArray(ques) || !Array.isArray(ans))
        return false;
    if(ques.length !== ans.length)
        return false;
    return true;
}

module.exports = router;