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
	})
	card.innerHTML = "";
	data.forEach(program=>{
		let div = document.createElement("div");
			div.setAttribute("style", "align-items: center; border: 1px solid rgba(0,0,0,.125)");
			div.className = "card-body";
			div.innerHTML =
				`<div style="align-items: center" class="row">
					<div class="col-xl-1 offset-xl-0">
		                    <h6>${program.name}</h6>
	                </div>
					<div class="col-xl-1 offset-xl-3">
						<h4>${program.count}</h4>
					</div>
	                <div class="col">
	                    <h4>${program.count == 1 ? program.subprocess.length ? program.subprocess[0].pid : "Error" : "⬇️" || "pid"}</h4>
	                </div>
	                <div class="col">
	                    <h4>${program.count == 1 ? program.subprocess.length ? program.subprocess[0].status ?  program.subprocess[0].status : "Exit: " + program.subprocess[0].exitCode: "Error" : "⬇️" || "running"}</h4>
	                </div>
	                <div class="col">
	                    <h4>${program.count == 1 ? program.subprocess.length ? convert(Date.now() - program.subprocess[0].timestamp) : "Error" : "⬇️" || NaN }</h4>
					</div>
	                <div class="col" id=${program.name}_fd>
	                    <div class="btn-group" role="group" style="display: flex;align-items: stretch;"><button class="btn btn-primary" type="button" style="width: inherit;height: inherit;">err</button><button class="btn btn-primary" type="button">out</button></div>
	                </div>
	                <div class="col" id=${program.name}_action>
	                    <div class="btn-group" role="group" style="display: flex;align-items: stretch;"><button class="btn btn-primary" type="button" style="width: inherit;height: inherit;">reload</button><button class="btn btn-primary" type="button">stop</button></div>
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
		                    <h4>${sub.status ? sub.status : "Exit: " + sub.exit}</h4>
		                </div>
		                <div class="col">
		                    <h4>${convert(Date.now() - sub.timestamp)}</h4>
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
				$(subprocess).slideToggle();
				toggleStates[program.name] = !toggleStates[program.name]
				socket.emit("senddata");
			})
			document.querySelector(`#${program.name}_fd`).addEventListener("click", function (fd){
				window.open(program.fd[fd.target.textContent]);
				socket.emit("senddata");

			})
			document.querySelector(`#${program.name}_action`).addEventListener("click", function (name){
				if (~name.target.textContent.indexOf("reload")) socket.emit("cmd", "restart", [program.name], 3);
				else if (~name.target.textContent.indexOf("stop")) socket.emit("cmd", "stop", [program.name], 2);
				socket.emit("senddata");
			})
	})
})
setInterval(()=>{
	socket.emit("senddata");
}, 10000);
