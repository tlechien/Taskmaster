"use strict";
const readline = require('readline');
const fs = require('fs');
const os = require('os');
const child_process = require('child_process');
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
	configDir: PATH + "/taskmaster"
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
	let retur = handle_command(line);
	if (!handle_command(line))
	{
		read.setPrompt("\x1b[31m" + main.prompt)
	} else {
		read.setPrompt("\x1b[32m" + main.prompt)

	}
	read.prompt(!true);
});



process.on("SIGINT", ()=>{
	console.log("SIGINT");
	process.exit(0);
});
