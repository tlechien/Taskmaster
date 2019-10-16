const readline = require('readline');
const fs = require('fs');
const os = require('os');
const child_process = require('child_process');
const PATH = os.homedir();
let {
	startProgram,
	write_fd
} = require("./builtin.js");
let read = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
	prompt: "\x1B[31mTaskmaster: \x1B[0m"
});

let main = {
	isConfigurationValid: true,
	programs: [],
	suffix: ".tm.json",
	configDir: PATH + "/taskmaster"
};

class Program {
	constructor(object){
		Object.assign(this, object);
	}
	get getVariables (){
		return Object.keys(this).map(x=>this[x]);
	}
}


let checkTaskMasterDir = () => {
	try {
		fs.accessSync(main.configDir, fs.constants.R_OK | fs.constants.W_OK);
		console.log("Dossier existant");
	} catch (error) {
		if (error === "ENOENT") {
			console.log("Dossier ${PATH}/taskmaster non-existant on le crée ...");
			fs.mkdir(main.configDir, (err)=>{
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

let loadFile = file => {
	let obj = JSON.parse(fs.readFileSync(PATH + "/taskmaster/" + file, "UTF-8"));
	let program = new Program(obj);
	main.programs.push(program);
	console.log(program.name + " a été ajouté aux programmes.");

};

let loadConfiguration = () => {
	if (!main.isConfigurationValid)  return console.log("Dossier de configuration inexistant.");
	let files =  fs.readdirSync(main.configDir, "UTF-8");
	files.filter(x=>x.endsWith(main.suffix)).forEach(loadFile);
	console.log("Tous les fichiers de configuration ont été chargés")

};

checkTaskMasterDir();
loadConfiguration();

let a = child_process.exec();
a.
fs.close()
//
// fs.readFile("./default.tm.json", "UTF-8", (error, data) => {
//	 if (error) throw error;
//	 let obj = JSON.parse(data);
//	 let program = new Program(obj);
//	 console.log(program.getVariables);
//	 console.log("Chargement du fichier effectué.")
// });


//
//
// read.prompt(true);
// read.on('line', (line) =>{
//	 read.prompt(true);
// });



process.on("SIGINT", ()=>{
	console.log("SIGINT");
	process.exit(0);
});
