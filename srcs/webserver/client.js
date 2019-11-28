let socket = io.connect();
let card = null
let toggleStates = {};
let convert = function(s) {
    let ms = s % 1000;s = (s - ms) / 1000;let secs = s % 60;s = (s - secs) / 60;let mins = s % 60;let hrs = (s - mins) / 60;return (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10  ?  "0" + secs : secs)
}
socket.on("renvoi", (x) => {
	console.log("recu depuis le serveur: " + x)
}).on("connection_ok", ()=>{
	socket.emit("senddata");
}).on("datas", (data) => {
	card = document.querySelector("#processes");
	document.querySelector("#log_button").addEventListener("click", ()=>{
		window.open("logs/taskmaster_log")
	});
	document.querySelector("#refresh_button").addEventListener("click", ()=>{
		socket.emit("cmd", "fetch", [], 7);
		socket.emit("cmd", "update", [], 6);
		socket.emit("senddata");
	});
	card.innerHTML = "";
	data.forEach(program=>{
		let div = document.createElement("div");
			div.setAttribute("style", "align-items: center;");
			div.className = "card-body";
			div.innerHTML =
				`<div style="align-items: center" class="row">
					<div class="col-xl-1 offset-xl-0 tooltip_cmd">
		                    <h6>${program.name}</h6><span class="tooltiptext">${program.command}</span>
	                </div>
					<div class="col-xl-1 offset-xl-3">
						<h4>${program.count}</h4>
					</div>
	                <div class="col">
	                    <h4>${display_pid(program)}</h4>
	                </div>
	                <div class="col">
	                    ${display_status(program)}
	                </div>
	                <div class="col">
	                    <h4>${display_ts(program)}</h4>
					</div>
	                <div class="col" id=fd_${program.name}>
	                    <div class="btn-group" role="group" style="display: flex;align-items: stretch;"><button class="btn btn-primary" type="button" style="${program.err ? "" : "background-color: #dc3545;" }">err</button><button class="btn btn-primary" type="button" style="${program.out ? "" : "background-color: #dc3545;" }">out</button></div>
	                </div>
	                <div class="col" id=action_${program.name}>
	                    <div class="btn-group" role="group" style="display: flex;align-items: stretch;"><button class="btn btn-primary" type="button">reload</button><button class="btn btn-primary" type="button">stop</button></div>
	                </div>
				</div>`
			let subprocess = document.createElement("div");
				subprocess.setAttribute("style", "align-items: center; border: 1px solid rgba(0,0,0,.125)");
				subprocess.className = "card-body";
				subprocess.innerHTML = program.subprocess.map((sub, index)=>{
					return `<div style="align-items: center" class="row">
						<div class="col-xl-1 offset-xl-0">
			                 <h6>${program.name}</h6>
		                </div>
						<div class="col-xl-1 offset-xl-3">
							<h4>${index + 1}</h4>
						</div>
		                <div class="col">
		                    <h4>${sub.pid}</h4>
		                </div>
		                <div class="col">
		                    ${display_sub_status(sub, program.expectedOutput)}
		                </div>
		                <div class="col">
		                    <h4>${convert(((~sub.timestop) ? sub.timestop : Date.now()) - sub.timestamp)}</h4>
						</div>
		                <div class="col">
							<h4></h4>
		                </div>
		                <div class="col">
							<h4></h4>
		                </div>
					</div>`
				}).join("")
			card.appendChild(div);
			if (program.count > 1){
				card.appendChild(subprocess);
				toggleStates[program.name] = toggleStates[program.name] || false;
				toggleStates[program.name] || $(subprocess).toggle(false);
			}
			div.addEventListener("click", function(tag){
				if (program.count <= 1 || tag.target.type == "button") return
				$(subprocess).slideToggle("linear");
				toggleStates[program.name] = !toggleStates[program.name]
				//socket.emit("senddata");
			})
			document.querySelector(`#fd_${program.name}`).addEventListener("click", function (fd){
				console.log("custom_" + fd.target.textContent, program);
				window.open(program["custom_" + fd.target.textContent]);
				socket.emit("senddata");

			})
			document.querySelector(`#action_${program.name}`).addEventListener("click", function (name){
				if (~name.target.textContent.indexOf("reload")) socket.emit("cmd", "restart", [program.name], 3);
				else if (~name.target.textContent.indexOf("stop")) socket.emit("cmd", "stop", [program.name], 2);
				socket.emit("senddata");
			})
	})
})
setInterval(()=>{
	socket.emit("senddata");
}, 10000);

let display_pid = program=>{
	let str = "⬇️";
	if (program.count === 1)
	{
		if (str = program.subprocess.length)
			str = program.subprocess[0].pid;
		else
			str = "---";
	}
	return (str);
}

let display_status = (program)=>{
	let status = "⬇️";
	let style = "<h4>";
	if (program.count == 1)
	{
		if (program.subprocess.length)
		{
			if (program.subprocess[0].status)
			{
				style = "<h4 style='color:#00babc'>";
			 	status = program.subprocess[0].status
			}
			else if (typeof program.subprocess[0].exit != 'undefined')
			{
				status = "Exit: " + program.subprocess[0].exit;
				if (~program.expectedOutput.indexOf(program.subprocess[0].exit))
					style = "<h4 style='color:#28a745'>";
				else
					style = "<h4 style='color:#dc3545'>";
			}
			else
				status = "Error";
		}
		else
			status = "Ready";
	}
	return (style + status + "</h4>");
}

let display_sub_status = (sub, eOut)=>{
	let status = "Running";
	let style = "<h4>";
	if (sub.status)
	{
		style = "<h4 style='color:#00babc'>";
		status = sub.status;
	}
	else
	{
		status = "Exit: " + sub.exit;
		if (~eOut.indexOf(sub.exit))
			style = "<h4 style='color:#28a745'>";
		else
			style = "<h4 style='color:#dc3545'>";
	}
	return (style + status + "</h4>");
}

let display_ts = program=>{
	let str = "⬇️";
	if (program.count == 1)
	{
		if (program.subprocess.length)
		{
			if (~program.subprocess[0].timestop)
				str = convert(program.subprocess[0].timestop - program.subprocess[0].timestamp);
			else
				str = convert(Date.now() - program.subprocess[0].timestamp)
		}
		else
			str = "---";
	}
	return (str);
}
