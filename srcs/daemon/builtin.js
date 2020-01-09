'use strict';

let getCustomEnv = env => env;

global.startProgram = (program, counter) => {
	log("OK",`${program.command}`)
	let date = new Date().toString();
	let umask = process.umask(parseInt(program.umask, 8));
	date = date.substr(0, date.indexOf(" ("))
	let child = child_process.exec(program.command, {
		cwd : program.workingDirectory,
		env : program.env,
		killSignal : program.killSignal,
		maxBuffer: 1024 ** 3,
		gid: process.getgid(), // a verif
		shell : "/bin/zsh", // verif aussi
	}, (error, out, err)=>{
		process.umask(umask);
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
	process.umask(umask);
	fs.appendFileSync(daemon.pidLogs, program.name + ";" + child.pid + ";" + Date.now() + "\n", "UTF-8");
	log("INFO", "Process spawned: " + program.name + ":" + child.pid);
	let cls = new Process(program, child, Date.now(), counter, "running");
	program.subprocess.push(cls);
	cls.startListener(program);
};

global.updateConfig = (newProgram) => {
	let oldProgram = daemon.programs[newProgram.name];
	if (shouldRestart(oldProgram, newProgram))
		killChilds(oldProgram, ()=>{launchProcess(newProgram)});
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

let shouldRestart = (oldProgram, newProgram) => {
	return !oldProgram || oldProgram.command !== newProgram.command ||
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
	program.subprocess.forEach((subprocess, index)=>{
		 if (subprocess.exit !== Infinity || !subprocess.child.pid)
		 	return;
		killPid(subprocess.child.pid, program.killSignal, ()=>{if (subprocess.exit !== Infinity)log("Child Process " + program.name + ";" + subprocess.child.pid + " has been terminated normally.")});
		console.log(program.terminationTime);
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
		log("ERROR", "Child couldn't be killed " + err.toString() + ".");
	}
};

let processExitHandler = (child, code, signal) => {
	log("ERROR", "Child " + "exited with " + code + " signal: " + signal + ".");
	let parent = child.parent;
	child.status = signal;
	child.exit = code;
	child.timestop = Date.now();
	if (daemon.mementoMori) return(log("info", `${child.pid} has been killed by the Daemon.`));
	if (!~parent.expectedOutput.indexOf(code) || !~parent.expectedOutput.indexOf(signal) || child.timestop - child.timestamp < parent.successTime) {
		if (!~parent.expectedOutput.indexOf(code))
			log("ERROR", "The exit wasn't the one expected.");
		else if (!~parent.expectedOutput.indexOf(signal))
			log("ERROR", "The signal wasn't the one expected.");
		else
			log("ERROR", "Execution time too short.")
		if (!~parent.restart.indexOf("never") && ((signal && ~parent.restart.indexOf(signal.toString())) || !~parent.expectedOutput.indexOf(code)) && child.counter < parent.retryCount)
			startProgram(parent, child.counter + 1);
	}
	else {
		log("OK", "The execution was successful.");
	}
}

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
		let success = setTimeout(() => {
			if (this.exit == Infinity)
				log("SUCCESS", `${this.parent.name}:${this.child.pid} has successfully been ran for it's successTime`);
		}, this.parent.successTime);
		this.child.on("error", (error)=>{
			log("ERROR", "child error: " + error + ".");
		});
		this.child.on('exit', (code, signal) => processExitHandler(this, code, signal));
		this.child.on('close', (code, signal) =>{
			log("INFO", 'closing code: ' + code + ": signal " + signal + ".");
		});
	}
};

// module.exports = {
// 	startProgram, Process
// }
