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

global. questions = [
	"Quel sera le nom du programme ?",
	"Quelle sera la commande lancée au demarrage du programme? ",
	"Combien de fois la commande doit-elle etre executée ?",
	"Doit-elle s'executer au demarrage de taskmaster ? (y)es|(o)ui/(n)o|(n)on",
	"Quand doit-elle redemarrer ? ((a)lways/(n)ever/(s)ignal)",
	"Quelles-sont les sorties attendues ? Exemple: '0, -1, 127'",
	"A partir de combien de ms le programme est considéré comme bien executé ?",
	"Combien de tentative de lancement du programmes taskmaster devra faire ?",
	"Quel signal sera utilisé pour kill le programme ?",
	"A partir de combien de ms le programme doit terminer ?",
	"Quelle sera le fichier d'ecriture de la sortie d'erreur ?",
	"Quelle sera le fichier d'ecriture de la sortie standard ?",
	"Quelles variables d'environnement doivent etre mise au lancement ? Exemple: 'FCEDIT=\"atom -- wait\"'",
	"Quelle est le dossier dans lequel le programme doit-il s'executer ?",
	"Quelle sera l'umask ?"
]

let isValidCommandSyntaxe = command => {
	return true;
}

global.question = (program, id) => {
	let recal = (errorMsg) =>
	{
		console.log("Message d'erreur: " + errorMsg);
		question(program, id);
	}
	if (id < questions.length){
		read.question(questions[id] + "\n", answer=>{
			if (answer.length == 0)
				return (recal);
			else if (id == 0){ // name

				program.name = answer;
			} else if (id == 1){ //commande
				if (!isValidCommandSyntaxe(answer))
					return recal("Syntaxe invalide");
				program.command = answer;
			} else if (id == 2){ //count
				if (isNaN(+answer) || +answer <= 0)
					return recal();
				program.count = +answer;
			} else if (id == 3){//execution At Launch
				if (!~["y", "o", "oui", "yes", "non", "no", "n"].indexOf(answer))
					return recal()
				program.execAtLaunch = "oy".includes(answer[0]);
			} else if (id == 4){
				if (!~["a", "n", "s", "always", "never", "signal"].indexOf(answer))
					return recal()
				program.restart = "a".includes(answer[0]) ? "always" : "n".includes(answer[0]) ? "never" : "signal";
			} else if (id == 5){
				let numbers = answer.split(/[^0-9]/g).filter(x=>x);
				if (!numbers.length)
					return recal();
				program.expectedOutput = numbers;
			} else if (id == 6){
				if (isNaN(+answer) || +answer <= 0)
					return recal();
				program.successTime = +answer;
			} else if (id == 7){
				if (isNaN(+answer) || +answer <= 0)
					return recal();
				program.retryCount = +answer;
			} else if (id == 8)
				program.killSignal = answer;
			else if (id == 9){
				if (isNaN(+answer))
					return recal();
				program.terminationTime = +answer;
			} else if (id == 10){
				//verifier si le path est existant
				program.redirect = {err: answer, out: ""}
			} else if (id == 11){
				//verifier si le path est existant
				program.redirect.out = answer
			} else if (id == 12){
				let env = answer.split(" ");
				program.env = {};
				env.forEach(keyvalue=>{
					if (!~keyvalue.indexOf("="))
						program.env[keyvalue] = "";
					else {
						let key = keyvalue.substr(0, keyvalue.indexOf("="));
						let value = keyvalue.substr(keyvalue.indexOf(keyvalue.indexOf("=")))
						program.env[key] = value || "";
					}
				})
			} else if (id == 13){
				//verifier si le path est existant
				program.workingDirectory = answer;
			} else if (id == 14){
				if (isNaN(+answer))
					return recal();
				program.umask = answer;
			}
			question(program, id + 1);

		})

	} else {
		read.setPrompt("\x1b[32m" + main.prompt)
		read.prompt(true);
		console.log("c terminé ", program)
	}
}

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
