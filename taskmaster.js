"use strict";
global.readline = require('readline');
global.fs = require('fs');
global.os = require('os');
global.tty = require('tty');
global.child_process = require('child_process');
let Builtin = require("./builtin");
let Commands = require("./commands");
const PATH = os.homedir();

/*
** DECLARATION
*/


global.main = {
	isConfigurationValid: true,
	programs: {},
	processes: [],
	prompt: "Taskmaster: \x1B[0m",
	suffix: ".tm.json",
	configDir: PATH + "/taskmaster",
	isTTY: true
};


/*
** Configure reading stream
*/
let setupRead = () => {
	process.stdin.setRawMode(true);
	global.read = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		completer: Commands.autocompletion,
		removeHistoryDuplicates: true
	});
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

let killOld = () => {
	try {
		let command = `ps -A | grep "node taskmaster.js" | grep -v grep`;
		let stdout = child_process.execSync(command, {encoding: "UTF-8"});
		let array = stdout.split("\n");
		array = array.filter(x=>x.length).map(x=>x.trim().substr(0, x.trim().indexOf(" "))).filter(x=>x!=process.pid);
		if (!array.length)
			;//console.log("Une seule instance de taskmaster est en cours")
		else
		{
			//console.log(array.join(" | ") + " sont des pids qui sont pas egaux a " + process.pid);
			array.forEach(pid=>{
				killPid(+pid, "SIGKILL");
			//	console.log("\r" + pid + " terminé.")
			})
		}
	} catch (e){}

	return (3);
}

/*
**	EXECUTION
*/

/*
** Catch event SIGTTIN to prevent interruption in background
*/
process.on("SIGTTIN", ()=>{
	fs.appendFileSync("ok.log", "BG\n", "UTF-8")
})

process.on("SIGCONT", ()=>{
	fs.appendFileSync("ok.log", "FG\n", "UTF-8")
	if (id)
		clearInterval(id);
	main.isTTY = true;
})

/*
** Try accessing TTY to check if program is in background or not.
*/
try {
 fs.readFileSync("/dev/tty", (e, d)=>{
 	if (e) fs.appendFileSync("ok.log", "error " + e.toString() + "\n", "UTF-8")
 	else fs.appendFileSync("ok.log", "data " + d.toString() + "\n", "UTF-8")

})} catch (err){
	fs.appendFileSync("ok.log", "error " + err + "\n", "UTF-8")
	main.isTTY = false;
}

/*
** Setup stream if program is in foreground
*/
if (main.isTTY)
	setupRead
/*
** Checks that taskmaster have access to ressources
*/
checkTaskMasterDir();

/*
** Load configuration, build objects.
*/
loadConfiguration();

/*
** Kill other instances of taskmaster to be the only one alive.
*/
killOld();

/*
** Display the prompt and get the input.
*/
if (main.isTTY){
setTimeout(()=>{
	read.setPrompt("\x1b[32m" + main.prompt)
	read.prompt(true);
}, 50)
///fs.appendFileSync(PATH + "/taskmaster/" + "debug", "istty: " + process.stdin.isTTY,process.stdout.isTTY + "\n", "UTF-8");
read && read.on('line', Commands.event_line);
}
if (!main.isTTY){
	let id = setInterval(()=>{
		try {
	 		fs.readFileSync("/dev/tty", (e, d)=>{
	 			main.isTTY = true;
				clearInterval;
				setupRead();
				read.on('line', Commands.event_line);
				setTimeout(()=>{
				read.setPrompt("\x1b[32m" + main.prompt)
				read.prompt(true);
				}, 50)
			})} catch (err){
	}
	}, 500);
}


//
// process.on("warning", (error)=>{
// 	let code = error.code;
// 	if (code == "DEP0013")
// 		console.log("c tty");
// })
