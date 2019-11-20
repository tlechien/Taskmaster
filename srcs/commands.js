"use strict";
global.commands = [
	{
		names: ["help", "h"],
		usage: "Lists commands.\n\thelp {command}",
		call: (argv, side) => {
			if (side == "ctl"){
				if (!argv.length){
					let cmd = commands.map(x=>"[" + x.names.join(" | ") + "]: " + x.usage);
					console.log("Commandes disponibles:\n" + cmd.join("\n"));
					return (true);
				} else {
					let index = commands.findIndex(x=>~x.names.indexOf(argv[0]));
					if (~index)
					{
						let cmd = commands[index];
						console.log("[" + cmd.names.join("|") + "]: " + cmd.usage);
						return (true);
					}
					else
					{
						let cmd = commands.map(x=>"[" + x.names.join("|") + "]: " + x.usage);
						console.log(argv[0] + " not found. Commandes disponibles:\n" + cmd.join("\n"));
						return (false);
					}
				}
				return (false);
			}
			else if (side == "daemon"){
				console.log("commande recu depuis " + side);
			}
		}
	}, {
		names: ["status", "s"],
		usage: "Print status of programs.\n\ts",
		call: (argv, side) => {
			// for (let i in main.programs)
			// {
			// 	let program = main.programs[i];
			// 	console.log(program.name + ": " + program.command)
			// 	if (~argv.indexOf("-l"))
			// 		console.log("\t" + program.getVariables.join("\n\t"));
			// }
			// return (true);
		}
	}, {
		names: ["stop", "stp"],
		usage: "Print status of programs.\n\tstop",
		call: (argv, side) => {
			if (!argv.length)
				return console.log("Ca marche pa ")
			console.log("On stop", argv[0])
			let index = Object.keys(daemon.programs).findIndex(x=>{
				return ~x.toLowerCase().indexOf(argv[0].toLowerCase())
			});
			if (!~index)	console.log("Commande non trouvée: %s", argv[0]);
			else killChilds(daemon.programs[Object.keys(daemon.programs)[index]]);
		}
	}, {
		names: ["restart", "re"],
		usage: "Print status of programs.\n\tstop",
		call: (argv, side) => {
			if (!argv.length)
				return console.log("Ca marche pa ")
			console.log("On stop", argv[0])
			let index = Object.keys(daemon.programs).findIndex(x=>{
				return ~x.toLowerCase().indexOf(argv[0].toLowerCase())
			});
			if (!~index) console.log("Commande non trouvée: %s", argv[0]);
			else {
				let prog = daemon.programs[Object.keys(daemon.programs)[index]]
				killChilds(prog);
				prog.subprocess.length = 0;
				launchProcess(prog)
			}
		}
	}, {
		names: ["tail", "t", "log", "l"],
		usage: "Display log file.\n\ttail program [out|err]",
		call: (argv, side) => {
			log("Tail program log ...");
			return (true);
		}
	}, {
		names: ["update", "u"],
		usage: "Update configurations files.\n\tupdate -l",
		call: (argv, side) => {
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
		call: (argv, side) => {
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
			// return (true);
		}
	}, {
		names: ["create", "c"],
		usage: "Create configurations files.\n\tcreate",
		call: (argv, side) => {
			let newProgram = { //restart prog ? (updateConfig)
				"command": "", //always
				"count": 1, //depends
				"execAtLaunch": true, //non
				"restart": ["always"], //oui
				"expectedOutput": [0], //non
				"successTime": 1000, //oui
				"retryCount": 3, //non
				"killSignal": "SIGINT", //non
				"terminationTime": 30000, //non
				"redirect": { //non
					"err": "default",
					"out": "default"
				},
				"env": { //oui
					"key": "value"
				},
				"workingDirectory": "", //oui
				"umask": "0755" // ?
			}
			//main.isQuestion = true;
			question(newProgram, 0);
			//main.isQuestion = false;

			return (true);
		}
	}, {
		names: ["clear", "clr", "cl"],
		usage: "Clear logs files.\n\tclear program program2 ...",
		call: (argv, side) => {
			console.log("Clear program log files...");
			log("Clear program log files...");
			return (true);
		}
	}, {
		names: ["clearall"],
		usage: "Clear all logs files.\n\tclearall",
		call: (argv, side) => {
			console.log("Clearing log files ...");
			log("Clearing log files ...")
			return (true);
		}
	}, {
		names: ["import"],
		usage: "import config files from a directory",
		call: (argv, side) => {
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
			return (true);
		}
	}, {
		names: ["quit", "q"],
		usage: "Close taskmaster.\n\tquit",
		call: (argv, side) => {
			log("Closing taskmaster ...");
			process.exit(0);
			return (true);
		}
	}, {
		names: ["exit", "background", "bg"],
		usage: "Exit and send taskmaster in background.\n\tbg",
		call: (argv, side) => {
			if (side == "ctl")
				process.exit(0);
		}
	}
]

let autocompletion = line => {
	let completions;
	if (Array.prototype.flatMap)
		completions = commands.flatMap(x => x.names);
	else
		completions = commands.reduce((x,y)=>x.concat(y.names), [])
	let hits = completions.filter(c => !c.indexOf(line));
	return [hits.length ? hits : completions, line];
}

let event_line = line =>{
	let index = handle_command(line);
	if (!index && read && !ctl.isQuestion) read.setPrompt("\x1b[31m" + main.prompt)
	else if (read && !ctl.isQuestion)read.setPrompt("\x1b[32m" + ctl.prompt)
	if (read && !ctl.isQuestion) read.prompt(!true);
}

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
			return commands[index].call(argv, "ctl");
		}
		else if (command.trim().length)
		{
			console.log("Commande not found. Type help for a list of available command");
			return (0);
		} else return (1)
	} catch (e) {
		console.log("handle_command", e);
	}

}

// process.on("SIGCONT", ()=>{
// 	console.log("on reprend ? " + process.stdin.isTTY);
// })
module.exports = {handle_command, autocompletion, event_line};
