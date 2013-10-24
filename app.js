var express = require('express'),http = require('http');
var app = express();
var server = http.createServer(app);
server.listen(8080);
var io = require("socket.io").listen(server);
io.set('log level','1')
io.sockets.on('connection',function(socket){
	socket.on('newFrame',function(img){
		io.sockets.emit('setFrame',img);
	});
});
