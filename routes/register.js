var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../utils/dbConfig');
var check = require('../utils/typeCheck');
var consts = require('../utils/consts');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	let info = req.body.info; //user info JSON
	let fav = req.body.favCategories; //favorite categories array
	let ques = req.body.questions; //security question array
	let ans = req.body.answers; //answers for security questions array

	if(checkInfo(info, res) && checkFavCategories(fav, res) && checkQuesAns(ques, ans, res)) {
		register(info, fav, ques, ans, res, next);
	}
});

function checkInfo(info, res) {
	if(info === null || typeof info !== 'object') {
		res.status(400).json({success: false, msg: 'Incorrect user info type'});
		return false;
	}	
	
	let miss = isMissingMandatoryInfo(info);
	if(!miss) {
		let username = info.username;
		let password = info.password;

		switch(check.checkUsername(username)) {
			case consts.wrongType:
				res.status(400).json({success: false, msg: 'Username type error'});
				return false;
			case consts.shortString:
				res.status(400).json({success: false, msg: 'Username too short, must be at least 3 letters'});
				return false;
			case consts.longString:
				res.status(400).json({success: false, msg: 'Username too long, must be at most 8 letters'});
				return false;
			case consts.illegalValue:
				res.status(400).json({success: false, msg: 'Username can contain only letters'});
				return false;
		}

		switch(check.checkPassword(password)) {
			case consts.wrongType:
				res.status(400).json({success: false, msg: 'Password type error'});
				return false;
			case consts.shortString:
				res.status(400).json({success: false, msg: 'Password too short, must be at least 5 characters'});
				return false;
			case consts.longString:
				res.status(400).json({success: false, msg: 'Password too long, must be at most 10 characters'});
				return false;
			case consts.illegalValue:
				res.status(400).json({success: false, msg: 'Password must contain both letters and number'});
				return false;
		}
	}
	else {
		res.status(400).json({success: false, msg: `Missing ${miss}`});
		return false;
	}

	return true;
}

function isMissingMandatoryInfo(info) {
	if(!info.hasOwnProperty('username'))
		return 'username';
	if(!info.hasOwnProperty('password'))
		return 'password';
	return '';
}

function checkFavCategories(fav, res) {
	if(!Array.isArray(fav)) {
		res.status(400).json({success: false, msg: 'Incorrect favorite categories type'});
		return false;
	}

	if(fav.length == 0) {
		res.status(400).json({success: false, msg: 'Must choose at least one favorite category'});
		return false;
	}

	for(let i = 0; i < fav.length; i++) {
		if(!isLegalCategory(fav[i])) {
			res.status(400).json({success: false, msg: 'Ilegall category id'});
			return false;
		}
	}
	return true;
}

function isLegalCategory(x) {
	let categories = ['1', '9', '10', '11', '12', '13', '14', '15', '37', '38', '39', '4912', '4915', '4916', '4918', '4919', '4920', '4971'];
	let str_x = x + "";
	return categories.includes(str_x);
}

function checkQuesAns(ques, ans, res) {
	if(!Array.isArray(ques) || !Array.isArray(ans)) {
		res.status(400).json({success: false, msg: 'Incorrect questions or answers type'});
		return false;
	}

	if(ques.length == 0) {
		res.status(400).json({success: false, msg: 'Must answer at least 1 security question'});
		return false;
	}

	if(ques.length !== ans.length) {
		res.status(400).json({success: false, msg: 'Question and answers don\'t match count'});
		return false;
	}

	for(let i = 0; i < ques.length; i++) {
		if(ques[i] < 1 || ques[i] > 12) {
			res.status(400).json({success: false, msg: 'Ilegall question id'});
			return false;
		}
		if(ans[i].length < 1) {
			res.status(400).json({success: false, msg: 'Empty answer'});
			return false;
		}
	}
	return true;
}

function register(info, fav, ques, ans, res, next) {
	var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
            next(err);
        }
        else {
			let favQuery = '', quesQuery = '';
			for(let i = 0; i < fav.length; i++)
				favQuery += ` ('${info.username}', ${fav[i]})`;
			for(let i = 0; i < ques.length; i++)
				quesQuery += ` ('${info.username}', ${ques[i]}, '${ans[i]}')`

            request = new Request(
                `INSERT INTO users (UserID, Password, FirstName, LastName, Address, City, Country, Phone, Cellular, Mail, CreditCardNumber)
				VALUES ('${info.username}', '${info.password}', '${info.firstname}', '${info.lastname}', '${info.address}', '${info.city}', '${info.country}', '${info.phone}', '${info.cellular}', '${info.mail}', '${info.credit}');
				INSERT INTO UserCategories (UserID, CategoryID) VALUES ${favQuery};
				INSERT INTO UserQuestions (UserID, QuesID, Answer) VALUES ${quesQuery};`,
                function(err, rowCount, rows) {
                    if(!err) {
                        if(rowCount) {
                            res.status(200).json({success: true, msg: 'User registered successfully'});
                        }
                        else {
                            res.status(200).json({success: false, msg: 'User already exists'});
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