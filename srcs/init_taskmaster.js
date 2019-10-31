/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init_taskmaster.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aben-azz <aben-azz@student.s19.be>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2019/10/23 19:28:04 by aben-azz          #+#    #+#             */
/*   Updated: 2019/10/31 16:25:34 by aben-azz         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use strict";

/*
**	EXECUTION
*/
let checkTaskMasterDir = () => {
	try {
		fs.accessSync(CONFIGDIR, fs.constants.R_OK | fs.constants.W_OK);
		console.log("Dossier existant");
	} catch (error) {
		if (error === "ENOENT") {
			console.log("Dossier ${PATH}/taskmaster non-existant on le crée ...");
			fs.mkdir(CONFIGDIR, (err)=>{
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

global.get_hash = (file, callback) => {
	let shasum = crypto.createHash('sha256')
	let _stream = fs.ReadStream(file);
	_stream.on('data', (_data) => {
		shasum.update(_data);
	});
	_stream.on('end', () => {
		callback(shasum.digest('hex'))
	})
};

let checkJSONFile = file => {
	let string = fs.readFileSync(PATH + "/taskmaster/" + file, "UTF-8");
	let objet;
	try {
		objet = JSON.parse(string);
		//console.log(objet);
	} catch (e){
		console.log("Checkjson " + e.toString());
		return ("Objet niqué inexistant");
	}
	if  (!objet.umask || !Boolean(parseInt(objet.umask, 8)))
		return ("Umask incorrect");
	if (!objet.command || !objet.command.length) return ("Commande inexistante");
	else if (!objet.hasOwnProperty("execAtLaunch") && !objet.execAtLaunch.length) return ("ExecAtLaunch incorrect");
	else if (objet.killSignal)
	{
		let sig = ["SIGALRM", "SIGHUP", "SIGINT", "SIGKILL", "SIGPIPE", "SIGTERM", "SIGUSR1", "SIGUSR2"];
		if (objet.killSignal.filter(x=>!~sig.indexOf(x)).length)
			return ("Signal incorrect");
	}
	return (1);
}

let loadFile = file => {
	let msg = "";
	if ((msg = checkJSONFile(file)) != 1)
		return console.log(file + "\x1b[31m Erreur dans le fichier: " + msg + "\x1b[0m");
	let obj = JSON.parse(fs.readFileSync(PATH + "/taskmaster/" + file, "UTF-8"));
	let program = new Program(obj);
	program.name = file.substr(0, file.indexOf(main.suffix));
	get_hash(file, hash => {
		program.hash = hash;
		//console.log(program.name + " " + program.hash + " xd")
	});
	main.programs[program.name] = program;
	console.log(program.name + " a été ajouté aux programmes.");
};

let loadConfiguration = () => {
	if (!main.isConfigurationValid)  return console.log("Dossier de configuration inexistant.");
	let files =  fs.readdirSync(CONFIGDIR, "UTF-8");
	files.filter(x=>x.endsWith(main.suffix)).forEach(loadFile);
	console.log("Tous les fichiers de configuration ont été chargés")

};

let killOld = () => {
	try {
		let command = `ps -A | grep "node taskmaster" | grep -v grep`;
		let stdout = child_process.execSync(command, {encoding: "UTF-8"});
		let array = stdout.split("\n");
		array = array.filter(x=>x.length).map(x=>x.trim().substr(0, x.trim().indexOf(" "))).filter(x=>x!=process.pid);
		if (!array.length)
			console.log("Une seule instance de taskmaster est en cours")
		else
		{
			console.log(array.join(" | ") + " sont des pids qui sont pas egaux a " + process.pid);
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
	global.read = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		completer: Commands.autocompletion,
		removeHistoryDuplicates: true
	});
	global.read.on("SIGINT", ()=>{
		process.exit(1); //shouldn't exit ??
	})
	global.read.on("SIGTERM", ()=>{
		process.exit(1); //shouldn't exit ??
	})
};


let init = () => {
	//console.log("init")
	/*
	** Setup stream if program is in foreground
	*/
	log("setup read ... ")
	setupRead();
	log("setup read: done")
	/*
	** Checks that taskmaster have access to ressources
	*/
	log("Checking taskmaster dir ...")
	checkTaskMasterDir();
	log("Checking taskmaster dir done")
	/*
	** Load configuration, build objects.
	*/
	log("load Configuration ...")
	loadConfiguration();
	log("load Configuration done")
	/*
	** Kill other instances of taskmaster to be the only one alive.
	*/
	log("kill Old Taskmaster ...")
	killOld();
	log("kill Old Taskmaster done")
	/*
	** Reset Pid log file.
	*/
	log("reset logs ...")
	resetLogs();
	log("reset logs done")
	/*
	** Launch programs that should be started on launch from config.
	*/
	log("exec onLaunch programs ...")
	onLaunchPrograms();
	log("exec onLaunch programs done")
	//startProgram(main.programs.atom);
	/*
	** Display the prompt and get the input.
	*/
	setTimeout(()=>{
		read && read.setPrompt("\x1b[32m" + main.prompt)
		read && read.prompt(true);
	}, 500)
	read && read.on('line', Commands.event_line);
}

module.exports = {init}