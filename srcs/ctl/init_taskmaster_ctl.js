/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init_taskmaster_ctl.js                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aben-azz <aben-azz@student.s19.be>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2019/10/23 19:28:04 by aben-azz          #+#    #+#             */
/*   Updated: 2019/11/27 20:42:25 by aben-azz         ###   ########.fr       */
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
		if (!ctl.isQuestion) process.exit(1);
		//read.close();
	})
	global.read.once("SIGTERM", ()=>{
		if (!ctl.isQuestion) process.exit(1); //shouldn't exit ??
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
		console.log("\rConnecté au socket ctl side");
		read.prompt(true);
		ctl.socket_client.emit("data", "Envoi depuis le ctl")
	}).on("renvoi", (x)=>{
		log("\nrecu depuis le serveur: " + x)
	}).on("cmd", (cmd, argv, data)=>{
		let index = commands.findIndex(x=>~x.names.indexOf(cmd));
		if (~index)
			commands[index].call(argv, "ctl", data);
	}).on("out", (string)=>{
		antiprompt(string);
		read.prompt(true);
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
