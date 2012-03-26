var net=require('net');
var serialPort = require("serialport").SerialPort

var monitoring=false;
var argumentsOffset=2;

if (process.argv[2]=="-monitor"){
	monitoring=true;
}

var SERIAL_PORT=process.argv[argumentsOffset];
var BAUDRATE = process.argv[argumentsOffset+1];
var PORT = process.argv[argumentsOffset+2]

var ASCII = "ASCII";

if (BAUDRATE){
	BAUDRATE = parseInt(BAUDRATE);
} else {
	BAUDRATE=9600;
}

var COPYRIGHT="Serial to TCP server.\nCopyright© 2012 by Daan Kets (Blackbit Consulting)\nLicensed under the Apache 2.0 license."

console.info(COPYRIGHT);

var serialServer = net.createServer();
// serialServer.maxConnections=1;

var currentPort;



serialServer.on("listening",function(){
	console.info("Server listening on port "+PORT+". Press Ctrl-C (SIGINT) to terminate.");
});

var connections=new Array();
var firstConnection;

connections.add=function(connection){
	if (this.contains(connection)) return false;
	this.push(connection);
	if (!firstConnection){
		first(connection);
	}
	return true;
}

function first(connection){
	firstConnection = connection;
	console.log("Setting first connection to "+connection+"…");
	if (firstConnection){		
		firstConnection.on("data",function(data){
		
			if (monitoring){
				console.log("TCP->SER: " + data);
			}
			
			currentPort.write(data,ASCII);
		})
	}
	
}

connections.contains=function(connection){
	for(var i=0; i<this.length; i++) {
		console.log("Connection found at index "+i);
        if (this[i] == connection) return i;
    }
    return null;
}

connections.remove=function(connection){
	console.log("Finding connection…");
	var index = this.contains(connection);
	if (index!=null){
		console.log("Removing connection…");
		this.splice(index,1);
		if(firstConnection == connection){
			if (this.length>=1){
				first(this[0]);				
			} else {
				first(null);
			}
		}
		console.log("Connection removed.");
		return true;
	}
	return false;
}

var	currentPort = new serialPort(SERIAL_PORT,{baudrate:BAUDRATE});	
// currentPort.setEncoding(ASCII);	
console.info("Opened serial port "+SERIAL_PORT + " with baudrate "+BAUDRATE+".");

currentPort.on("data",function(data){
	connections.forEach(function(connection){
		if (monitoring){
			console.log("SER->TCP: " + data);
		}
		try {
			connection.write(data,ASCII);
		} catch (exception){
			
		}
	});
});

currentPort.onEnd=function(){
	console.log("Serial port stream ended.");
}
currentPort.on("end",currentPort.onEnd);

currentPort.onClose=function(){
	console.log("Serial port "+SERIAL_PORT+" closed.");
	currentPort=null;
};	
currentPort.on("close",currentPort.onClose);

serialServer.on("connection",function(connection) {
	
	connection.setEncoding(ASCII);
	console.info('Incoming connection from ' + connection.remoteAddress +':' + connection.remotePort );
	connections.add(connection);
	
	connection.onClose=function(data) {
		console.log("Socket from " + this.remoteAddress+":"+this.remotePort + " closed.");
	};	
	connection.on('close',connection.onClose);
	
	connection.onEnd=function(){
		console.log("Socket stream ended.");
		var self=this;
		process.nextTick(function(){connections.remove(self)});
	};	
	connection.on("end",connection.onEnd);	
	
	connection.on("error",function(){
		console.error("Error with connection.");
	});
	
});

serialServer.on("close",function(){
	console.log("Server stopped listening.")
});

process.on('SIGINT', function () {
	console.log("Received SIGINT.");
	process.nextTick(terminate);  	
});

process.on('SIGTERM',function(){
	console.log("Received SIGTERM.");
	process.nextTick(terminate);
});

function terminate(){
	console.info("Terminating server.");
	process.exit(0);
}

serialServer.listen(PORT);
