var db = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var d = new Date();
	d.setDate(d.getDate() - 7);
	let trenRes = db.getTrending5(d.getTime() / 1000);
	if(trenRes) {
		res.status(200).json({success: true, msg: 'success', products: [/* fill products */]});
	}
	else {
		res.status(500).json({success: false, msg: 'Internal Server Error', products: []});
	}
});

module.exports = router;
