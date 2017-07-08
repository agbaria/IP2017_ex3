var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
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
	let query = `INSERT INTO users (UserID, Password, FirstName, LastName, Address, City, Country, Phone, Cellular, Mail, CreditCardNumber)
				 VALUES (@username, @password, @firstname, @lastname, @address, @city, @country, @phone, @cellular, @mail, @credit);`;
	let params = addParams(info);
    
    utils.Select(query, params).then(function(ans) {
        let rowCount = ans.count;
        let rows = ans.rows;

		if(rowCount) {
			res.status(200).json({success: true, msg: 'User registered successfully'});
			completeRegistration(info.username, fav, ques, ans);
		}
		else {
			res.status(200).json({success: false, msg: 'User already exists'});
		}
	}).catch(next);
};

function addParams(info) {
	let p = [];
	p.push({name: 'username', type: TYPES.VarChar, value: info.username});
	p.push({name: 'password', type: TYPES.VarChar, value: info.password});
	p.push({name: 'firstname', type: TYPES.VarChar, value: info.firstname});
	p.push({name: 'lastname', type: TYPES.VarChar, value: info.lastname});
	p.push({name: 'address', type: TYPES.VarChar, value: info.address});
	p.push({name: 'city', type: TYPES.VarChar, value: info.city});
	p.push({name: 'country', type: TYPES.VarChar, value: info.country});
	p.push({name: 'phone', type: TYPES.VarChar, value: info.phone});
	p.push({name: 'cellular', type: TYPES.VarChar, value: info.cellular});
	p.push({name: 'mail', type: TYPES.VarChar, value: info.mail});
	p.push({name: 'credit', type: TYPES.VarChar, value: info.credit});
	return p;
}

function completeRegistration(username, fav, ques, ans) {
	let favQuery = [], quesQuery = [];
	for(let i = 0; i < fav.length; i++)
		favQuery.push(`(@username, '${fav[i]}')`);
	for(let i = 0; i < ques.length; i++)
		quesQuery.push(`(@username, '${ques[i]}', '${ans[i]}')`);

	let query = `INSERT INTO UserCategories (UserID, CategoryID) VALUES ${favQuery.join(',')};
				 INSERT INTO UserQuestions (UserID, QuesID, Answer) VALUES ${quesQuery.join(',')};`;
    let params = [{name: 'username', type: TYPES.VarChar, value: username}];
    
    utils.Select(query, params).catch(err => console.log(err));
};

module.exports = router;