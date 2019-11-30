let socket = io.connect();

socket.on("connection_ok", ()=>{
	socket.emit("pls_log");
}).on("sendlog", logs=>{
	let div = document.querySelector("#logs");
	div.innerHTML = logs.map(element=>{
		let color;
		let timestamp = element.substr(0, element.indexOf("->"));
		element = element.substr(element.indexOf("->") + 4);
		console.log(`${timestamp} '${element}'`)
		if (!element.indexOf("SUCCESS")) {
			element = element.substr(7)
			color = '#28a745';
		} else if (!element.indexOf("INFO")){
			element = element.substr(4)
			color = '#00babc';
		} else if (!element.indexOf("WARNING")){
			element = element.substr(7)
			color = '#ff9d00'
		} else if (!element.indexOf("ERROR")) {
			element = element.substr(5)
			color = '#dc3545';
		}
		return `<div style="color: white">${timestamp}</div><div style="color:${color}">-> ` + element + `</div>`
	}).join("\n")
})

console.log("chargé")
