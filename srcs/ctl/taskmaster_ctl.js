"use strict";
global.readline = require('readline');
global.fs = require('fs');
global.child_process = require('child_process');
global.Commands = require("../commands");
global.Init = require("./init_taskmaster_ctl");
global.socket = require("socket.io");
global.io = require('socket.io-client');
global.PATH = require('os').homedir();
global.CONFIGDIR = PATH + "/taskmaster";
global.logfile =  CONFIGDIR + "/logs/taskmaster_log"

/*
** DECLARATION
*/
//console.log(os.constants);

global.log = (...msg) =>{
	let date = new Date().toString();
	date = date.substr(0, date.indexOf(" ("))
	fs.appendFileSync(logfile, "[" + date + "]\n-> " + msg.join(" ") + "\n", "utf-8");
}
log("Session CTL demarrée.");

global.questions = [
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
	"Quelles variables d'environnement doivent etre mise au lancement ? Exemple: 'FCEDIT=\"atom -- wait\"'",
	"Quelle est le dossier dans lequel le programme doit-il s'executer ?",
	"Quelle sera l'umask ?",
	"Souhaitez-vous activez la sortie d'erreur ? (y)es|(o)ui/(n)o|(n)on",
	"Souhaitez-vous activez la sortie standard ? (y)es|(o)ui/(n)o|(n)on",
]

let isValidCommandSyntaxe = command => {
	return true;
}

global.question = (program, id) => {
	ctl.isQuestion = true;
	let recall = (errorMsg) =>{
		console.log("Message d'erreur: " + errorMsg);
		question(program, id);
	}
	read.question(questions[id] + "\n> ", answer=>{
		if (answer.length == 0 && !~[10,15,16].indexOf(id))
			return (recall("Empty command"));
		else if (id == 0){ // name
			program.name = answer;
			program.fd = {err: "/logs" + answer + ".err", out: "/logs" + answer + ".out"};
		} else if (id == 1){ //commande
			if (!isValidCommandSyntaxe(answer))
				return recall("Invalid syntax");
			program.command = answer;
		} else if (id == 2){ //count
			if (isNaN(+answer) || +answer <= 0)
				return recall("Invalid number");
			program.count = +answer;
		} else if (id == 3){//execution At Launch
			if (!~["y", "o", "oui", "yes", "non", "no", "n"].indexOf(answer))
				return recall("Unexpected answer. Please choose amongst (y)es|(o)ui/(n)o|(n)on")
			program.execAtLaunch = "oy".includes(answer[0]);
		} else if (id == 4){
			if (!~["a", "n", "s", "always", "never", "signal"].indexOf(answer))
				return recall("Unexpected answer. ((a)lways/(n)ever/(s)ignal)")
			program.restart = "a".includes(answer[0]) ? "always" : "n".includes(answer[0]) ? "never" : "signal";
		} else if (id == 5){
			let numbers = answer.split(/[^0-9]/g).filter(x=>x);
			if (!numbers.length)
				return recall("Invalid numbers");
			program.expectedOutput = numbers;
		} else if (id == 6){
			if (isNaN(+answer) || +answer <= 0)
				return recall("Invalid number");
			program.successTime = +answer;
		} else if (id == 7){
			if (isNaN(+answer) || +answer <= 0)
				return recall("Invalid or non-positive number");
			program.retryCount = +answer;
		} else if (id == 8)
			program.killSignal = answer;
		else if (id == 9){
			if (isNaN(+answer))
				return recall("Invalid number");
			program.terminationTime = +answer;
		} else if (id == 10){
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
		} else if (id == 11){
			//verifier si le path est existant
			program.workingDirectory = answer;
		} else if (id == 12){
			if (isNaN(+answer))
				return recall("Invalid number");
			program.umask = answer;
		} else if (id == 13){
			if (!~["y", "o", "oui", "yes", "non", "no", "n"].indexOf(answer))
				return recall("Unexpected answer. Please choose amongst (y)es|(o)ui/(n)o|(n)on")
			let question = 	"Souhaitez-vous écrire la sortie d'erreur dans un fichier spécifique laissez a vide pour qu'un fichier soit générer automatiquement"
			if ((program.err = "oy".includes(answer[0])))
				read.question(question + "\n>", answer=>{
					if (!answer.length)
					{
						program.custom_err += program.name + ".err";
						return ;
					}
					program.custom_err = answer;
				})
		} else if (id == 14){
			if (!~["y", "o", "oui", "yes", "non", "no", "n"].indexOf(answer))
				return recall("Unexpected answer. Please choose amongst (y)es|(o)ui/(n)o|(n)on")
			program.out = "oy".includes(answer[0]);
			let question = 	"Souhaitez-vous écrire la sortie standard dans un fichier spécifique laissez a vide pour qu'un fichier soit générer automatiquement"
			if ((program.out = "oy".includes(answer[0])))
				read.question(question + "\n>", answer=>{
					if (!answer.length)
					{
						program.custom_out += program.name + ".out";
						return ;
					}
					program.custom_out = answer;
				})
		}
		if (questions[id + 1]) question(program, id + 1);
		else
		{
			read.setPrompt("\x1b[32m" + ctl.prompt)
			read.prompt(true);
			//ctl.programs[program.name] = new Program(program);
			fs.writeFileSync("configurations/" + program.name + ".tm.json", JSON.stringify(program));
			ctl.socket_client.emit("reloadConfiguration", program.name);
			log("Create new program", program.name);
			ctl.isQuestion = false;
		}
	})
}

global.ctl = {
	isConfigurationValid: true,
	programs: {},
	processes: [],
	fetchs: [],
	prompt: "Taskmaster: \x1B[0m",
	suffix: ".tm.json",
	taskLogs: CONFIGDIR + "/.logs",
	pidLogs: CONFIGDIR + "/.pids",
	isQuestion: false,
};


/*
** Catch event SIGTTIN to prevent interruption in background
*/


function exitHandler(options, err) {
	//log("Fin de session CTL")
	//emit killAllChilds();
	process.exit(1);
}
process.on('exit', exitHandler.bind(null, {exit: true, signal: "exit"}));
process.on('SIGINT', exitHandler.bind(null, {exit: true, signal: "sigint"}));
process.on('SIGUSR1', exitHandler.bind(null, {exit: true, signal: "usr1"}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true, signal: "usr2"}));
// process.on('SIGTERM', exitHandler.bind(null, {exit: true, signal: "sigterm"}));
// process.on('uncaughtException', (x) => {
//     exitHandler.bind(null, {exit: true, signal: "exception"});
// 	console.log("Error uncaught" + x.toString());
// });
//process.on('SIGTERM', exitHandler.bind(null, {exit: true, signal: "sigterm"}));
process.on('uncaughtException', (x) => {
    //exitHandler.bind(null, {exit: true, signal: "exception"});
	console.log("Error " + x);
});

Init.init();
