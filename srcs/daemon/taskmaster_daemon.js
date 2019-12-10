const express = require("express");
const socket = require("socket.io");
global.fs = require("fs");
const url = require('url')
global.crypto = require('crypto');
global.child_process = require('child_process');
global.Commands = require("../commands");

const path = require('path')
const port = 5959;
const logfile = "./logs/taskmaster_log"
const Daemon = require("./init_taskmaster_daemon")
global.PATH = require("os").homedir();
global.MAINDIR = PATH + "/taskmaster/";
global.LOGDIR = MAINDIR + "logs/";
global.CONFIGDIR = MAINDIR + "configurations/";
global.logfile =  MAINDIR + "logs/taskmaster_log"

global.daemon = {
	isConfigurationValid: true,
	suffix: ".tm.json",
	taskLogs: LOGDIR + ".logs",
	pidLogs: LOGDIR + ".pids",
	programs: {},
	processes: [],
	fetches: [],
	mementoMori: 0
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
};

global.log = (type = "INFO", message) => {
	let date = new Date().toString();
	date = date.substr(0, date.indexOf(" ("))
	let msg = "[" + date + "]\n-> ";
	msg += {WARNING: "\x1b[33m ⚠", ERROR: "\x1b[31m ✖", OK: "\x1b[32m ✔", INFO: "\x1b[36m ℹ", "": "\x1b[36m ℹ"}[type.toUpperCase()] || "\x1b[36m ℹ";
	msg += "  " + message + "\x1b[0m";
	console.log(msg + "\x1b[0m");
	fs.appendFileSync(logfile, msg + "\n", "utf-8");
}


// /Users/tlechien/taskmaster/srcs/daemon/taskmaster_daemon.js
// /Users/tlechien/taskmaster/logs/taskmaster_log
let server = express().use((req, res) => {
	const parsedUrl = url.parse(req.url);
	let pathname = decodeURI(`.${parsedUrl.pathname}`);
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
			pathname += './srcs/webserver/index.html';
		}
		fs.readFile(pathname, function(err, data){
			if(err){
				res.statusCode = 500;
				res.end(`Error getting the file: ${err}.`);
			} else {
				const ext = path.parse(pathname).ext;
				res.setHeader('Content-type', (mimeType[ext] || 'text/plain') + "; charset=utf-8" );
				res.end(data);
			}
		});
	});
}).listen(process.env.port || port || 8080).on("error", (obj)=>{
	if (obj.errno === "EADDRINUSE")
	{
		log("Error", "Port " + port + " déjà utilisé.")
		process.exit(1);
	}
});

let io = socket(server).on("connection", socket => {
	log("INFO", "New incoming connection.");
	socket.emit("connection_ok");
 // envoyer les données necessaire a laffichage du tableau process
	socket.on("data", (x)=>{
		//log("Server: Utilisateur envoi data '" + x + "'");
		//socket.emit("renvoi", "c bien recu mon pote");
	});
	socket.on("senddata", (name, string)=>{
		let programs = Object.keys(daemon.programs).map(y=>{
			let x = daemon.programs[y];
			return {command: x.command, err: x.err, out: x.out, custom_err: x.custom_err, custom_out: x.custom_out, count: x.count, name: x.name, successTime: x.successTime, expectedOutput: x.expectedOutput, subprocess: x.subprocess.map(sub=>{
				return {status: sub.status, exit: sub.exit, pid: sub.child.pid, exitCode: sub.child.exitCode, timestamp: sub.timestamp, timestop: sub.timestop, counter: sub.counter}
			})}
		});
			socket.emit("datas", programs);
	});

	socket.on("pls_log", ()=>{
		let logs = fs.readFileSync(LOGDIR + "taskmaster_log", "utf-8").split("[0m\n").map(x=>x.replace('[32m ✔ ', 'SUCCESS').replace('[31m ✖ ', 'ERROR').replace('[36m ℹ ', 'INFO').replace('\n', '<br>'))
		socket.emit("sendlog", logs);
	})
	socket.on("cmd", (cmd, argv, index)=>{
		log("Info", "Server: Command server-side :'" + cmd + "'");
		socket.emit("renvoi", "Command received.");
		try {
		global.commands[index].call(argv, "daemon", socket);
		} catch (e) {
			socket.emit("renvoi", "Failed to call the command: " + e.toString());
		}
	}).on("reloadConfiguration", (file)=>loadFile(file + daemon.suffix));
});

log("OK", "Daemon session started with pid: " + process.pid);

Daemon.init();

function exitHandler(options, err) {
	daemon.mementoMori = 1;
	killAllChilds();
	log("OK", "End of daemon session.");
	process.exit(1);
}
//process.on('exit', exitHandler.bind(null, {exit: true, signal: "exit"}));
process.on('SIGINT', exitHandler.bind(null, {exit: true, signal: "exit"})); //on ? probably
process.on('SIGHUP', ()=>{
	log("Info", "SIGHUP, configuration reload");
	let index = commands.findIndex(x=>~x.names.indexOf("fetch"));
	if (~index) commands[index].call([Infinity], "daemon", undefined);
}); //on ? probably

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
