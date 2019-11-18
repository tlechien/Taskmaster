/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   init_taskmaster_ctl.js                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aben-azz <aben-azz@student.s19.be>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2019/10/23 19:28:04 by aben-azz          #+#    #+#             */
/*   Updated: 2019/11/18 22:50:34 by tlechien         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use strict";

/*
**	EXECUTION
*/
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
	ctl.socket_client = io.connect('http://localhost:5959', {reconnect: true, transports:["websocket"]});
	ctl.socket_client.on("connection_ok", ()=>{
		console.log("Connecté au socket ctl side");
		ctl.socket_client.emit("data", "Envoi depuis le ctl")
	}).on("renvoi", (x)=>{
		log("\nrecu depuis le serveur: " + x)
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
	setTimeout(()=>{
		read && read.setPrompt("\x1b[32m" + ctl.prompt)
		read && read.prompt(true);
	}, 500)
	read && read.on('line', Commands.event_line);
}

module.exports = {init}
