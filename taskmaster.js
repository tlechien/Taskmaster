"use strict";
global.readline = require('readline');
global.fs = require('fs');
global.os = require('os');
global.tty = require('tty');
global.child_process = require('child_process');
const PATH = os.homedir();
let {
	startProgram,
	write_fd
} = require("./builtin.js");
let {
	handle_command,
	autocompletion
} = require("./commands.js");

global.read = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
	completer: autocompletion,
	removeHistoryDuplicates: true
});

global.main = {
	isConfigurationValid: true,
	programs: {},
	processes: [],
	prompt: "Taskmaster: \x1B[0m",
	suffix: ".tm.json",
	configDir: PATH + "/taskmaster",
	isTTIN: false,
};

class Program {
	constructor(object){
		Object.assign(this, object);
		this.subprocess = [];
	}
	get getVariables (){
		return Object.keys(this).map(x=>this[x]);
	}
}

global.checkTaskMasterDir = () => {
	try {
		fs.accessSync(main.configDir, fs.constants.R_OK | fs.constants.W_OK);
		console.log("Dossier existant");
	} catch (error) {
		if (error === "ENOENT") {
			console.log("Dossier ${PATH}/taskmaster non-existant on le crée ...");
			fs.mkdir(main.configDir, (err)=>{
				if (err) console.log("Création interrompue.");
				console.log("Dossier créé avec succes...");
			});
		} else if (error === "EACCESS") {
			console.log("Droit insuffisant.");
			main.isConfigurationValid = false;
			//Initialiser variable pour empecher les manipulations sur les fichiers de configurations
		} else {
			main.isConfigurationValid = false;
			console.log(error.toString());
		}
		console.log("Erreur: " + error.code);
	}
};

global.loadFile = file => {
	let obj = JSON.parse(fs.readFileSync(PATH + "/taskmaster/" + file, "UTF-8"));
	let program = new Program(obj);
	main.programs[program.name] = program;
	console.log(program.name + " a été ajouté aux programmes.");

};

global.loadConfiguration = () => {
	if (!main.isConfigurationValid)  return console.log("Dossier de configuration inexistant.");
	let files =  fs.readdirSync(main.configDir, "UTF-8");
	files.filter(x=>x.endsWith(main.suffix)).forEach(loadFile);
	console.log("Tous les fichiers de configuration ont été chargés")

};

checkTaskMasterDir();
loadConfiguration();

read.setPrompt("\x1b[32m" + main.prompt)
read.prompt(true);
read.on('line', (line) =>{
	if (!handle_command(line))
	{
		if (read) read.setPrompt("\x1b[31m" + main.prompt)
	} else {
		read && read.setPrompt("\x1b[32m" + main.prompt)

	}
	read && read.prompt(!true);
});

process.on('SIGUSR1', () => {
	// `prompt` will automatically resume the stream
	console.log("Reprise du programme stp process sigstp.");
	read && read.close();
	fs.writeFile(".state", "1", ()=>{});
	process.kill(process.pid, "SIGTSTP");
});

process.on("SIGTTIN", ()=>{
	if (main.isTTIN)
		return;
	global.read = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		completer: autocompletion,
		removeHistoryDuplicates: true
	});
	console.log("fg")
	read.setPrompt("\x1b[32m" + main.prompt)
	read.prompt(true);
	main.isTTIN = true;
	fs.writeFile(".state", "0", ()=>{});
	read.on('line', (line) =>{
		if (!handle_command(line))
		{
			if (read) read.setPrompt("\x1b[31m" + main.prompt)
		} else {
			read && read.setPrompt("\x1b[32m" + main.prompt)
		}
		read && read.prompt(!true);
	});
	fs.appendFile("fichier.log", "signal recu TTIN", ()=>{});
})
//
// setInterval(()=>{
// 	let string = `istty ? ${[process.stdin.isTTY, process.stdout.isTTY], tty.isatty(0), tty.isatty(1)}
// 	${[process.pid, process.getgid()]}
// 	${[process.getegid(),process.geteuid(),process.getgid(),process.getgroups(), process.getuid(), process.ppid, process.uptime()]}}\n`;
// 	fs.appendFile("fichier.log", string, function (err) {
// 		if (err) throw err;
// 		//console.log('Saved!');
// 	});
// 	//process.stderr.write("coucou");
// }, 1000 * 3)
