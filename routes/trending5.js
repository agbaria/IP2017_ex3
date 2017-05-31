var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('trending 5');
});

module.exports = router;
