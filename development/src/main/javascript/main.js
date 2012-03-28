/*
 * Code from serial-to-tcp server in node js.
 * Copyright© 2012 by Daan Kets (Blackbit Consulting, http://www.blackbit.be)
 * Licensed under the Apache 2.0 license.
 */

var serialserver=require("./serialserver.js");
var asciistrings=require("./asciistrings.js");
var commandline=require("node-commandline");

var commandLine=new commandline.CommandLine(process.argv,["serialPort","baudrate","tcpPortNumber","interface"]);

if (commandLine.orderedArguments.length<3 || commandLine.help){
	console.info("Usage:");
	console.info("  serialserver [-help] [-monitor] [-debug] [-noExpansion] <pathToSerialPort> <baudrate> <tcpPortNumber> [<interface>]");
	console.info("  - option names are case sensitive.");
	console.info("  - options may be out of order.");
	process.exit(0);
}

if (commandLine.debug) console.info(JSON.stringify(commandLine));

/*
 * Parse or initialize the baudrate.
 */
var baudrate = parseInt(commandLine.baudrate);

/*
 * Create an instance of the serial server.
 */
var server = new serialserver.SerialServer(commandLine.serialPort, baudrate, commandLine.tcpPortNumber, commandLine.interface);

/**
 * Log when the server is started.
 */
server.on("started",function(){
	console.info("Serial server started.");
	console.info("Press ctrl-C in order to terminate.");
});

/**
 * Log when the server stopped.
 */
server.on("stopped",function(){
	console.info("Serial server stopped.");
});

/*
 * Enable monitoring handlers if the -monitor argument was specified.
 */
if (commandLine.monitor){
	server.on("in",function(data){
		if (commandLine.noExpansion){
			console.info("IN : "+data.toString("utf8"));
		} else {
			console.info("IN : "+asciistrings.expand(data.toString("utf8")));
		}
	});

	server.on("out",function(data){
		if (commandLine.noExpansion){
			console.info("OUT: "+data);
		} else {
			console.info("OUT: "+asciistrings.expand(data));
		}
	});
}


/**
 * Intercept the SIGINT signal in order to terminate on Ctrl-C.
 */
process.on('SIGINT', function () {
	console.log("Received SIGINT.");
	process.nextTick(terminate);  	
});

/**
 * Intercept the SIGTERM signal in order to terminate on shutdown.
 */
process.on('SIGTERM',function(){
	console.log("Received SIGTERM.");
	process.nextTick(terminate);
});

/**
 * Function that will terminal the application. Calling server.stop() should work as well.
 */
function terminate(){
	console.info("Terminating server.");
	process.exit(0);
}


// Start the server, and wait for termination ;-)
server.start();