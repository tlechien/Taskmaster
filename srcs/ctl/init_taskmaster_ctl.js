/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init_taskmaster_ctl.js                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aben-azz <aben-azz@student.s19.be>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2019/10/23 19:28:04 by aben-azz          #+#    #+#             */
/*   Updated: 2019/11/25 12:44:41 by tlechien         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use strict";

/*
**	EXECUTION
*/
/*
** Configure reading stream
*/
global.setupRead = () => {
	global.read && global.read.close();
	global.read = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		completer: Commands.autocompletion,
		removeHistoryDuplicates: true
	});
	global.read.once("SIGINT", ()=>{
		//process.exit(1); //shouldn't exit ??
		//read.close();
	})
	global.read.once("SIGTERM", ()=>{
		//process.exit(1); //shouldn't exit ??
		//read.close();
	})
	setTimeout(()=>{
		process.stdout.write('\u001B[?25h')
		read && read.setPrompt("\x1b[32m" + ctl.prompt)
		read && read.prompt(true);
	}, 500)
	read && read.on('line', Commands.event_line);
};

let init = () => {
	ctl.socket_client = io.connect('http://localhost:5959', {reconnect: true, transports:["websocket"]});
	ctl.socket_client.on("connection_ok", ()=>{
		console.log("Connecté au socket ctl side");
		ctl.socket_client.emit("data", "Envoi depuis le ctl")
	}).on("renvoi", (x)=>{
		log("\nrecu depuis le serveur: " + x)
	}).on("infos", (infos, string) => {
		if (infos == "Error")
			console.log("\rErreur " + string + " n'existe pas.")
		else if (!~string)
			console.log("Programme(s) disponible(s): " + infos.join(" | ") + ".");
		else {
			console.log(`
	${string.toUpperCase()}
	command: ${infos.command},
	count: ${infos.count},
	execAtLaunch: ${infos.execAtLaunch},
	restart: ${infos.restart},
	expectedOutput: ${infos.expectedOutput},
	successTime: ${infos.successTime},
	retryCount: ${infos.retryCount},
	killSignal: ${infos.killSignal},
	terminationTime: ${infos.terminationTime},
	env: \n\t\t${Object.keys(infos.env).map((x, i, a)=>x + ": " + infos.env[x] + ((i == a.length - 1) ? "" : ",")).join("\n\t\t")}
	workingDirectory: ${infos.workingDirectory || "."},
	umask: ${infos.umask},
	name: ${infos.name},
	err: ${infos.err},
	out: ${infos.out},
	custom_err: ${infos.custom_err},
	custom_out: ${infos.custom_out}
			`)			//console.log(status)
		}
		read.prompt(true);
	}).on("cmd", (cmd, argv, data) => {
		let index = commands.findIndex(x=>~x.names.indexOf(cmd));
		if (~index)
			commands[index].call(argv, "ctl", data);
	});
	//console.log("init")
	/*
	** Setup stream if program is in foreground
	*/
	log("setup read ... ")
	setupRead();
	log("setup read: done")

	//startProgram(ctl.programs.atom);
	/*
	** Display the prompt and get the input.
	*/

}

module.exports = {init};
