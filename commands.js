"use strict";

let commands = [
	{
		names: ["help", "h"],
		usage: "Lists commands",
		call: (argv) => {
			if (!argv.length){
				let cmd = commands.map(x=>"[" + x.names.join("|") + "]: " + x.usage);
				console.log("Commandes disponibles:\n" + cmd.join("\n"));
			} else {
				let index = commands.findIndex(x=>~x.names.indexOf(argv[0]));
				if (~index)
				{
					let cmd = commands[index];
					console.log("[" + cmd.names.join("|") + "]: " + cmd.usage);
				}
				else
				{
					let cmd = commands.map(x=>"[" + x.names.join("|") + "]: " + x.usage);
					console.log(argv[0] + " not found. Commandes disponibles:\n" + cmd.join("\n"));
				}
			}
		}
	}, {
		names: ["exit"],
		usage: "Exit taskmaster's shell",
		call: (argv) => {
			process.exit(0);
		}
	}, {
		names: ["update", "ud"],
		usage: "Update configurations files",
		call: (argv) => {
			loadConfiguration();
		}
	}
]


let	handle_command = command => {
	let cmds = command.split(" ");
	command = cmds[0];
	let argv = cmds.slice(1);
	let index = commands.findIndex(x=>~x.names.indexOf(command));
	if (~index)
		commands[index].call(argv);
	else
		console.log("Commande not found. Type help for a list of available command");
}

module.exports = {handle_command};
