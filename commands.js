"use strict";
let commands = [
	{
		names: ["help", "h"],
		usage: "Lists commands.\n\thelp {command}",
		call: (argv) => {
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
	}, {
		names: ["tail", "t", "log", "l"],
		usage: "Display log file.\n\ttail program [out|err]",
		call: (argv) => {
			console.log("Tail program log ...");
			return (true);
		}
	}, {
		names: ["update", "u"],
		usage: "Update configurations files.\n\tupdate",
		call: (argv) => {
			return loadConfiguration();
		}
	}, {
		names: ["fetch", "f"],
		usage: "Fetch configurations files.\n\tfetch",
		call: (argv) => {
			console.log("fetching ...");
			return (true);
		}
	}, {
		names: ["create", "c"],
		usage: "Create configurations files.\n\tcreate",
		call: (argv) => {
			console.log("Creating configuration file ...");
			return (true);
		}
	}, {
		names: ["clear", "clr", "cl"],
		usage: "Clear logs files.\n\tclear program program2 ...",
		call: (argv) => {
			console.log("Clear program log files...");
			return (true);
		}
	}, {
		names: ["clearall"],
		usage: "Clear all logs files.\n\tclearall",
		call: (argv) => {
			console.log("Creating call log files ...");
			return (true);
		}
	}, {
		names: ["startserver", "ss"],
		usage: "Start server manager.\n\tstartserver",
		call: (argv) => {
			console.log("Starting server ...");
			return (true);
		},
	}, {
		names: ["quit", "q"],
		usage: "Close taskmaster.\n\tquit",
		call: (argv) => {
			console.log("Closing taskmaster ...");
			process.exit(0);
			return (true);
		}
	}, {
		names: ["exit", "background", "bg"],
		usage: "Exit and send taskmaster in background.\n\tbg",
		call: (argv) => {
			child_process.spawn(main.configDir + "/run.sh", [process.pid], {detach : true, stdio:[0,1,2]});
			read && read.close();
			process.kill(process.pid, "SIGTSTP");
			read = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
				terminal: true,
				completer: autocompletion,
				removeHistoryDuplicates: true
			});
			read && read.prompt(true);
			read.on('line', event_line);
			return (1);
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
	if (!index && read) read.setPrompt("\x1b[31m" + main.prompt)
	else if (read)read.setPrompt("\x1b[32m" + main.prompt)
	if (read) read.prompt(!true);
}

let handle_command = command => {
	let cmds = command.split(" ");
	command = cmds[0];
	let argv = cmds.slice(1);
	let index = commands.findIndex(x=>~x.names.indexOf(command));
	try {
		if (~index) return commands[index].call(argv);
		else if (command.trim().length)
		{
			console.log("Commande not found. Type help for a list of available command");
			return (0);
		} else return (1)
	} catch (e) {
		console.log("handle_command", e);
	}

}


process.on("SIGCONT", ()=>{
	console.log("on reprend ? " + process.stdin.isTTY);
})
module.exports = {handle_command, autocompletion, event_line};
