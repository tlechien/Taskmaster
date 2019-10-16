'use strict';

const fs = require('fs');
const child_process = require('child_process');
let write_fd = (fd, ...arg) => {
	fs.writeSync(fd, arg.join(" "));
}

let getCustomEnv = env => env;

let startProgram = program => {
	/*if (!(fs.stat(program.path).mode & fs.constants.S_IRWXU)){
	console.log("Missing rights to execute this command: %s", path);
	return(1);
	}*/
	let child = child_process.exec(program.command, {
		cwd : program.workingDirector,
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
	child.on("error", (error)=>{
		console.log("child error: ", error);
	})
	console.log("pid: ", child.pid)
	child.on('exit', (code, signal) =>{
		console.log("Child " + "exited with" + child.signal + " signal: ", signal);
		//missing name
		if (!program.expectedOutput.includes(code))
			console.log("The exit wasn't the one expected");
		else {
			console.log("The execution was successful");
		}
		//child.exit();
	})
	child.on('close', (code, signal) =>{

		console.log('closing code: ' + code + ": signal", signal);
	});
	let cls = new Process(child, program.name, Date.now());
	program.subprocess.push(cls);
};

let killPid = (pid, signal, callback)=>{
	signal = signal || 'SIGKILL';
	callback = callback || function() {};
	try {process.kill(pid, signal)}
	catch (err) {console.log("Child couldn't be killed")}
	callback();
}

class Process {
	constructor(_child, _timestamp){
		this.child = _child;
		this.timestamp = _timestamp;
	}
}

module.exports = {
	startProgram, write_fd, Process
}
