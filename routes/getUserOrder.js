
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
    let uid = req.body.username;
    let oid = req.body.orderId;

    let order = db.getUserOrder(uid, oid);
    if(order) {
        res.status(200).json({success: true, msg: 'success', order: order});
    }
    else {
        res.status(400).json({success: false, msg: 'Incorrect Order Id'});
    }
});

module.exports = router;