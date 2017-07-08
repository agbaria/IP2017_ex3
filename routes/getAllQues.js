var utils = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    let query = 'SELECT * FROM SecurityQuestions;';

    utils.Select(query, []).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;
        
        if(rowCount) {
            let ques = [];
            for(let i = 0; i < rowCount; i++) {
                let row = rows[i];
                ques.push({id: row[0].value, question: row[1].value});
            }
            res.status(200).json({success: true, msg: 'success', questions: ques});
        }
        else {
            res.status(200).json({success: false, msg: 'No security questions :/'}); //wtf!
        }
    }).catch(next);
});

module.exports = router;