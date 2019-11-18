'use strict';

let getCustomEnv = env => env;

global.startProgram = program => {
	console.log("startprogram ", program);
	/*if (!(fs.stat(program.path).mode & fs.constants.S_IRWXU)){
	console.log("Missing rights to execute this command: %s", path);
	return(1);
	}*/
	console.log(`\x1b[32m ${program.command}\x1b[0m`)
	let child = child_process.exec(program.command, {
		cwd : "/",//program.workingDirectory,
		env : getCustomEnv(program.env),
		killSignal : program.killSignal[0],
		gid: process.getgid(), // a verif
		shell : "/bin/sh", // verif aussi
	}, (error, out, err)=>{
		if (err)
		//console.log("err: '%s'" ,err);
		//console.log("out: '%s'" ,out);
		fs.writeFileSync(program.fd.err, err, "utf-8");
		fs.writeFileSync(program.fd.out, out, "utf-8");
		//write_fd(program.fd.err, stderr);
		//write_fd(program.fd.out, stdout);
	})
	//write_fd(taskLogs, "Process spawned: " + program.name + ":" + child.pid);
	fs.appendFileSync(daemon.pidLogs, program.name + ";" + child.pid + ";" + Date.now() + "\n", "UTF-8");
	console.log("Process spawned: " + program.name + ":" + child.pid);
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
	console.log(oldProgram.command != newProgram.command);
	console.log(oldProgram.restart != newProgram.restart);
	console.log(oldProgram.successTime != newProgram.successTime);
	console.log(oldProgram.env != newProgram.env);
	console.log(oldProgram.workingDirectory != newProgram.workingDirectory);
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
	program.subprocess.forEach(subprocess=>killPid(subprocess.child.pid, program.killSignal, ()=>{
		//console.log(daemon.taskLogs, "Child Process " + program.name + ";" + subprocess.child.pid + " has been killed.")
			log("Child Process " + program.name + ";" + subprocess.child.pid + " has been killed.")
			console.log("program ", program);
			fs.writeFileSync(program.fd.err, "Program killed", "utf-8");
		}))
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
		console.log("Child couldn't be killed " + err.toString())
		log("Child couldn't be killed " + err.toString())
		callback();
	}
}

global.Process = class {
	constructor(_child, _timestamp, _status){
		this.status = _status;
		this.child = _child;
		this.timestamp = _timestamp;
	}
	startListener(program) {
		this.child.on("error", (error)=>{
			console.log("child error: ", error);
		})
		this.child.on('exit', (code, signal) =>{
			console.log("Child " + "exited with " + code+ " signal: ", signal);
			log("Child " + "exited with " + code+ " signal: ", signal);
			this.status = signal;
			//missing name
			if (!program.expectedOutput.includes(code))
				console.log("The exit wasn't the one expected");
			else {
				console.log("The execution was successful");
			}
			//child.exit();
		})
		this.child.on('close', (code, signal) =>{
			console.log('closing code: ' + code + ": signal", signal);
		});
		this.child.stderr.on('data', function (data) {
			console.log('child err: ' + data);
			//process.exit(1); // <<<< this works as expected and exit the process asap
		});
		this.child.stdout.on('data', function (data) {
			console.log('child out: ' + data);
			//process.exit(1); // <<<< this works as expected and exit the process asap
		});
	}
}

// module.exports = {
// 	startProgram, Process
// }
