const express = require("express");
const socket = require("socket.io");
const fs = require("fs");
const url = require('url')
const path = require('path')
const port = 8080;

let server = express().use((req, res) => {
	const parsedUrl = url.parse(req.url);
	let pathname = `./${parsedUrl.pathname}`;
	const mimeType = {
		'.ico': 'image/x-icon',
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.css': 'text/css',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.wav': 'audio/wav',
		'.mp3': 'audio/mpeg',
		'.pdf': 'application/pdf',
	};
	fs.exists(pathname, function (exist) {
		if(!exist) {
			res.statusCode = 404;
			res.end(`File ${pathname} not found!`);
			return;
		}
		if (fs.statSync(pathname).isDirectory()) {
			pathname += 'index.html';
		}
		fs.readFile(pathname, function(err, data){
			if(err){
				res.statusCode = 500;
				res.end(`Error getting the file: ${err}.`);
			} else {
				const ext = path.parse(pathname).ext;
				res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
				res.end(data);
			}
		});
	});
}).listen(8080);

let io = socket(server).on("connection", socket => {
	main.socket.push(socket);
	socket.emit("connection_ok");
	socket.on("data", (x)=>{console.log("Utilisateur envoi data " + x)})
});
