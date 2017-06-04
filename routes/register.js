var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	var info = req.body.info; //user info JSON
	var fav = req.body.favCategories; //favorite categories array
	var ques = req.body.questions; //security question array
	var ans = req.body.answers; //answers for security questions array

	if(checkInfo(info, res) && checkFavCategories(fav, res) && checkQuesAns(ques, ans, res)) {
		if(addUser(info, fav, ques, ans)) {
			res.status(200).json({success: true, msg: 'User registered successfully'});
		}
		else {
			res.status(500).json({success: false, msg: 'Internal Server Error'});
		}
	}
});

function checkInfo(info, res) {
	if(info === null || typeof info !== 'object') {
		res.status(400).json({success: false, msg: 'Incorrect user info type'});
		return false;
	}	
		
	let res = hasAllMandatoryInfo(info);
	if(res === true) {
		let userName = info.Username;
		let password = info.Password;
		if(!/^[a-zA-Z]+$/.test(userName)) {
			res.status(400).json({success: false, msg: 'Username can contain only letters'});
			return false;
		}
		else if (userName.length < 3) {
			res.status(400).json({success: false, msg: 'Username too short, must be at least 3 letters'});
			return false;
		}
		else if (userName.length > 8) {
			res.status(400).json({success: false, msg: 'Username too long, must be at most 8 letters'});
			return false;
		}
		else if (!/^[a-zA-Z0-9]+$/.test(password) || 
				 !/[a-zA-Z]/.test(password) ||
				 !/[0-9]/.test(password)) {
			res.status(400).json({success: false, msg: 'Password must contain only letters and number'});
			return false;
		}
		else if (password.length < 5) {
			res.status(400).json({success: false, msg: 'Password too short, must be at least 5 characters'});
			return false;
		}
		else if (password.length > 10) {
			res.status(400).json({success: false, msg: 'Password too long, must be at most 10 characters'});
			return false;
		}
		else return true;
	}
	else {
		res.status(400).json({success: false, msg: `Missing ${res}`});
		return false;
	}
}

function hasAllMandatoryInfo(info) {
	if(!info.hasOwnProperty('Username'))
		return 'username';
	if(!info.hasOwnProperty('Password'))
		return 'password';
	return true;
}

function checkFavCategories(fav, res) {
	if(!Array.isArray(fav)) {
		res.status(400).json({success: false, msg: 'Incorrect favorite categories type'});
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
	let categories = ['1', '9', '10', '11', '12', '13', '14', '15', '37', '38', '39', '4912'
					  '4915', '4916', '4918', '4919', '4920', '4971'];
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

function addUser(info, fav, ques, ans) {

}

module.exports = router;