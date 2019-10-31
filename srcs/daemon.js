const express = require("express");
const socket = require("socket.io");
const {appendFileSync, exists, readFile, statSync} = require("fs");
const url = require('url')
const path = require('path')
const port = 5959;
const logfile = "./srcs/taskmaster_log"

global.log = (...msg) =>{
	appendFileSync(logfile, "[" + (new Date()) + "] " + msg.join(" ") + "\n", "utf-8");
}
let server = express().use((req, res) => {
	const parsedUrl = url.parse(req.url);
	let pathname = `./srcs/${parsedUrl.pathname}`;
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
	exists(pathname, function (exist) {
		if(!exist) {
			res.statusCode = 404;
			res.end(`File ${pathname} not found!`);
			return;
		}
		if (statSync(pathname).isDirectory()) {
			pathname += 'index.html';
		}
		readFile(pathname, function(err, data){
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
}).listen(process.env.port || port || 8080).on("error", (obj)=>{
	if (obj.errno == "EADDRINUSE")
	{
		console.log("Port " + port + " déjà utilisé.")
		process.exit(1);
	}
});
let io = socket(server).on("connection", socket => {
	socket.emit("connection_ok");
	socket.on("data", (x)=>{
		log("Server: Utilisateur envoi data '" + x + "'")
	})
});

log("Daemon: Daemon demarré")
