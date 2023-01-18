// rdmap.dev:8801/chat Web Server 
// Contact: business@rdmap.dev
// Last Updated: 12/5/2022
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 8801; // set to 8801 to obscure app development

var messageLogFile = require("./logs/chat-log.json");
var numberOfMessages = 40;
//const messageLogFile = fs.readFileSync("./logs/chat-log.json");

// API Middleware (A.K.A. Death to CORS) 
// Updated 2022-12-22
app.use(function (req, res, next) {

	express.json();

	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next(); // Why is this necessary???
});
app.use(express.json());
app.use(cors());
app.options('*', cors());
// --end of middleware

app.use(express.static('content')); // open up content folder to outside world

// HTTP Routes
app.get("/chat", (req, res) => {
	console.log("--USER GET /chat");
	res.sendFile("./content/roadmap-chat-client/chat.html");
});

app.get("/chat/log", (req, res) => {
	console.log("--USER GET /chat/log");
	res.status(200).json(messageLogFile);
});

app.get("/chat/log/numberof", (req, res) => {
	res.status(200).send({ "number": numberOfMessages });
})

app.post("/chat/submit", (req, res) => {
	console.log("--USER POST /chat/submit");
	console.log("--DEVELOPMENT REQUEST INFO: " + req.ip); // for development
	
	const { username } = req.body;
	const { content } = req.body;
	// Get complte message object for writing to database.
	const body = req.body;
	console.log(body);

	// Check for no content
	if (!content) {
		res.status(400).send({ message: "--ROADMAP CHAT SERVER: 400 NO CONTENT" });
		console.log("--USER POST (previous): NO CONTENT");
	}

	res.send({
		message: "--ROADMAP CHAT SERVER: 200 MESSAGE RECEIVED",
	});

	// CHECK MESSAGE & USERNAME LENGTH
	if (content.length > 150 || username.length > 20) {
		console.log(username, " POST SIZE = ", content.length, " DENIED");
	}
	else if (content.length <= 150 || username.length <= 20) {	
        	console.log(username, " POST SIZE = ", content.length, " ACCEPTED");

        	// WRITE TO MESSAGELOGFILE JSON DB FILE
        	console.log("--WRITING TO: chat-log.json");
        	// 1. Read chatlog file, load into memory as json
        	fs.readFile("./logs/chat-log.json", function (err, data) {
                	var json = JSON.parse(data);
                	// 1.1. Write New Length to track messages on client-side
                	numberOfMessages++;
                	// 2. push to messages body
                	json.push(body);
                	// 3. write changes to file and sync to make it immediately available
                	fs.writeFileSync("./logs/chat-log.json", JSON.stringify(json));
                	// 4. Reload Log File into memory
                	delete require.cache[require.resolve("./logs/chat-log.json")];
                	messageLogFile = require("./logs/chat-log.json");
                	console.log("--CHANGES WRITTEN & LOG FILE RELOADED");
        	});
	}
});
// END OF HTTP ROUTES


// Main
app.listen(port, function(err){ 
	if (err) console.log("The server has encountered a runtime error. Please restart.")
	console.log("rdmap.dev/chat server version 0.1.0b - 139.177.195.118:8801/chat");
	console.log("THIS IS DEVELOPMENT SOFTWARE AND COMES WITH ABSOLUTELY NO WARRANTY.");
	console.log("Available resources: /chat, /chat/log, /chat/log/numberof, /chat/submit");
})

