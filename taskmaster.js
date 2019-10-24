"use strict";
global.readline = require('readline');
global.fs = require('fs');
global.os = require('os');
global.tty = require('tty');
global.child_process = require('child_process');
global.Builtin = require("./builtin");
global.Commands = require("./commands");
global.Init = require("./init_taskmaster");
global.PATH = os.homedir();
global.CONFIGDIR = PATH + "/taskmaster";
/*
** DECLARATION
*/
//console.log(os.constants);

global.main = {
	isConfigurationValid: true,
	programs: {},
	processes: [],
	prompt: "Taskmaster: \x1B[0m",
	suffix: ".tm.json",
	taskLogs: CONFIGDIR + "/.logs",
	pidLogs: CONFIGDIR + "/.pids",
	isTTY: true
};

global.Program = class {
	constructor(object){
		Object.assign(this, object);
		this.subprocess = [];
	}
	get getVariables (){
		return Object.keys(this).map(x=>this[x]);
	}
}

/*
** Catch event SIGTTIN to prevent interruption in background
*/

process.on("SIGTTIN", ()=>{
	fs.appendFileSync("ok.log", "BG\n", "UTF-8")
})

process.on("SIGCONT", ()=>{
	fs.appendFileSync("ok.log", "FG\n", "UTF-8")
	//if (global.id)
	//	clearInterval(global.id);
	main.isTTY = true;
})

function exitHandler(options, err) {
	console.log("beforeExit")
	killChilds();
	process.exit(1);
}
process.on('exit', exitHandler.bind(null, {exit: true, signal: "exit"}));
process.on('SIGINT', exitHandler.bind(null, {exit: true, signal: "sigint"}));
process.on('SIGUSR1', exitHandler.bind(null, {exit: true, signal: "usr1"}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true, signal: "usr2"}));
process.on('SIGTERM', exitHandler.bind(null, {exit: true, signal: "sigterm"}));
process.on('uncaughtException', (x) => {
    //exitHandler.bind(null, {exit: true, signal: "exception"});
	console.log("Error " + x);
});
Init.init();
