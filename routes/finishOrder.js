var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    let uid = req.body.username;
    let oid = req.body.orderId;

    if(uid && oid) {
        let query = "select OrderID from Orders where OrderID=@oid and UserID=@uid and status=0;";
        let params = [{name: 'uid', type: TYPES.VarChar, value: uid},
                    {name: 'oid', type: TYPES.Int, value: oid}];

        utils.Select(query, params).then((ans) => {
             if (ans.count) {
                 query = 'update orders set status=1 where orderid=@oid;';
                 let param = [{name: 'oid', type: TYPES.Int, value: oid}];

                 utils.Select(query, param).then((ans) => {
                     res.status(200).json({success: true, msg: 'Order finished successfully'});
                 })
             } else res.status(400).json({success: false, msg: 'No unfinished matching order found'});
        }).catch(next);
    } else res.status(400).json({success: false, msg: 'Wrong request format'});
});

module.exports = router;