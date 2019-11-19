console.log("Ici on est dans le client");

let socket = io.connect();
let card = null
socket.on("renvoi", (x)=>{
	console.log("recu depuis le serveur: " + x)
}).on("datas", (data)=>{
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
		                    <h4>${program.subprocess.length ? program.subprocess[0].pid : 0 || "pid"}</h4>
		                </div>
		                <div class="col">
		                    <h4>${program.subprocess.length ? program.subprocess[0].status : 0 || "running"}</h4>
		                </div>
		                <div class="col">
		                    <h4>${program.subprocess.length ? program.subprocess[0].timestamp : 0 || 0}</h4>
		                </div>
		                <div class="col">
		                    <h4>${program.count}</h4>
		                </div>
		                <div class="col">
		                    <div class="btn-group" style="display: flex;"><button class="btn btn-primary" type="button">Select fd</button><button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false" type="button"></button>
		                        <div class="dropdown-menu" role="menu"><a class="dropdown-item" role="presentation">Standard output</a>
		                            <div class="dropdown-divider" role="presentation"></div><a class="dropdown-item" role="presentation">Standard error</a></div>
		                    </div>
		                </div>
		                <div class="col">
		                    <div class="btn-group" role="group" style="display: flex;align-items: stretch;"><button class="btn btn-primary" type="button" style="width: inherit;height: inherit;">Reload</button><button class="btn btn-primary" type="button">Stop</button></div>
		                </div>
				</div>`
			card.appendChild(div);
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
