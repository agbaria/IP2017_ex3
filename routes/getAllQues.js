var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../utils/dbConfig');
var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
            request = new Request (
                `SELECT * FROM SecurityQuestions;`,
                function(err, rowCount, rows) {
                    if(!err) {
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
});

module.exports = router;