const express = require("express");
const socket = require("socket.io");
global.fs = require("fs");
const url = require('url')
global.crypto = require('crypto');
global.child_process = require('child_process');

const path = require('path')
const port = 5959;
const logfile = "./logs/taskmaster_log"
const Daemon = require("./init_taskmaster_daemon")
global.PATH = require("os").homedir();
global.Commands = require("../commands");
global.CONFIGDIR = PATH + "/taskmaster/configurations/";
global.logfile =  CONFIGDIR + "/logs/taskmaster_log"

global.daemon = {
	isConfigurationValid: true,
	suffix: ".tm.json",
	taskLogs: CONFIGDIR + "/.logs",
	pidLogs: CONFIGDIR + "/.pids",
	programs: {},
	processes: [],
	fetchs: [],
};

global.Program = class {
	constructor(object, _hash = "", _name = ""){
		Object.assign(this, object);
		this.subprocess = [];
		this.hash = _hash;
		this.name = _name;
	}
	get getVariables (){
		return Object.keys(this).map(x=>x + "=> " + this[x]);
	}
}

global.log = (...msg) =>{
	let date = new Date().toString();
	date = date.substr(0, date.indexOf(" ("))
	fs.appendFileSync(logfile, "[" + date + "] " + msg.join(" ") + "\n", "utf-8");
}
// /Users/tlechien/taskmaster/srcs/daemon/taskmaster_daemon.js
// /Users/tlechien/taskmaster/logs/taskmaster_log
let server = express().use((req, res) => {
	const parsedUrl = url.parse(req.url);
	let pathname = `./srcs/webserver${parsedUrl.pathname}`;
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
}).listen(process.env.port || port || 8080).on("error", (obj)=>{
	if (obj.errno == "EADDRINUSE")
	{
		console.log("Port " + port + " déjà utilisé.")
		process.exit(1);
	}
});

let io = socket(server).on("connection", socket => {
	console.log("Nouvelle connexion entrante")
	socket.emit("datas", ["atom", "xd", "lol"]); // envoyer les données necessaire a laffichage du tableau process
	socket.on("data", (x)=>{
		log("Server: Utilisateur envoi data '" + x + "'")
		socket.emit("renvoi", "c bien recu mon pote");
	})
	socket.on("cmd", (cmd, argv, index)=>{
		log("Server: Command server-side :'" + cmd + "'")
		socket.emit("renvoi", "commande reçue");
		try {
			global.commands[index].call(argv, "daemon");
		} catch (e) {
			socket.emit("renvoi", "echec cmd " + e.toString());
		}
	})
});
log("Daemon: Daemon demarré avec le pid: " + process.pid);

Daemon.init();
/*
Previsualisation de la partie webclient
Process name        PID    Status   Temps de lancement count Log                                        Commandes
atom                95645  running  00h00m12s          1     [[button_err, reset], [button_out, reset]] [✔️, ❌]
atom                95645  running  00h00m12s          1     [[button_err, reset], [button_out, reset]] [✔️, ❌]
atom                95645  running  00h00m12s          1     [[button_err, reset], [button_out, reset]] [✔️, ❌]
atom                95645  running  00h00m12s          1     [[button_err, reset], [button_out, reset]] [✔️, ❌]
atom                95645  running  00h00m12s          1     [[button_err, reset], [button_out, reset]] [✔️, ❌]
atom                95645  running  00h00m12s          1     [[button_err, reset], [button_out, reset]] [✔️, ❌]
atom                95645  running  00h00m12s          1     [[button_err, reset], [button_out, reset]] [✔️, ❌]


*/
