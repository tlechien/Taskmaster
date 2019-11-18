console.log("Ici on est dans le client");

let socket = io.connect();

socket.on("connection_ok", ()=>{
	console.log("Connecté au socket");
	socket.emit("data", "Envoi depuis le client")
}).on("renvoi", (x)=>{
	console.log("recu depuis le serveur: " + x)
}).on("datas", (data)=>{
	console.log(data, "recue de la partie daemon");
})
