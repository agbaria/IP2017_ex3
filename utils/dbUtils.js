var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../utils/dbConfig');

var db = new Object();

db.Select = function(query, params) {
    var connection = new Connection(config);
    return new Promise((resolve, reject) => {
        connection.on('connect', function(err) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if(err) {
                        console.log("erre: " + err);
                        reject(err);
                    } else {
                        let res = {count: rowCount, 'rows': rows};
                        resolve(res);
                    }
                });

                for(let i = 0; i < params.length; i++)
                    request.addParameter(params[i].name, params[i].type, params[i].value);
                connection.execSql(request);
            }
        });
    });
};

module.exports = db;