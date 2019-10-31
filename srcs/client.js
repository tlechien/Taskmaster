console.log("Ici on est dans le client");

let socket = io.connect();

socket.on("connection_ok", ()=>{
	console.log("Connecté au socket");
	socket.emit("data", "Envoi depuis le client")
});
