"use strict";
global.readline = require('readline');
global.fs = require('fs');
global.child_process = require('child_process');
global.Commands = require("../commands");
global.Init = require("./init_taskmaster_ctl");
global.socket = require("socket.io");
global.io = require('socket.io-client');
global.MAINDIR = process.cwd() + "/";
//global.MAINDIR = PATH + "/taskmaster/";
global.LOGDIR = MAINDIR + "logs/";
global.CONFIGDIR = MAINDIR + "configurations/";
global.logfile =  MAINDIR + "logs/taskmaster_log"
global.Question = require("./file_creation");
/*
** DECLARATION
*/
//console.log(os.constants);

global.log = (type = "INFO", message) => {
	if (!message) return;
	let date = new Date().toString();
	date = date.substr(0, date.indexOf(" ("))
	let msg = "[" + date + "]\n-> ";
	msg += {WARNING: "\x1b[33m ⚠", ERROR: "\x1b[31m ✖", OK: "\x1b[32m ✔", INFO: "\x1b[36m ℹ", "": "\x1b[36m ℹ"}[type.toUpperCase()] || "\x1b[36m ℹ";
	msg += "  " + message + "\x1b[0m";
	console.log(msg + "\x1b[0m");
	fs.appendFileSync(logfile, msg + "\n", "utf-8");
}

log("OK", "Session CTL started.");

global.ctl = {
	isConfigurationValid: true,
	programs: {},
	processes: [],
	fetches: [],
	prompt: "Taskmaster: \x1B[0m",
	suffix: ".tm.json",
	taskLogs: LOGDIR + ".logs",
	pidLogs: LOGDIR + ".pids",
	isQuestion: false,
};


/*
** Catch event SIGTTIN to prevent interruption in background
*/

function exitHandler(options, err) {
	//log("Fin de session CTL")
	process.stdout.write('\u001B[?25h');
	if (ctl.isQuestion){
		ctl.isQuestion = false;
		global.read.setPrompt(true);
		return ;
	} else process.exit(1);
}
//process.on('exit', exitHandler.bind(null, {exit: true, signal: "exit"}));
process.on('SIGINT', exitHandler.bind(null, {exit: true, signal: "sigint"}));
process.on('SIGUSR1', exitHandler.bind(null, {exit: true, signal: "usr1"}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true, signal: "usr2"}));
// process.on('SIGTERM', exitHandler.bind(null, {exit: true, signal: "sigterm"}));
// process.on('uncaughtException', (x) => {
//     exitHandler.bind(null, {exit: true, signal: "exception"});
// 	console.log("Error uncaught" + x.toString());
// });
//process.on('SIGTERM', exitHandler.bind(null, {exit: true, signal: "sigterm"}));
// process.on('uncaughtException', (x) => {
//     //exitHandler.bind(null, {exit: true, signal: "exception"});
// 	console.log("Error " + x);
// });

Init.init();
