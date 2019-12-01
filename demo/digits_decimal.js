let log = (type = "INFO", message) => {
	let date = new Date().toString();
	date = date.substr(0, date.indexOf(" ("))
	let msg = "[" + date + "]\n-> ";
	msg += {WARNING: "\x1b[33m⚠️", ERROR: "\x1b[31m❌", OK: "\x1b[32m✅", INFO: "\x1b[36mℹ️", "": "\x1b[36mℹ️"}[type.toUpperCase()] || "\x1b[36mℹ️";
	msg += "  " + message;
	console.log(msg + "\x1b[0m");
}
log("salut cest un message sans riem");
log("JHKJ", "salut cest un message truc ki exist pa");
log("INFO", "salut cest un message avec info");
log("ERROR", "salut cest un message avec error");
log("error", "salut cest un message avec error min");
log("WARNING", "salut cest un message avec un warning")
log("OK", "salut cest un message avec un ok")
