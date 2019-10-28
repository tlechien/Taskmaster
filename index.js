// const tty = require('tty');
// const fs = require("fs")
// setInterval(()=>{
// 	}, 5000);
// let a = Object.keys(process);
// //console.log(process)
// //console.log(tty.isatty(1))
// process.on("SIGTTIN", ()=>{
// 	fs.appendFile("ok.log", "xd c en ttn\n", "UTF-8")
// })
// process.stdin.on('readable', () => {
// 	fs.appendFile("ok.log", "xd c en  read\n", "UTF-8")
// });
// fs.readFile("/dev/tty", (e, d)=>{
// 	if (e) fs.appendFile("ok.log", "error " + e.toString() + "\n", "UTF-8")
// 	else fs.appendFile("ok.log", "data " + d.toString() + "\n", "UTF-8")
//
// })

// global.readline = require('readline');
// let setupRead = () => {
// 	global.read = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout,
// 		terminal: true,
// 		completer: false,
// 		removeHistoryDuplicates: true
// 	});
// };
//
// let questions = [
// 	"Quel sera le nom du programme ?",
// 	"Quelle sera la commande lancée au demarrage du programme? ",
// 	"Combien de fois la commande doit-elle etre executée ?",
// 	"Doit-elle s'executer au demarrage de taskmaster ? (y)es|(o)ui/(n)o|(n)on",
// 	"Quand doit-elle redemarrer ? ((a)lways/(n)ever/(s)ignal)",
// 	"Quelles-sont les sorties attendues ? Exemple: '0, -1, 127'",
// 	"A partir de combien de ms le programme est considéré comme bien executé ?",
// 	"Combien de tentative de lancement du programmes taskmaster devra faire ?",
// 	"Quel signal sera utilisé pour kill le programme ?",
// 	"A partir de combien de ms le programme doit terminer ?",
// 	"Quelle sera le fichier d'ecriture de la sortie d'erreur ?",
// 	"Quelle sera le fichier d'ecriture de la sortie standard ?",
// 	"Quelles variables d'environnement doivent etre mise au lancement ? Exemple: 'FCEDIT=\"atom -- wait\"'",
// 	"Quelle est le dossier dans lequel le programme doit-il s'executer ?",
// 	"Quelle sera l'umask ?"
// ]
//
// let question = (program, id) => {
// 	read.question(questions[id] + "\n", answer=>{
// 		//if (answer.length == 0)
// 		//	return (recal);
// 		if (questions[id + 1])
// 			question(program, id + 1);
// 		else {
// 			console.log("fin");
// 			read.close();
// 		}
//
// 	});
// }
// let newProgram = {
// 	"command": "",
// 	"count": 1,
// 	"execAtLaunch": true,
// 	"restart": ["always"],
// 	"expectedOutput": [0],
// 	"successTime": 1000,
// 	"retryCount": 3,
// 	"killSignal": "SIGINT",
// 	"terminationTime": 30000,
// 	"redirect": {
// 		"err": "default",
// 		"out": "default"
// 	},
// 	"env": {
// 		"key": "value"
// 	},
// 	"workingDirectory": "",
// 	"umask": "0755"
// }
// setupRead();
// question(newProgram, 0);


let test = "Ceci/est/un/test/sur/un/path"

console.log(test.substr(test.lastIndexOf("/")));
