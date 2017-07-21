var TYPES = require('tedious').TYPES;
var utils = require('../utils/dbUtils');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    let uid = req.body.username;
    let prods = req.body.products;
    let date = req.body.shippingDay;
    let curr = req.body.currency;

    let intDate = parseInt(date);
    if(intDate) {
        var d = new Date();
        d.setDate(d.getDate() + 7);
        if(intDate - d.getTime() / 1000 <= 0) {
            res.status(400).json({success: false, msg: 'Shipping date must be at least a week later'});
            return;
        }
    } else {
        res.status(400).json({success: false, msg: 'Shipping date must be integer in epoch format'});
        return;
    }

    if(!Array.isArray(prods)) {
        res.status(400).json({success: false, msg: 'Wrong products type'});
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

    if (!checkProducts(prods, res))
        return;

    reserveProducts(uid, prods, intDate, curr, res, next);
});

function checkProducts(prods, res) {
    let idP = '';
    for(let i = 0; i < prods.length; i++) {
        if(prods[i] !== null && typeof prods[i] === 'object') {
            if(!prods[i].hasOwnProperty('gameId') || !prods[i].hasOwnProperty('quantity')) {
                res.status(400).json({success: false, msg: `Missing property in game: index=${i}`});
                return false;
            } else if (!parseInt(prods[i]['quantity']) || !parseInt(prods[i]['gameId'])) {
                res.status(400).json({success: false, msg: `Wrong property type: index=${i}`});
                return false;
            } else if (parseInt(prods[i]['quantity']) <= 0) {
                res.status(400).json({success: false, msg: `Quantity must be more than 0: index=${i}`});
                return false;
            }
        } else {
            res.status(400).json({success: false, msg: `Wrong game type: index=${i}`});
            return false;
        }
    }
    return true;
};

function reserveProducts(uid, prods, date, curr, res, next) {
    let promises = [];
    let outOfStock = [];
    let inStock = [];
    
    for (let i = 0; i < prods.length; i++) {
        let query = 'UPDATE GAMES SET StokAmount = StokAmount - @quan WHERE gameid = @gid AND StokAmount >= @quan;';
        let params = [{name: 'quan', type: TYPES.Int, value: prods[i].quantity},
                      {name: 'gid', type: TYPES.Int, value: prods[i].gameId}];
        
        promises.push(
            utils.Select(query, params).then((ans) => {
                if (ans.count)
                    inStock.push({gameId: prods[i].gameId, quantity: prods[i].quantity});
                else
                    outOfStock.push(prods[i].gameId);
            })
        );
    }

    Promise.all(promises).then(() => {
        if (outOfStock.length > 0) {
            res.status(200).json({success: false, msg: 'Games out of stock', games: outOfStock});
            freeProducts(inStock);
        } else {
            completeReservation(uid, prods, date, curr, res, next);
        }
    }).catch((err) => {
        freeProducts(inStock);
        next(err);
    });
}

function freeProducts(inStock) {
    let query = '';
    let params = [];
    for (let i = 0; i < inStock.length; i++) {
        query += `UPDATE GAMES SET StokAmount = StokAmount + @quan${i} WHERE gameid = @gid${i};`;
        params.push({name: `gid${i}`, type: TYPES.Int, value: inStock[i].gameId}); 
        params.push({name: `quan${i}`, type: TYPES.Int, value: inStock[i].quantity});
    }
    utils.Select(query, params).catch(next);
}

function completeReservation(uid, prods, date, curr, res, next) {
    getTotalPrice(prods).then((price) => {
        if(curr === 'dollar')
            price = Math.floor(price /= 4);
        let currDate = Math.floor(new Date().getTime() / 1000);
        let query = `insert into orders values (@uid, '${currDate}', @date, @curr, '${price}', '0');
                    SELECT SCOPE_IDENTITY() as id;`;
        let params = [{name: 'uid', type: TYPES.VarChar, value: uid},
                    {name: 'date', type: TYPES.Int, value: date},
                    {name: 'curr', type: TYPES.VarChar, value: curr}];

        return utils.Select(query, params).then((ans) => {
            let orderId = ans.rows[0][0].value;
            return [orderId, price];
        });
    }).then(([orderID, price]) => {
        let q = [];
        let params = [];
        for (let i = 0; i < prods.length; i++) {
            q.push(`(${orderID}, @gid${i}, @quan${i})`);
            params.push({name: `gid${i}`, type: TYPES.Int, value: prods[i].gameId});
            params.push({name: `quan${i}`, type: TYPES.Int, value: prods[i].quantity});
        }

        let query = `insert into GamesInOrders values ${q.join(',')};`;
        return utils.Select(query, params).then((ans) => {
            res.status(200).json({
                success: true, 
                msg: 'success', 
                orderId: orderID, 
                price: price, 
                products: prods, 
                date: date, 
                currency: curr
            });
        });
    }).catch((err) => {
        freeProducts(prods);
        next(err);
    });
}

function getTotalPrice(prods) {
    let promises = [];
    let sum = 0;
    for (let i = 0; i < prods.length; i++) {
        let query = `Select Price from games where gameid = @id;`;
        let param = [{name: `id`, type: TYPES.Int, value: prods[i].gameId}];

        promises.push(
            utils.Select(query, param).then((ans) => {
                let price = ans.rows[0][0].value;
                sum += price * prods[i].quantity;
            })
        );
    }

    return Promise.all(promises).then(() => {
        return sum;
    });
}

module.exports = router;