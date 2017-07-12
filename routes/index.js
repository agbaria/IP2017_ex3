var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let path = path.join(__dirname + 'app/index')
  res.sendFile(path);
});

module.exports = router;
