const tty = require('tty');
const fs = require("fs")
setInterval(()=>{
	}, 5000);
let a = Object.keys(process);
//console.log(process)
//console.log(tty.isatty(1))
process.on("SIGTTIN", ()=>{
	fs.appendFile("ok.log", "xd c en ttn\n", "UTF-8")
})
process.stdin.on('readable', () => {
	fs.appendFile("ok.log", "xd c en  read\n", "UTF-8")
});
fs.readFile("/dev/tty", (e, d)=>{
	if (e) fs.appendFile("ok.log", "error " + e.toString() + "\n", "UTF-8")
	else fs.appendFile("ok.log", "data " + d.toString() + "\n", "UTF-8")

})
