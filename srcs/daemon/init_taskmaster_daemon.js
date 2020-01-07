const Builtins = require("./builtin");

let checkTaskMasterDir = () => {
	try {
		fs.accessSync(CONFIGDIR, fs.constants.R_OK | fs.constants.W_OK);
	} catch (error) {
		if (error === "ENOENT") {
			log("INFO", "Directory ${MAINDIR} not found. Setting up a new one...");
			fs.mkdir(CONFIGDIR, (err)=>{
				if (err) log("ERROR", "Directory creation failed.");
				log("OK", "Directory has been created with success...");
			});
		} else if (error === "EACCESS") {
			log("ERROR", "Missing permissions.");
			daemon.isConfigurationValid = false;
			//Initialiser variable pour empecher les manipulations sur les fichiers de configurations
		} else {
			daemon.isConfigurationValid = false;
			log("ERROR", "Error checktaskmaster dir: " + error.toString());
		}
		log("ERROR", "Error checktaskmaster dir: " + error.code + ".");
	}
};
let onLaunchPrograms = () =>{
	Object.keys(daemon.programs).forEach(p => {
		let program = daemon.programs[p];
		if (program.execAtLaunch)
			launchProcess(program);
	});
}

let resetLogs = () =>{
	log("INFO", "Reseting pidLogs.");
	fs.writeFile(daemon.pidLogs, "", (err) =>{
		//write_fd(daemon.taskLogs, "Pid logs has been reset");
		if (err)
		{
			log("ERROR", "Cannot write pidLogs.");
			//write_fd(daemon.taskLogs, "Unable to erase Pid logs.");
			//throw
		}
	});
}

global.get_hash = (file, callback) => {
	let shasum = crypto.createHash('sha256')
	let _stream = fs.ReadStream(CONFIGDIR + file);
	_stream.on('data', (_data) => {
		shasum.update(_data);
	});
	_stream.on('end', () => {
		callback(shasum.digest('hex'))
	})
};

global.checkJSONFile = file => {
	//console.log(`${file} file + [ath ${PATH + "/taskmaster/" + file}`)
	let string = fs.readFileSync(CONFIGDIR + file, "UTF-8");
	let objet;
	try {
		objet = JSON.parse(string);
		//console.log(objet);
	} catch (e){
		return ("Checkjson " + e.toString());
	}
	if  (!objet.umask || !Boolean(parseInt(objet.umask, 8)))
		return ("Umask incorrect");
	if (!objet.command || !objet.command.length) return ("Command does not exist.");
	if (!objet.hasOwnProperty("execAtLaunch") && !objet.execAtLaunch.length) return ("ExecAtLaunch incorrect.");
	if (objet.killSignal)
	{
		let sig = ["SIGALRM", "SIGHUP", "SIGINT", "SIGKILL", "SIGPIPE", "SIGTERM", "SIGUSR1", "SIGUSR2"];
		if (!~sig.indexOf(objet.killSignal).length)
			return ("Signal incorrect");
	}
	if (!fs.existsSync(objet.workingDirectory)) return ("Unable to access workingDirectory.")
	return (1);
}

global.createProgram = (file, path) => {
	let obj = JSON.parse(fs.readFileSync(path, "UTF-8"));
	let program = new Program(obj);
	program.env = obj.env.split(",").reduce((x,y)=>{
		let obj = {};
		let arr = y.split(":");
		x[arr[0]] = arr[1]
		return x;
	}, {})
	program.name = file.substr(0, file.indexOf(daemon.suffix));
	get_hash(file, hash => {
		program.hash = hash;
	});
	if (program.err && !program.custom_err.length) program.custom_err = "logs/" + program.name + ".err"
	if (program.out && !program.custom_out.length) program.custom_out = "logs/" + program.name + ".out"
	return program;
}

global.loadFile = file => {
	let msg = "";
	if ((msg = checkJSONFile(file)) !== 1)
		return log("ERROR", file + "File format incorrect: " + msg);
	let program = createProgram(file, CONFIGDIR + file);
	daemon.programs[program.name] = program;
	log("OK", program.name + " has been added to the programs.");
};

let loadConfiguration = () => {
	if (!daemon.isConfigurationValid)  return log("ERROR", "Configuration directory missing.");
	let files =  fs.readdirSync(CONFIGDIR, "UTF-8");
	if (files.length)
	{
		files.filter(x=>x.endsWith(daemon.suffix)).forEach(loadFile);
	}
	log("OK", "All configuration files have been loaded.")

};


let init = () => {

	/*
	** Checks that taskmaster have access to ressources
	*/
	log("INFO", "Checking taskmaster directory...")
	checkTaskMasterDir();
	log("OK", "Taskmaster directory is valid.")
	/*
	** Load configuration, build objects.
	*/
	log("INFO", "Loading configurations ...")
	loadConfiguration();
	log("OK", "Configuration loaded!")
	/*
	** Reset Pid log file.
	*/
	log("INFO", "Reseting Pid logs ...")
	resetLogs();
	log("OK", "Pid logs reset done.")
	/*
	** Launch programs that should be started on launch from config.
	*/
	log("INFO", "Executing onLaunch programs ...")
	onLaunchPrograms();
	log("OK", "OnLaunch programs have all been executed.")
}

module.exports = {init};
