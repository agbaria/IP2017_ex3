var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config = {
  userName: 'agbaria', // update me
  password: 'khalefA2', // update me
  server: 'ip2017ex3.database.windows.net', // update me
  options: {
      database: 'IP2017EX3DB',
      rowCollectionOnRequestCompletion: true,
      encrypt: true
  }
}

var db = new Object();

db.getTrending5 = function(ts) {
    let prods = [];

    connect(function() {
        request = new Request(
            `SELECT TOP 5 GameID
            FROM Orders LEFT JOIN GamesInOrders
            ON Orders.OrderID = GamesInOrders.OrderID
            WHERE ShipmentDate > ${ts}
            GROUP BY GameID
            ORDER BY COUNT(GameID) ASC;`,
            function(err, rowCount, rows) {

                console.log(rowCount + ' row(s) returned');
            }
        );

        connection.execSql(request);
    });
    return null;
}

db.addUser = function(info, fav, ques, ans) {
    return null;
}

db.login = function(username, password) {
    return null;
}

db.getUserSecAnswers = function(uid) {
    //return userSec = {ques = [], ans = []}, or null if user doesn't exist.
    return null;
}

db.getUserQues = function(username) {
    return null;
}; //uq = [{id, ques}, ...], or null if username doesn't exist

db.getGamesAfterDate = function(epoch) {
    return null;
}; //games = [{id, title, releaseDate, posterUrl, price}, ...]

db.isPlatform = function(cid) {
    return false;
};

db.getGamesByPlatformId = function(cid) {
    return null;
}; //games = [{id, title, posterUrl, price}, ...]

db.getGamesByName = function(name) {
    return null;
    /*
    SELECT * FROM Customers
    WHERE City LIKE '%name%';
     */

}; //games = [{id, title, posterUrl, price}, ...]

db.isGame = function(gid) {
    return false;
};


db.isLogedIn = function(username) {
    return false;
};

db.getUserOrders = function(uid) {
    return [];
};

db.getUserOrder = function(uid, oid) {
    return null;
};

db.inStock = function(gid, quantity) {
    return false;
};

db.addOrder = function(uid, orderDate, shippingDate, curr, total) {
    let oid = 0;
    return oid;
};

db.getGamePrice = function(gid) {
    return 0;
};

db.reduceStockAmount = function(gid, rQuantity) {

};

db.addOrderProduct = function(oid, gid, quantity) {

};

module.exports = db;