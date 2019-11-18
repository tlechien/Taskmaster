console.log("Ici on est dans le client");

let socket = io.connect();
let card = null
socket.on("renvoi", (x)=>{
	console.log("recu depuis le serveur: " + x)
}).on("datas", (data)=>{
	console.log(data, "recue de la partie daemon");
	console.log("Connecté au socket");
	card = document.querySelector(".card-body");
	data.forEach(x=>{
		let div = document.createElement("div");
			div.setAttribute("style", "align-items: center");
			div.className = "row";
			div.innerHTML =  `
			<div class="col-xl-1 offset-xl-0">
                    <h6>${x}</h6>
                </div>
                <div class="col-xl-1 offset-xl-2">
                    <h4>PID</h4>
                </div>
                <div class="col">
                    <h4>Status</h4>
                </div>
                <div class="col">
                    <h4>Timestamp</h4>
                </div>
                <div class="col">
                    <h4>Count</h4>
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
				<br>
				`
			card.appendChild(div);
	})
	socket.emit("data", "Envoi depuis le client")
})

document.onload = ()=>{console.log("page correctement chargée")}
