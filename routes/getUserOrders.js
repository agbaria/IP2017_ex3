
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
    let uid = req.body.username;

    let orders = db.getUserOrders(uid);
    res.status(200).json({success: true, msg: 'success', orders: orders});
});

module.exports = router;