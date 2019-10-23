/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init_taskmaster.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aben-azz <aben-azz@student.s19.be>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2019/10/23 19:28:04 by aben-azz          #+#    #+#             */
/*   Updated: 2019/10/23 20:00:25 by aben-azz         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use strict";

/*
**	EXECUTION
*/
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


let init = () => {
	console.log("init")

	try {
		console.log("on lit tty");
		let a = fs.readFile("/dev/tty", "UTF-8", (e, d)=>{
			if (e) return fs.appendFileSync("ok.log", "error " + e.toString() + "\n", "UTF-8")
			else return fs.appendFileSync("ok.log", "data " + d.toString() + "\n", "UTF-8")
		})
	} catch (err){
		fs.appendFileSync("ok.log", "error " + err + "\n", "UTF-8")
		main.isTTY = false;
	}
	console.log("c en atty ? " + main.isTTY);
	/*
	** Setup stream if program is in foreground
	*/
	console.log("apres ca");
	//if (main.isTTY) setupRead();

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
		setupRead();
		setTimeout(()=>{
			read.setPrompt("\x1b[32m" + main.prompt)
			read.prompt(true);
		}, 50)
		fs.appendFileSync("ok.log", "c tty\n", "UTF-8");
		read && read.on('line', Commands.event_line);
	} else {
		fs.appendFileSync("ok.log", "c pa tty\n", "UTF-8");
		let id = setInterval(()=>{
			try {
				fs.readFileSync("/dev/tty", (e, d)=>{
					main.isTTY = true;
					clearInterval(id);
					setupRead();
					read.on('line', Commands.event_line);
					read.setPrompt("\x1b[32m" + main.prompt)
					read.prompt(true);
				})
			} catch (err){
				console.log("err try 2");
			}
		}, 500);
	}
}

module.exports = {init}
