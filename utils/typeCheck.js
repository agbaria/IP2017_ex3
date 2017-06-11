var consts = require('./consts');
var check = new Object();

check.checkUsername = function(username) {
    if (typeof username !== 'string')
        return consts.wrongType;
    else if (username.length < 3)
        return consts.shortString;
    else if (username.length > 8)
        return consts.longString;
    else if(!/^[a-zA-Z]+$/.test(username))
        return consts.illegalValue;
    else
        return consts.ok;
};

check.checkPassword = function(password) {
    if (typeof password !== 'string')
        return consts.wrongType;
    if (password.length < 5)
        return consts.shortString;
    else if (password.length > 10)
        return consts.longString;
    else if (!/^[a-zA-Z0-9]+$/.test(password) || 
             !/[a-zA-Z]/.test(password) ||
             !/[0-9]/.test(password))
        return consts.illegalValue;
    else
        return consts.ok;
};


module.exports = check;