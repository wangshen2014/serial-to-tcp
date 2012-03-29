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
	console.info("  serialserver [-help] [-monitor[:{ascii|hex|true}]] [-debug] <pathToSerialPort> <baudrate> <tcpPortNumber> [<interface>]");
	console.info("  - option names are case sensitive.");
	console.info("");
	console.info("  - help   : prints this information.");
	console.info("  - monitor: enabled monitoring mode.");
	console.info("             * true (default)     = output in plain text");
	console.info("             * ascii              = output in expanded ascii");
	console.info("             * hex                = output in hexadecimal");
	console.info("  - debug  : enables debug mode.");
	
	process.exit(0);
}

if (commandLine.debug) console.info(JSON.stringify(commandLine));

/*
 * Parse or initialize the baudrate.
 */
var baudrate = parseInt(commandLine.baudrate);

/*
 * initialize the mode
 */

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
		
		switch(commandLine.monitor){
			case true:
			default:
				console.info("IN "+asciistrings.pad(data.length,"    ")+": "+data.toString("utf8"));
				break;
			case "hex":
				console.info("IN "+asciistrings.pad(data.length,"    ")+": "+asciistrings.hex(data));
				break;
			case "ascii":
				console.info("IN "+asciistrings.pad(data.length,"    ")+": "+asciistrings.expand(data));
				break;
		}
			
	});

	server.on("out",function(data){
		switch(commandLine.monitor){
			case true:
			default:
				console.info("OUT"+asciistrings.pad(data.length,"    ")+": "+data.toString("utf8"));
				break;
			case "hex":
				console.info("OUT"+asciistrings.pad(data.length,"    ")+": "+asciistrings.hex(data));
				break;
			case "ascii":
				console.info("OUT"+asciistrings.pad(data.length,"    ")+": "+asciistrings.expand(data));
				break;			
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