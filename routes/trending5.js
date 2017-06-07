var db = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  let trenRes = db.getTrending5();
  if(trenRes) {
    res.status(200).json({success: true, msg: 'success', products: [/* fill products */]});
  }
  else {
    res.status(500).json({success: false, msg: 'Internal Server Error', products: []});
  }
});

module.exports = router;
