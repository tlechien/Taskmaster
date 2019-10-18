"use strict";
global.readline = require('readline');
global.fs = require('fs');
global.os = require('os');
global.child_process = require('child_process');
let Builtin = require("./builtin");
let Commands = require("./commands");
const PATH = os.homedir();
process.stdin.setRawMode(true);

global.read = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
	historySize: 0,
	completer: Commands.autocompletion,
	removeHistoryDuplicates: true
});

global.main = {
	isConfigurationValid: true,
	programs: {},
	processes: [],
	prompt: "Taskmaster: \x1B[0m",
	suffix: ".tm.json",
	configDir: PATH + "/taskmaster",
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

let checkTaskMasterDir = () => {
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

let loadFile = file => {
	let obj = JSON.parse(fs.readFileSync(PATH + "/taskmaster/" + file, "UTF-8"));
	let program = new Program(obj);
	main.programs[program.name] = program;
	console.log(program.name + " a été ajouté aux programmes.");
};

let loadConfiguration = () => {
	if (!main.isConfigurationValid)  return console.log("Dossier de configuration inexistant.");
	let files =  fs.readdirSync(main.configDir, "UTF-8");
	files.filter(x=>x.endsWith(main.suffix)).forEach(loadFile);
	console.log("Tous les fichiers de configuration ont été chargés")

};

checkTaskMasterDir();
loadConfiguration();

read.setPrompt("\x1b[32m" + main.prompt)
read.prompt(true);

if (read)
	read.on('line', (line) =>{
		if (!handle_command(line) && read) read.setPrompt("\x1b[31m" + main.prompt)
		else if (read)read.setPrompt("\x1b[32m" + main.prompt)
		if (read) read.prompt(!true);
	});
else
	console.log("here");

process.on('SIGUSR1', () => {
	process.kill(process.pid, "SIGTSTP");
	/*try {
		read && read.close();
		read = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: true,
			completer: Commands.autocompletion,
			removeHistoryDuplicates: true
		});
		//if (read)
		//	console.log(read);
		//else console.log("MDR CA VA CRASH")
		read &&  read.prompt(true);
		read && read.on('line', (line) =>{
			console.log("carsh line")
			if (!handle_command(line))
			{
				//if (read) read.setPrompt("\x1b[31m" + main.prompt)
			} else {
				//if (read) read.setPrompt("\x1b[32m" + main.prompt)
			}
			console.log("apres commande")
			if (read) read.prompt(!true);
		});
	} catch (e){
		console.log("erreur", e);
	}*/
	//read.setPrompt("\x1b[32m" + main.prompt)

});
