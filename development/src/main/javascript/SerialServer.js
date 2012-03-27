/*
 * Code from serial-to-tcp server in node js.
 * Copyright© 2012 by Daan Kets (Blackbit Consulting, http://www.blackbit.be)
 * Licensed under the Apache 2.0 license.
 */

var net=require('net');
var serialport = require("serialport");
var events = require( "events" );
var util = require("util");

var SerialServer = function(pathToSerialPort, baudrate, tcpPortNumber, interface){
	// events.EventEmitter.call(this);
	
	this.baudrate=baudrate;
	this.pathToSerialPort=pathToSerialPort;
	this.tcpPortNumber=tcpPortNumber;
	this.interface=interface;
	this.connections=new Array();
	this.connections.serialServer=this;
	this.connections.first=null;
	
	this.connections.add=function(connection){
		if (this.contains(connection)) return false;
		this.push(connection);
		if (!this.first){
			this.setFirst(connection);
		}
		return true;
	}
	
	this.connections.setFirst=function(connection){
		this.first = connection;
		console.log("Setting first connection to "+connection+"…");
		if (this.first){		
			this.first.on("data",function(data){			
				this.serialServer.emit("out",data);
				this.serialServer.currentPort.write(data,ENCODING);
			})
		}
		
	}
	
	this.connections.contains=function(connection){
		for(var i=0; i<this.length; i++) {
			console.log("Connection found at index "+i);
	        if (this[i] == connection) return i;
	    }
	    return null;
	}
	
	this.connections.remove=function(connection){
		console.log("Finding connection…");
		var index = this.contains(connection);
		if (index!=null){
			console.log("Removing connection…");
			this.splice(index,1);
			if(this.first == connection){
				if (this.length>=1){
					this.setFirst(this[0]);				
				} else {
					this.setFirst(null);
				}
			}
			console.log("Connection removed.");
			return true;
		}
		return false;
	}

	this.start=function(){
		this.emit("starting");
		this.currentPort = new serialport.SerialPort(this.pathToSerialPort,{baudrate:this.baudrate});
		console.info("Opened serial port "+this.pathToSerialPort + " with baudrate "+this.baudrate+".");
		
		this.currentPort.serialServer=this;
		
		this.currentPort.onData=onSerialData;
		this.currentPort.on("data",this.currentPort.onData);
		
		this.currentPort.onEnd=function(){
			console.log("Serial port stream ended.");
		}
		this.currentPort.on("end",this.currentPort.onEnd);
		
		this.currentPort.onClose=function(){
			console.log("Serial port "+SERIAL_PORT+" closed.");
			this.serialServer.currentPort=null;
		};	
		this.currentPort.on("close",this.currentPort.onClose);

		
		this.tcpServer=net.createServer();
		this.tcpServer.serialServer = this;
		
		var self = this;
		this.tcpServer.on("listening",function(){
			console.log("TCP/ip server listening on port "+self.tcpPortNumber);
			self.emit("started");
		});		
		
		this.tcpServer.onConnection=onTCPConnection;
		this.tcpServer.on("connection",this.tcpServer.onConnection);
		
		this.tcpServer.listen(this.tcpPortNumber,this.interface);
	}
	
	this.stop=function(){
		this.emit("closing");
		this.tcpServer.on("close",function(){
			console.log("TCP/ip server stopped.");
		});
		this.tcpServer.close();
		this.emit("closed");
	}
	
}

SerialServer.prototype=new events.EventEmitter;

var ENCODING = "utf8";
var COPYRIGHT="Serial to TCP server (serialserver) 0.1.5.\nCopyright© 2012 by Daan Kets (Blackbit Consulting)\nLicensed under the Apache 2.0 license."
console.info(COPYRIGHT);
	

function onSerialData(data){
	this.serialServer.connections.forEach(function(connection){
		connection.serialServer.emit("in",data);
		try {
			connection.write(data,ENCODING);
		} catch (exception){}
	});
}

function onTCPConnection(connection) {	
	connection.setEncoding(ENCODING);
	connection.serialServer=this.serialServer;
	
	console.info('Incoming connection from ' + connection.remoteAddress +':' + connection.remotePort );
	this.serialServer.connections.add(connection);
	
	connection.onClose=function(data) {
		console.log("Socket from " + this.remoteAddress+":"+this.remotePort + " closed.");
	};	
	connection.on('close',connection.onClose);
	
	connection.onEnd=function(){
		console.log("Socket stream ended.");
		var self=this;
		process.nextTick(function(){self.serialServer.connections.remove(self)});
	};	
	connection.on("end",connection.onEnd);	
	
	connection.on("error",function(){
		console.error("Error with connection.");
	});
	
}

module.exports.SerialServer=SerialServer;