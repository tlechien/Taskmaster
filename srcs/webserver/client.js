console.log("Ici on est dans le client");

let socket = io.connect();
let card = null
socket.on("renvoi", (x) => {
	console.log("recu depuis le serveur: " + x)
}).on("datas", (data) => {
	console.log(data, "recue de la partie daemon");
	card = document.querySelector("#processes");
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
	                    <h4>${program.count == 1 ? program.subprocess.length ? program.subprocess[0].pid : "Exited" : "⬇️" || "pid"}</h4>
	                </div>
	                <div class="col">
	                    <h4>${program.count == 1 ? program.subprocess.length ? program.subprocess[0].status : "Exited" : "⬇️" || "running"}</h4>
	                </div>
	                <div class="col">
	                    <h4>${program.count == 1 ? program.subprocess.length ? program.subprocess[0].timestamp : "Exited" : "⬇️" || NaN }</h4>
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
		                    <h4>${sub.status}</h4>
		                </div>
		                <div class="col">
		                    <h4>${sub.timestamp}</h4>
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
			program.count > 1 && card.appendChild(subprocess);
			$(subprocess).toggle(false);
			div.addEventListener("click", function(tag){
				if (program.count <= 1 || tag.target.type == "button") return
				$(subprocess).slideToggle();
			})
			document.querySelector(`#${program.name}_fd`).addEventListener("click", function (fd){
				window.open(program.fd[fd.target.textContent]);
			})
			document.querySelector(`#${program.name}_action`).addEventListener("click", function (name){
				if (~name.target.textContent.indexOf("reload")) console.log("action reload");
				else if (~name.target.textContent.indexOf("stop")) socket.emit("cmd", "stop", [program.name], 2);
			})
	})
	// data.forEach(x=>{
	// 	console.log(`
	// 	name: ${x.name},
	// 	count: ${x.count},
	// 	fd: err = ${x.fd.err}, out = ${x.fd.out}
	// 	command: ${x.command}
	// 	timestamp: ${x.subprocess.length ? x.subprocess[0].timestamp : 0 || 0},
	// 	status:  ${x.subprocess.length ? x.subprocess[0].status : 0 || "running"}
	// 	exit: ${x.subprocess.length ? x.subprocess[0].exit : 0 || "exit"}
	// 	pid: ${x.subprocess.length ? x.subprocess[0].pid : 0 || "pid"}
	// 	exitCode: ${x.subprocess.length ? x.subprocess[0].exitCode : 0 || "exitCode"}`)
	// })
})

document.onload = ()=>{console.log("page correctement chargée")}
