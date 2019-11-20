'use strict';

let getCustomEnv = env => env;

global.startProgram = program => {
	/*if (!(fs.stat(program.path).mode & fs.constants.S_IRWXU)){
	console.log("Missing rights to execute this command: %s", path);
	return(1);
	}*/
	console.log(`\x1b[32m ${program.command}\x1b[0m`)
	let date = new Date().toString();
	date = date.substr(0, date.indexOf(" ("))
	let child = child_process.exec(program.command, {
		cwd : "/",//program.workingDirectory,
		env : getCustomEnv(program.env),
		killSignal : program.killSignal,
		gid: process.getgid(), // a verif
		shell : "/bin/sh", // verif aussi
	}, (error, out, err)=>{
		//console.log("err: '%s'" ,err);
		//console.log("out: '%s'" ,out);
		fs.appendFileSync(program.fd.err, "[" + date + "]\n"  +  err + "\n", "utf-8");
		fs.appendFileSync(program.fd.out, "[" + date + "]\n"  +  out + "\n", "utf-8");
		//write_fd(program.fd.err, stderr);
		//write_fd(program.fd.out, stdout);
	})
	//write_fd(taskLogs, "Process spawned: " + program.name + ":" + child.pid);
	fs.appendFileSync(daemon.pidLogs, program.name + ";" + child.pid + ";" + Date.now() + "\n", "UTF-8");
	log("Process spawned: " + program.name + ":" + child.pid);
	let cls = new Process(child, Date.now(), "running");
	program.subprocess.push(cls);
	cls.startListener(program);
};

global.updateConfig = (newProgram) => {
	let oldProgram = daemon.programs[newProgram.name];
	if (shouldRestart(oldProgram, newProgram))
	{
		killChilds(oldProgram);
		launchProcess(newProgram);
		console.log("on est dans shouldrestart")
	}
	else if (oldProgram.count != newProgram.count)
	{
		console.log(oldProgram);
		if (oldProgram.count > newProgram.count)
			oldProgram.subprocess.splice(Math.max(oldProgram.subprocess.length - 2, 0), 2).forEach(process=>killPid(process.child.pid));
		else {
			let diff = Math.abs(oldProgram.count - newProgram.count)
			while (diff--)
				startProgram(newProgram);
		}
		newProgram.subprocess.push(...oldProgram.subprocess)
	}
	daemon.programs[newProgram.name] = newProgram;
}

global.shouldRestart = (oldProgram, newProgram) => {
	if (oldProgram.command != newProgram.command ||
		oldProgram.restart.toString() != newProgram.restart.toString() ||
		oldProgram.successTime != newProgram.successTime ||
		JSON.stringify(oldProgram.env) != JSON.stringify(newProgram.env) ||
		oldProgram.workingDirectory != newProgram.workingDirectory)
		return (true);
	return (false);
}

global.launchProcess = (program) => {
	for (let i = 0; i < program.count; i++)
		startProgram(program);
}

global.killChilds = (program) => {
	program.subprocess.forEach(subprocess=>{
		if (subprocess.exit == Infinity)
			return;
		console.log("here2");
		killPid(subprocess.child.pid, program.killSignal, ()=>{log("Child Process " + program.name + ";" + subprocess.child.pid + " has been killed.")});
	})
}

global.killAllChilds = () =>{
	Object.keys(daemon.programs).forEach(p => {
		let program = daemon.programs[p];
		killChilds(program);
	});
}

global.killPid = (pid, signal, callback)=>{
	signal = signal || 'SIGKILL';
	callback = callback || function() {};
	try {process.kill(pid, signal);callback();}
	catch (err) {
		log("Child couldn't be killed " + err.toString())
		callback();
	}
}

global.Process = class {
	constructor(_child, _timestamp, _status){
		this.status = _status;
		this.exit = Infinity;
		this.child = _child;
		this.timestamp = _timestamp;
		this.timestop = -1;
	}
	startListener(program) {
		this.child.on("error", (error)=>{
			log("child error: ", error);
		})
		this.child.on('exit', (code, signal) =>{
			log("Child " + "exited with " + code+ " signal: ", signal);
			this.status = signal;
			this.exit = code;
			this.timestop = Date.now();
			if (!program.expectedOutput.includes(code))
				log("The exit wasn't the one expected");
			else {
				log("The execution was successful");
			}
			//child.exit();
		})
		this.child.on('close', (code, signal) =>{
			console.log('closing code: ' + code + ": signal", signal);
		});
		this.child.stderr.on('data', function (data) {
			//console.log('child err: ' + data);
			//process.exit(1); // <<<< this works as expected and exit the process asap
		});
		this.child.stdout.on('data', function (data) {
			//console.log('child out: ' + data);
			//process.exit(1); // <<<< this works as expected and exit the process asap
		});
	}
}

// module.exports = {
// 	startProgram, Process
// }
