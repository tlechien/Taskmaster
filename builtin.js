'use strict';

let getCustomEnv = env => env;

global.startProgram = program => {
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
		e_fd(program.fd.err, stderr);
		//write_fd(program.fd.out, stdout);
	})
	fs.appendFileSync(PATH + "/taskmaster/" + ".pids", program.name + ";" + child.pid + ";" + Date.now() + "\n", "UTF-8");
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

global.killPid = (pid, signal, callback)=>{
	signal = signal || 'SIGKILL';
	callback = callback || function() {};
	try {process.kill(pid, signal)}
	catch (err) {console.log("Child couldn't be killed")}
	callback();
}

global.Process = class {
	constructor(_child, _timestamp){
		this.child = _child;
		this.timestamp = _timestamp;
	}
}

module.exports = {
	startProgram, Process
}
