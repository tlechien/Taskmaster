"use strict";
let antiprompt = str => console.log("\r" + str + " ".repeat(process.stdout.columns - str.length));
global.commands = [
	{
		names: ["help", "h"],
		usage: "Lists commands.\n\thelp {command}",
		call: (argv, side, socket) => {
			void socket;
			if (side === "ctl"){
				if (!argv.length){
					let cmd = commands.map(x=>"[" + x.names.join(" | ") + "]: " + x.usage);
					console.log("Commandes disponibles:\n" + cmd.join("\n"));
					return true;
				} else {
					let index = commands.findIndex(x=>~x.names.indexOf(argv[0]));
					if (~index)
					{
						let cmd = commands[index];
						console.log("[" + cmd.names.join("|") + "]: " + cmd.usage);
						return true;
					}
					else
					{
						let cmd = commands.map(x=>"[" + x.names.join("|") + "]: " + x.usage);
						console.log(argv[0] + " not found. Commandes disponibles:\n" + cmd.join("\n"));
						return false;
					}
				}
			}
		}
	}, {
		names: ["infos", "info", "i"],
		usage: "Print infos of programs.\n\ti atom",
		call: (argv, side, data) => {
			if (side === "ctl" && !argv.length)
			 return console.log("Usage: status [command]\nUtilisez status [--l|-list] pour avoir la liste des commandes.");
			if (side === "daemon" && argv.length){
				if (~["--list", "--l", "-l", "-list"].indexOf(argv[0]))
					return data.emit("cmd", "info", [-1, ...argv], Object.keys(daemon.programs));
				if (!~Object.keys(daemon.programs).indexOf(argv[0]))
					return data.emit("cmd", "info", argv, "Error");
				let programs = daemon.programs[argv[0]];
				programs = {
					command: programs.command,
					count: programs.count,
					execAtLaunch: programs.execAtLaunch,
					restart: programs.restart,
					expectedOutput: programs.expectedOutput,
					successTime: programs.successTime,
					retryCount: programs.retryCount,
					killSignal: programs.killSignal,
					terminationTime: programs.terminationTime,
					env: programs.env,
					workingDirectory: programs.workingDirectory,
					umask: programs.umask,
					name: programs.name,
					err: programs.err,
					out: programs.out,
					custom_err: programs.custom_err,
					custom_out: programs.custom_out,
				};
				data.emit("cmd", "info", argv, programs);
			}
			if (side === "ctl" && data && argv.length){
				if (argv[0] == "Error")
					console.log("\rErreur " + argv[0] + " n'existe pas.")
				else if (!~argv[0])
					console.log("Programme(s) disponible(s): " + data.join(" | ") + ".");
				else {
					antiprompt(`\r${argv[0].toUpperCase()}:`);
					console.log(`\r\tcommand: ${data.command},
					\r\tcount: ${data.count},
					\r\texecAtLaunch: ${data.execAtLaunch},
					\r\trestart: ${data.restart},
					\r\texpectedOutput: ${data.expectedOutput},
					\r\tsuccessTime: ${data.successTime},
					\r\tretryCount: ${data.retryCount},
					\r\tkillSignal: ${data.killSignal},
					\r\tterminationTime: ${data.terminationTime},
					\r\tenv: \n\t\t${Object.keys(data.env).map((x, i, a)=>x + ": " + data.env[x] + ((i == a.length - 1) ? "" : ",")).join("\n\t\t")}
					\r\tworkingDirectory: ${data.workingDirectory || "."},
					\r\tumask: ${data.umask},
					\r\tname: ${data.name},
					\r\terr: ${data.err},
					\r\tout: ${data.out},
					\r\tcustom_err: ${data.custom_err},
					\r\tcustom_out: ${data.custom_out}`)			//console.log(status)
				}
				read.prompt(true);
			}
			return true;
		}
	}, {
		names: ["stop", "stp"],
		usage: "Print status of a program.\n\tstop",
		call: (argv, side, data) => {
			void data;
			if (side === "daemon")
			{
				if (!argv.length)
					return console.log("Ca marche pa ");
				console.log("On stop", argv[0]);
				let index = Object.keys(daemon.programs).findIndex(x=>{
					return ~x.toLowerCase().indexOf(argv[0].toLowerCase())
				});
				if (!~index)	console.log("Commande non trouvée: %s", argv[0]);
				else killChilds(daemon.programs[Object.keys(daemon.programs)[index]]);
			}
			return true;
		}
	}, {
		names: ["restart", "re"],
		usage: "Restart a programs.\n\trestart [program]",
		call: (argv, side, data) => {
			void side; void data;
			if (!argv.length)
				return console.log("Ca marche pa ");
			console.log("On stop", argv[0]);
			let index = Object.keys(daemon.programs).findIndex(x=>{
				return ~x.toLowerCase().indexOf(argv[0].toLowerCase())
			});
			if (!~index) console.log("Commande non trouvée: %s", argv[0]);
			else {
				let prog = daemon.programs[Object.keys(daemon.programs)[index]];
				killChilds(prog);
				prog.subprocess.length = 0;
				launchProcess(prog)
			}
			return true;
		}
	}, {
		names: ["status", "s"],
		usage: "Print status of a program.\n\tstatus program",
		call: (argv, side, data) => {
			if (side === "ctl" && !data && !argv.length)
				return console.log("Usage: status [command]\nUtilisez status [--l|-list] pour avoir la liste des commandes.");
			else if (side === "ctl" && data){
				if (data === "Error")
					console.log("\rErreur " + argv[0] + " n'existe pas.");
				else if (!~argv[0])
					console.log("Programme(s) disponible(s): " + data.join(" | ") + ".");
				else {
					if (!data.length)
						console.log(argv[0] + " n'a pas été executé.");
					else {
						antiprompt(argv[0].toUpperCase());
						let status = data.map((sub, index)=>{
							return `${index}:
							\r  status: ${sub.status},
							\r  exit: ${sub.exit},
							\r  pid: ${sub.pid},
							\r  exitCode: ${sub.exitCode},
							\r  timestamp: ${sub.timestamp},
							\r  timestop: ${sub.timestop}`
						});
						console.log(status.join("\n"));
					}
				}
				read.prompt(true);
			}
			else if (side === "daemon" && argv.length){
				if (~["--list", "--l", "-l", "-list"].indexOf(argv[0]))
					return data.emit("infos", Object.keys(daemon.programs), -1);
				if (!~Object.keys(daemon.programs).indexOf(argv[0])) return data.emit("cmd", "status", argv, "Error");
				let programs = daemon.programs[argv[0]].subprocess.map(sub=>{
					return {
						status: sub.status,
						exit: sub.exit,
						pid: sub.child.pid,
						exitCode: sub.child.exitCode,
						timestamp: sub.timestamp,
						timestop: sub.timestop
					}
				});
				data.emit("cmd", "status", argv, programs)
			}
			return true;
		}
	},{
		names: ["tail", "t", "log", "l"],
		usage: "Display log file.\n\ttail program [out|err]",
		call: (argv, side, data) => {
			if (side === "ctl" && !data && argv.length !== 2)
				return console.log("To get the list of the programs, type `info -l`\nUsage: tail [program] [out|err]");
			if (side === "ctl" && data)
			{
				if (!~argv[2])
					console.log("\rErreur " + argv[0] + " n'existe pas.");
				else if (argv[2] === -2)
					console.log("\rFd incorrect, veuillez choisir entre out et err");
				else {
					let str;
					if (argv[2] === "") str = "logs/" + CONFIGDIR + "/" + argv[0] + "." + argv[1];
					else str = CONFIGDIR + "/" + argv[2];
					child_process.spawnSync("more", [str], {stdio: "inherit"});
				}
				read.prompt(true);
			}
			if (side === "daemon" && argv.length === 2){
				if (!argv.length)
					return ;
				if (!daemon.programs.hasOwnProperty(argv[0]))
					return data.emit("cmd", "tail", [...argv, -1], true);
				else if (!~["out", "err"].indexOf(argv[1]))
					return data.emit("cmd", "tail", [...argv, -2], true);
				let prog = daemon.programs[argv[0]];
				argv[2] = argv[1] === "err" ? prog.custom_err : prog.custom_out;
				return data.emit("cmd", "tail", argv, true);
			}
			return true;
		}
	}, {
		names: ["update", "u"],
		usage: "Update configurations files.\n\tupdate -l",
		call: (argv, side, data) => {
			// if (!main.fetchs.length)
			// 	console.log("La liste des fetchs est vide, utilisez .fetch");
			// else if (~argv.indexOf("-l") || ~argv.indexOf("-list")){
			// 	console.log("Fetchs: "  + main.fetchs.program.name.join(" | ") + ".")
			// } else if (!argv.length){
			// 	main.fetchs.forEach(program=>{
			// 		updateConfig(program);
			// 		console.log(program.name + " a été mis à jour.");
			// 	});
			// 	main.fetchs = [];
			// } else {
			// 	argv.forEach(x=>{
			// 		if (~main.fetchs.program.indexOf(x.toLowerCase()))
			// 		{
			// 			main.fetchs.splice(main.fetchs.indexOf(x.toLowerCase()), 1);
			// 			console.log(x + " a été fetch seul");
			// 		}
			// 		else
			// 			console.log(x + " n'existe pas dans la liste des fetchs");
			// 	})
			// }
		}
	}, {
		names: ["fetch", "f"],
		usage: "Fetch configurations files.\n\tfetch",
		call: (argv, side, data) => {
			// let files =  fs.readdirSync(CONFIGDIR, "UTF-8");
			// files.filter(x=>x.endsWith(main.suffix)).forEach((x, y, arr)=>{
			// 	let name = x.substr(0, x.indexOf(main.suffix))
			// 	if (!main.programs[name])
			// 	{
			// 		if (!~main.fetchs.indexOf(name.toLowerCase()))
			// 			main.fetchs.push(name.toLowerCase());
			// 		console.log("Nouveau fichier trouvé " + name);
			// 	} else {
			// 		let hash = get_hash(x, (hash)=>{
			// 			if (hash != main.programs[name].hash)
			// 			{
			// 				if (!~main.fetchs.indexOf(name.toLowerCase())){
			// 					let obj = JSON.parse(fs.readFileSync(PATH + "/taskmaster/" + name + ".tm.json", "UTF-8"));
			// 					let program = new Program(obj, hash, name.toLowerCase()) ;
			// 					main.fetchs.push(program);
			// 				}
			// 				console.log("Le fichier " + name + " a été modifié.")
			// 			}
			// 			if (y == arr.length - 1 && !main.fetchs.length)
			// 				console.log("Rien a fetch");
			// 		})
			// 	}
			//
			// });
			return true;
		}
	}, {
		names: ["create", "c"],
		usage: "Create configurations files.\n\tcreate",
		call: (argv, side, data) => {
			if (side === "ctl"){
				ctl.isQuestion = true;
				return Question.file_creation();
			}
		}
	}, {
		names: ["clear", "clr", "cl"],
		usage: "Clear logs files.\n\tclear program program2 ...",
		call: (argv, side, data) => {
			if (side === "ctl") {
				if (!argv.length){
					console.log("Usage: clear [programs...].");
					return false;
				} else {
					if (!data.length){
						console.log("Aucun resultat trouvé pour les programmes.")
						return ;
					}
					console.log(data);
					if (data.length !== argv.length){
						let exceptions = argv.filter(x=>data.map(y=>y.name).indexOf(x));
						console.log("Le(s) programme(s) suivant(s) n'ont pas été trouvé(s) : " + execeptions.join(", ") + ".");
					}
					console.log("c ok pour " + data.join(", ") + ".");
				}
			} else if (side === "daemon"){
				//confirmation ?
				console.log("daemon clear ", argv, side);
				console.log("ici", argv);
				data.emit("cmd", "clear", argv, daemon.programs.filter(x=>~argv.indexOf(x.name)));
			}
			return true;
		}
	}, {
		names: ["clearall"],
		usage: "Clear all logs files.\n\tclearall",
		call: (argv, side, data) => {
			if (side === "daemon"){
				//confirmation ?
				daemon.programs.forEach(clearLog);
			}
			console.log(dir);
			log("Clearing log files ...");
			return true;
		}
	}, {
		names: ["import"],
		usage: "import config files from a directory",
		call: (argv, side, data) => {
			// while (argv)
			// {
			// 	let name = argv.substr(argv.lastIndexOf("_") + 1)
			// 	if (name in main.programs);{
			// 	if (read.question("A file called $name is already loaded, do you want to rename it ? (y)es|(n)o/(a)bort" + "\n> ", answer=>{
			// 	return(answer == "y")})); {
			// 		read.question("")
			// 	}
			// 	}
			// 	if (deja existant || deja dans le dossier || pas .tm.json)
			// 		demander si renommer ou annuler
			// 	else
			// 	{
			// 		verifier integrité fichier;
			// 		copy file dans le CONFIGDIR;
			// 	}
			// }
			return true;
		}
	}, {
		names: ["quit", "q"],
		usage: "Close taskmaster.\n\tquit",
		call: (argv, side, data) => {
			log("Closing taskmaster ...");
			process.exit(0);
			return true;
		}
	}, {
		names: ["exit", "background", "bg"],
		usage: "Exit and send taskmaster in background.\n\tbg",
		call: (argv, side, data) => {
			if (side === "ctl")
				process.exit(0);
		}
	}
];

