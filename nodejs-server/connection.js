// npm librairies
var fs = require('fs');
var login = require('facebook-chat-api');

// perso librairies
var globals = require('./globals.js');
var friendslist = require('./friendslist.js');

exports.credsLog = function(credentials) {
    login({email: credentials.email, password: credentials.password}, function callback (err, api) {
        if(err) {
            globals.socket.emit('erreur', err.error);
            globals.socket.emit('status', 'disconnected');
        } else {
            globals.api = api;
            fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
            friendslist.sendFriendsList(30);
        }
    });
}

exports.autoLog = function(callback) {
    login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, function callback (err, api) {
        if(err) {
            globals.socket.emit('erreur', err);
            globals.socket.emit('status', 'disconnected');
        } else {
            globals.api = api;
            globals.socket.emit('status', 'connected');
        }
    });
}