var db = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
    let uid = req.body.username;
    let prods = req.body.products;
    let date = req.body.shippingDay;
    let curr = req.body.currency;

    var d = new Date();
    d.setDate(d.getDate() + 7);
    if(date - d.getTime() / 1000 < 0) {
        res.status(400).json({success: false, msg: 'Shipping date must be at least a week later'});
        return;
    }

    if(!Array.isArray(prods)) {
        res.status(400).json({success: false, msg: 'Wrong products type'});
        return;
    }

    let pRes = checkProducts(prods);
    if(pRes) {
        res.status(400).json({success: false, msg: pRes});
        return;
    }

    if(typeof curr !== 'string') {
        res.status(400).json({success: false, msg: 'Wrong currency type'});
        return;
    }

    if(curr !== 'shekel' && curr !== 'dollar') {
        res.status(400).json({success: false, msg: 'Wrong currency value'});
        return;
    }

    finishOrder(uid, prods, date, curr, res);
});

function checkProducts(prods) {
    for(let i = 0; i < prods.length; i++) {
        if(prods[i] !== null && typeof prods[i] === 'object') {
            if(!prods[i].hasOwnProperty('gameId') || !prods[i].hasOwnProperty('quantity'))
                return `Missing property in game: index=${i}`
            if(!db.isGame(prods[i].gameId))
                return `Game ${prods[i].gameId} doesn't exist`;
            if(!db.inStock(prods[i].gameId, prods[i].quantity))
                return `Game ${prods[i].gameId} quantity isn't in stock`
        }
        else return `Wrong game type: index=${i}`;
    }
    return '';
};

function finishOrder(uid, prods, shippingDate, curr, res) {
    let total = calcTotalAmount(prods);
    let orderDate = new Date().getTime() / 1000;
    let oid = db.addOrder(uid, orderDate, shippingDate, curr, total);
    updateProducts(prods, oid);

    res.status(200).json({success: true, msg: 'success', order: {id: oid, products: prods, shippingDay: shippingDate, currency: curr, totalAmount: total}});
};

function calcTotalAmount(prods) {
    let total = 0;
    for(let i = 0; i < prods.length; i++) {
        let p = db.getGamePrice(prods[i].gameId);
        total += p * prods[i].quantity;
    }
    return total;
};

function updateProducts(prods, oid) {
    for(let i = 0; i < prods.length; i++) {
        db.reduceStockAmount(prods[i].gameId, prods[i].quantity);
        db.addOrderProduct(oid, prods[i].gameId, prods[i].quantity);
    }
};

module.exports = router;