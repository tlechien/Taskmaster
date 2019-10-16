const fs = require('fs');
const child_process = require('child_process');
let write_fd = (fd, ...arg) => {
    fs.writeSync(fd, arg.join(" "));
}


let startProgram = program => {
    if (!(fs.stat(program.path).mode & S_IRWXU)){
        console.log("Missing rights to execute this command: %s", path);
        return(1);
    }
    let process = child_process.exec(program.command, {
        cwd : program.workingDirector, 
        env : getCustomEnv(program.env),
        killSignal : program.killSignal,
        gid: process.getgid(), // a verif
        shell : true, // verif aussi
    }, (error, out, err)=>{
        if (err)
        write_fd(program.fd.err, stderr);
        write_fd(program.fd.out, stdout);
    });
    main.processes.push(process);
};

module.exports = {
    startProgram, write_fd
}