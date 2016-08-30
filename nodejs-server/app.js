// librairies npm
var http = require('http')
var express = require('express')
var ecstatic = require('ecstatic')
var fileExists = require('file-exists')

// librairies perso
var globals = require('./globals.js')
var connection = require('./connection.js')
var friendslist = require('./friendslist.js')

var app = express().use(ecstatic({root: __dirname + '/public'}))
var server = http.createServer(app).listen(8080)
var io = require('socket.io').listen(server)
console.log('Listening on :8080')

// initialisation
io.sockets.on('connection', function (socket) {
    globals.socket = socket

    if (!globals.api) {
        if (fileExists('appstate.json')) {
            console.log('Connecting with appstate.json...')
            connection.autoLog()
        } else {
            console.log('appstate.json does not exist. Waiting for manual loggin from the Chrome extension...')
        }
    }

    globals.socket.on('background_ready', function() {
        connection.autoLog()
    })

    globals.socket.on('ready', function() {
        if (globals.api) {
            globals.socket.emit('status', 'loading')
            friendslist.sendFriendsList(50)
        }
    })

    // partage d'un lien
    globals.socket.on('share_order', function (message) {
        if (message.body === '') {
            globals.api.sendMessage({url: message.link}, message.id)
        } else {
            globals.api.sendMessage({body: message.body, url: message.link}, message.id)
        }
        globals.socket.emit('share_ok', message)
    })

    // connexion avec identifiants
    globals.socket.on('login', function(credentials) {
        socket.emit('status', 'loading')
        connection.credsLog(credentials)
    })
})
