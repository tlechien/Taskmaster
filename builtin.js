'use strict';

let getCustomEnv = env => env;

global.startProgram = program => {
	/*if (!(fs.stat(program.path).mode & fs.constants.S_IRWXU)){
	console.log("Missing rights to execute this command: %s", path);
	return(1);
	}*/
	console.log(`\x1b[32m ${program.command}\x1b[0m`)
		read.pause();
	let child = child_process.exec(program.command, {
		cwd : program.workingDirectory,
		env : getCustomEnv(program.env),
		killSignal : program.killSignal,
		gid: process.getgid(), // a verif
		shell : true, // verif aussi
	}, (error, out, err)=>{
		if (err)
		console.log("err: '%s'" ,err);
		console.log("out: '%s'" ,out);
		//write_fd(program.fd.err, stderr);
		//write_fd(program.fd.out, stdout);
	})
	//write_fd(taskLogs, "Process spawned: " + program.name + ":" + child.pid);
	fs.appendFileSync(main.pidLogs, program.name + ";" + child.pid + ";" + Date.now() + "\n", "UTF-8");
	console.log("Process spawned: " + program.name + ":" + child.pid);
	let cls = new Process(child, Date.now(), "running");
	program.subprocess.push(cls);
	cls.startListener(program);
	read.resume();
};

global.updateConfig = (newProgram) => {
	let oldProgram = main.programs[newProgram.name];
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
	main.programs[newProgram.name] = newProgram;
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

global.onLaunchPrograms = () =>{
	Object.keys(main.programs).forEach(p => {
		let program = main.programs[p];
		if (program.execAtLaunch)
			launchProcess(program);
	});
}

global.resetLogs = () =>{
	console.log("reseting pidLogs");
	fs.writeFile(main.pidLogs, "", (err) =>{
		//write_fd(main.taskLogs, "Pid logs has been reset");
		if (err)
		{
			console.log("err pidLogs");
			//write_fd(main.taskLogs, "Unable to erase Pid logs.");
			throw error ()
		}
	});
}

global.killChilds = (program) => {
	program.subprocess.forEach(subprocess=>killPid(subprocess.child.pid, program.killSignal, ()=>{
		console.log(main.taskLogs, "Child Process " + program.name + ";" + subprocess.child.pid + " has been killed.")
		//write_fd(prog.redirect.err, "Program killed");
		//write_fd(main.taskLogs, "Child Process " + prog.name + ";" + pid + " has been killed.");
		}))
}

global.killAllChilds = () =>{
	Object.keys(main.programs).forEach(p => {
		let program = main.programs[p];
		killChilds(program);
	});
}

global.killPid = (pid, signal, callback)=>{
	signal = signal || 'SIGKILL';
	callback = callback || function() {};
	try {process.kill(pid, signal)}
	catch (err) {console.log("Child couldn't be killed " + err.toString())}
	callback();
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
		 	console.log("IM HERE - Error");
		 	console.log('test: ' + data);
		 	//process.exit(1); // <<<< this works as expected and exit the process asap
		 });
	}
}

// module.exports = {
// 	startProgram, Process
// }
