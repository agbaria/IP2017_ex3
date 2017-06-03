var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	var info = req.body.info;
	var fav = req.body.favCategories;
	var ques = req.body.questions;
	var ans = req.body.answers;

	if(checkInfo(info) && checkFavCategories(fav) && checkQuesAns(ques, ans)) {
		if(addUser(info, ))
	}
});


module.exports = router;