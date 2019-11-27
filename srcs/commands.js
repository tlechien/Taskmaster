"use strict";
const fs = require("fs");
global.antiprompt = str => console.log("\r" + str + " ".repeat(process.stdout.columns - str.length));
global.commands = [
	{
		names: ["help", "h"],
		usage: "Lists commands.\n\thelp {command}",
		call: (argv, side, socket) => {
			void socket;
			if (side === "ctl"){
				if (!argv.length){
					let cmd = commands.map(x=>"[" + x.names.join(" | ") + "]: " + x.usage);
					console.log("Available commands:\n" + cmd.join("\n"));
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
						console.log(argv[0] + " not found. Available commands:\n" + cmd.join("\n"));
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
			 return console.log("Usage: info [command]\nType info [--l|-list] to get the list of the programs.");
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
				if (argv[0] === "Error")
					console.log("\rError " + argv[0] + " doesn't exist.");
				else if (!~argv[0])
					console.log("Available program(s): " + data.join(" | ") + ".");
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
					\r\tenv: \n\t\t${Object.keys(data.env).map((x, i, a)=>x + ": " + data.env[x] + ((i === a.length - 1) ? "" : ",")).join("\n\t\t")}
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
		usage: "Stop a program.\n\tstop",
		call: (argv, side, data) => {
			void data;
			if (side === "daemon")
			{
				if (!argv.length)
					return console.log("It doesn't work.");
				console.log("Stopping", argv[0] + ".");
				let index = Object.keys(daemon.programs).findIndex(x=>{
					return ~x.toLowerCase().indexOf(argv[0].toLowerCase())
				});
				if (!~index)	console.log("Command not found: %s", argv[0] + ".");
				else killChilds(daemon.programs[Object.keys(daemon.programs)[index]]);
			}
			return true;
		}
	}, {
		names: ["restart", "re"],
		usage: "Restart a program.\n\trestart [program]",
		call: (argv, side, data) => {
			void side; void data;
			if (!argv.length)
				return console.log("It doesn't work.");
			console.log("Restarting", argv[0] + ".");
			let index = Object.keys(daemon.programs).findIndex(x=>{
				return ~x.toLowerCase().indexOf(argv[0].toLowerCase())
			});
			if (!~index) console.log("Command not found: %s", argv[0] + ".");
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
		usage: "Print the status of a program.\n\tstatus [program]",
		call: (argv, side, data) => {
			if (side === "ctl" && !data && !argv.length)
				return console.log("Usage: status [command]\nType status [--l|-list] to get the list of commands.");
			else if (side === "ctl" && data){
				if (data === "Error")
					console.log("\rError: " + argv[0] + " doesn't exist.");
				else if (!~argv[0])
					console.log("Available program(s): " + data.join(" | ") + ".");
				else {
					if (!data.length)
						console.log(argv[0] + " hasn't been executed.");
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
					console.log("\rError: " + argv[0] + " doesn't exist.");
				else if (argv[2] === -2)
					console.log("\rPlease choose between 'out' and 'err'.");
				else {
					let str;
					if (argv[2] === "") str = LOGDIR  + argv[0] + "." + argv[1];
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
			if (side === "daemon"){
				if (!daemon.fetches.length)
					data.emit("out", "The fetch list is empty, please use 'fetch' first.");
				else if (~argv.indexOf("-l") || ~argv.indexOf("-list")){
					data.emit("out", "Fetch(es): "  + daemon.fetches.programs.name.join(" | ") + ".")
				} else if (!argv.length){
					daemon.fetches.forEach(program=>{
						updateConfig(program);
						console.log(program.name + " has been updated.");
						data.emit("out", program.name + " has been updated.");
					});
					daemon.fetches = [];
				} else {
					argv.forEach(x=>{
						if (~daemon.fetches.programs.indexOf(x))
						{
							daemon.fetches.splice(daemon.fetches.indexOf(x), 1);
							data.emit("out", x + " has been fetch alone.");
						}
						else
							data.emit("out", x + " doesn't appear in the fetch list.");
					})
				}
			}
			return true;
		}
	}, {
		names: ["fetch", "f"],
		usage: "Fetch configurations files.\n\tfetch",
		call: (argv, side, data) => {
			if (side === "daemon"){
				let files =  fs.readdirSync(CONFIGDIR, "UTF-8");
				files.filter(x=>x.endsWith(daemon.suffix)).forEach((x, y, arr)=>{
					let name = x.substr(0, x.indexOf(daemon.suffix))
					if (!daemon.programs[name])
					{
						if (checkJSONFile(x) !== 1)
							data.emit("out", "Bad JSON found: " + name + ".");
						else if (!~daemon.fetches.map(x => x.name).indexOf(name))
							daemon.fetches.push(createProgram(x, CONFIGDIR + x));
						else data.emit("out", "New file found: " + name + ".");
					} else {
						let hash = get_hash(x, (hash)=>{
							if (hash !== daemon.programs[name].hash)
							{
								if (!~daemon.fetches.map(x => x.name).indexOf(name))
									daemon.fetches.push(createProgram(x, CONFIGDIR + x));
								data.emit("out", name + " has been modified.")
							}
							if (y === arr.length - 1 && !daemon.fetches.length)
								data.emit("out", "Nothing to fetch.");
						})
					}
				});
			}
			return true;
		}
	}, {
		names: ["create", "c"],
		usage: "Create configurations files.\n\tcreate",
		call: (argv, side, data) => {
			void data;
			if (side === "ctl"){
				ctl.isQuestion = true;
				return Question.file_creation();
			}
		}
	}, {
		names: ["clear", "clr", "cl"],
		usage: "Clear logs files.\n\tclear program program2 ...",
		call: (argv, side, data) => {
			if (side === "ctl" && data) {
				if (!argv.length){
					console.log("\rUsage: clear [programs...].");
					read.prompt(true);
					return false;
				} else {
					if (!data.length){
						console.log("\rAucun resultat trouvé pour les programmes.");
						read.prompt(true);
						return ;
					}
					if (data.length !== argv.length){
						let exceptions = argv.filter(x=>!~data.map(x=>x.name).indexOf(x));
						console.log("\rLe(s) programme(s) suivant(s) n'ont pas été trouvé(s) : " + exceptions.join(", ") + ".");
					}
					data.forEach(prog => {
						fs.existsSync(prog.custom_out) && fs.writeFileSync(prog.custom_out, "", "utf-8");
						fs.existsSync(prog.custom_err) && fs.writeFileSync(prog.custom_err, "", "utf-8");
						console.log("\r", prog.custom_out + " et " + prog.custom_err + " ont bien été supprimés.");
					});
					read.prompt(true);
				}
			} else if (side === "daemon"){
				let program_names = Object.keys(daemon.programs).map(x=>daemon.programs[x]);
				data.emit("cmd", "clear", argv, program_names.filter(x=>~argv.indexOf(x.name)));
			}
			return true;
		}
	}, {
		names: ["quit", "q"],
		usage: "Close taskmaster.\n\tquit",
		call: (argv, side, data) => {
			if (side === "ctl")
				log("Closing taskmaster ...");
			else {
				killAllChilds();
				log("End of daemon session.");
			}
			process.exit(0);
			return true;
		}
	}, {
		names: ["exit", "background", "bg"],
		usage: "Exit and send taskmaster in background.\n\tbg",
		call: (argv, side, data) => {
			void data;
			if (side === "ctl")
				process.exit(0);
		}
	}, {
		names: ["debug", "dbg"],
		usage: "Show logs of taskmaster.\n\tdebug",
		call: (argv, side, data) => {
			void data;
			if (side === "ctl"){
				child_process.spawnSync("more", [LOGDIR + "taskmaster_log"], {stdio: "inherit"});
			}
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
