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
	configDir: PATH + "/taskmaster",
	taskLogs: this.configDir + ".logs",
	pidLogs: this.configDir + ".pids",
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

process.on("beforeExit", ()=>{
	killChilds();
});

Init.init();