let autocompletion = line => {
	let completions;
	if (Array.prototype.flatMap)
		completions = commands.flatMap(x => x.names);
	else
		completions = commands.reduce((x,y)=>x.concat(y.names), []);
	let hits = completions.filter(c => !c.indexOf(line));
	return [hits.length ? hits : completions, line];
};

let event_line = line =>{
	let index = handle_command(line);
	if (!index && read) read.setPrompt("\x1b[31m" + ctl.prompt);
	else if (read)read.setPrompt("\x1b[32m" + ctl.prompt);
	if (read) read.prompt(true);
};

let handle_command = command => {
	let cmds = command.split(" ");
	command = cmds[0];
	let argv = cmds.slice(1);
	let index = commands.findIndex(x=>~x.names.indexOf(command));
	try {
		if (~index){
			log("CTL command", command, argv.join());
			//ctl.socket_client.emit("data", "test");
			ctl.socket_client.emit("cmd", command, argv, index);
			return commands[index].call(argv, "ctl", false);
		}
		else if (command.trim().length)
		{
			console.log("Commande not found. Type help for a list of available command");
			return (0);
		} else return (1)
	} catch (e) {
		console.log("handle_command", e);
	}

};

// process.on("SIGCONT", ()=>{
// 	console.log("on reprend ? " + process.stdin.isTTY);
// })
module.exports = {handle_command, autocompletion, event_line};
