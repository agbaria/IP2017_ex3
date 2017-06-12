var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var check = require('./utils/typeCheck');
var db = require('./utils/dbUtils');

//routes handlers
var index = require('./routes/index');
var getAllQues = require('./routes/getAllQues')
var trending = require('./routes/trending5');
var register = require('./routes/register');
var getUserSecQues = require('./routes/getUserSecQues');
var getPassword = require('./routes/getPassword');
var login = require('./routes/login');
var newGames = require('./routes/getNewGames');
var getGbyC = require('./routes/getGamesByCategory');
var getGbyN = require('./routes/getGamesByName');
var getGbyCN = require('./routes/getGamesByCompanyName');
var getGbyID = require('./routes/getGameByID');
var getRecommended = require('./routes/getRecommendedGames');
var getUserOrders = require('./routes/getUserOrders');
var getUserOrder = require('./routes/getUserOrder');
var makeOrder = require('./routes/makeOrder');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//no login needed
app.use('/', index);
app.use('/getAllQuestions', getAllQues)
app.use('/Trending5', trending);
app.use('/Register', register);
app.use('/GetUserSecurityQuestions', getUserSecQues);
app.use('/GetPassword', getPassword);
app.use('/Login', login);
app.use('/NewGames', newGames);
app.use('/GetGamesByCategory', getGbyC);
app.use('/SearchByName', getGbyN);
app.use('/SearchByCompanyName', getGbyCN);
app.use('/GetGame', getGbyID);

//login needed
app.use(function(req, res, next) {
    let username = req.body.username;
    if(check.checkUsername(username))
        res.status(400).json({success: false, msg: 'Illegal username'});
    if(!db.isLogedIn(username))
        res.status(400).json({success: false, msg: 'User is not logged in'});
    next();
});

app.use('/GetRecommendedGames', getRecommended);
app.use('/GetUserOrders', getUserOrders);
app.use('/GetUserOrder', getUserOrder);
app.use('/MakeOrder', makeOrder);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    if (!res.headersSent) {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.sendStatus(err.status || 500);
    }
    else {
        res.end();
    }     
});

module.exports = app;
