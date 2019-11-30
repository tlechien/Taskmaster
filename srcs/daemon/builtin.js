'use strict';

let getCustomEnv = env => env;

lobal.startProgram = (program, counter) => {
	/*if (!(fs.stat(program.path).mode & fs.constants.S_IRWXU)){
	console.log("Missing rights to execute this command: %s", path);
	return(1);
	}*/
	log("OK",`\x1b[32m ${program.command}\x1b[0m`)
	let date = new Date().toString();
	date = date.substr(0, date.indexOf(" ("))
	let child = child_process.exec(program.command, {
		cwd : "/",//program.workingDirectory,
		env : program.env,
		killSignal : program.killSignal,
		gid: process.getgid(), // a verif
		shell : "/bin/zsh", // verif aussi
	}, (error, out, err)=>{
		if (program.err){
			try {
				fs.appendFileSync(program.custom_err, "[" + date + "]\n"  +  err + "\n", "utf-8");
			} catch (e){}
		}
		if (program.out){
			try {
				fs.appendFileSync(program.custom_out, "[" + date + "]\n"  +  out + "\n", "utf-8");
			} catch (e){}
		}
	})
	//write_fd(taskLogs, "Process spawned: " + program.name + ":" + child.pid);
	fs.appendFileSync(daemon.pidLogs, program.name + ";" + child.pid + ";" + Date.now() + "\n", "UTF-8");
	log("INFO", "Process spawned: " + program.name + ":" + child.pid);
	let cls = new Process(program, child, Date.now(), counter, "running");
	program.subprocess.push(cls);
	cls.startListener(program);
};

global.updateConfig = (newProgram) => {
	console.log("on est dans update de", newProgram.name);
	let oldProgram = daemon.programs[newProgram.name];
	if (shouldRestart(oldProgram, newProgram))
	{
		killChilds(oldProgram);
		launchProcess(newProgram);
	}
	else if (oldProgram.count !== newProgram.count)
	{
		if (oldProgram.count > newProgram.count)
			oldProgram.subprocess.splice(Math.max(oldProgram.subprocess.length - 2, 0), 2).forEach(process=>killPid(process.child.pid));
		else {
			let diff = Math.abs(oldProgram.count - newProgram.count);
			while (diff--)
				startProgram(newProgram, 0);
		}
		newProgram.subprocess.push(...oldProgram.subprocess)
	}
	daemon.programs[newProgram.name] = newProgram;
};

global.shouldRestart = (oldProgram, newProgram) => {
	return oldProgram.command !== newProgram.command ||
		oldProgram.restart.toString() !== newProgram.restart.toString() ||
		oldProgram.successTime !== newProgram.successTime ||
		JSON.stringify(oldProgram.env) !== JSON.stringify(newProgram.env) ||
		oldProgram.workingDirectory !== newProgram.workingDirectory;
};

global.launchProcess = (program) => {
	for (let i = 0; i < program.count; i++)
		startProgram(program, 0);
};

global.killChilds = (program) => {
	program.subprocess.forEach(subprocess=>{
		if (subprocess.exit !== Infinity)
			return;
		killPid(subprocess.child.pid, program.killSignal, ()=>{if (subprocess.exit !== Infinity)log("Child Process " + program.name + ";" + subprocess.child.pid + " has been terminated normally.")});
		setTimeout(()=>{
			if (subprocess.exit == Infinity)
				killPid(subprocess.child.pid, 'SIGKILL', ()=>{log("Child Process " + program.name + ";" + subprocess.child.pid + " has reached terminationTime and received a SIGKILL.")})
		}, program.terminationTime)
	})
};

global.killAllChilds = () =>{
	Object.keys(daemon.programs).forEach(p => {
		let program = daemon.programs[p];
		killChilds(program);
	});
};

global.killPid = (pid, signal, callback)=>{
	signal = signal || 'SIGKILL';
	callback = callback || function() {};
	try {process.kill(pid, signal);callback();}
	catch (err) {
		log("ERROR", "Child couldn't be killed " + err.toString());
	}
};

global.Process = class {
	constructor(_parent, _child, _timestamp, _counter, _status){
		this.parent = _parent;
		this.status = _status;
		this.exit = Infinity;
		this.child = _child;
		this.counter = _counter;
		this.timestamp = _timestamp;
		this.timestop = -1;
	}
	startListener(program) {
		this.child.on("error", (error)=>{
			log("ERROR", "child error: ", error);
		});
		this.child.on('exit', (code, signal) =>{
			log("ERROR", "Child " + "exited with " + code+ " signal: ", signal);
			this.status = signal;
			this.exit = code;
			this.timestop = Date.now();
			if (!program.expectedOutput.includes(code)){
				log("ERROR", "The exit wasn't the one expected");
				if (this.counter <= this.parent.retryCount)
				startProgram(this.parent, this.counter + 1);
			}
			else {
				log("OK", "The execution was successful");
			}
			//child.exit();
		});
		this.child.on('close', (code, signal) =>{
			log("INFO", 'closing code: ' + code + ": signal", signal);
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
};

// module.exports = {
// 	startProgram, Process
// }
