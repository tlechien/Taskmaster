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
		//write_fd(program.fd.err, stderr);
		//write_fd(program.fd.out, stdout);
	})
	fs.appendFileSync(main.pidLogs, program.name + ";" + child.pid + ";" + Date.now() + "\n", "UTF-8");
	//write_fd(taskLogs, "Process spawned: " + program.name + ":" + child.pid);
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
	let cls = new Process(child, Date.now());
	program.subprocess.push(cls);
};

global.onLaunchPrograms = () =>{
	Object.keys(main.programs).forEach(p => {
		let program = main.programs[p];
		if (program.execAtLaunch)
			for (let i = 0; i < program.count; i++)
				startProgram(program);
	});
}

global.resetLogs = () =>{
	fs.writeFile(main.pidLogs, "", (err) =>{
		//write_fd(main.taskLogs, "Pid logs has been reset");
		if (err)
		{
			//write_fd(main.taskLogs, "Unable to erase Pid logs.");
			throw error ()
		}
	});
}

global.killChilds = () =>{
	Object.keys(main.programs).forEach(p => {
		let program = main.programs[p];
			program.subprocess.forEach(subprocess=>killPid(subprocess.child.pid, program.killSignal, ()=>{
				console.log(main.taskLogs, "Child Process " + program.name + ";" + subprocess.child.pid + " has been killed.")
				//write_fd(prog.redirect.err, "Program killed");
				//write_fd(main.taskLogs, "Child Process " + prog.name + ";" + pid + " has been killed.");
			}))
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
	constructor(_child, _timestamp){
		this.child = _child;
		this.timestamp = _timestamp;
	}
}

// module.exports = {
// 	startProgram, Process
// }
