var express = require('express'),http = require('http');
var app = express();
var server = http.createServer(app);
server.listen(8080);
var io = require("socket.io").listen(server);
io.set('log level',1);
io.sockets.on('connection',function(socket){
	socket.on('newFrame',function(obj){
		//console.log("newFrame rcvd");
		//io.sockets.emit('setFrame',obj);
		socket.broadcast.emit('setFrame',obj)
	});
});