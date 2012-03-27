var serialserver=require("./serialserver.js");
var asciistrings=require("./asciistrings.js");
var monitoring=false;
var argumentsOffset=2;


/*
 * Parse for the -monitor option.
 */
if (process.argv[2]=="-monitor"){
	monitoring=true;
	argumentsOffset=3;
} else if (process.argv.length==2){
	console.info("Usage: serialserver [-monitor] <pathToSerialPort> <baudrate> <tcpPortNumber> [<interface>]");
	process.exit(0);
}

/*
 * Read the command line arguments.
 */
var serialPort=process.argv[argumentsOffset];
var baudrate = process.argv[argumentsOffset+1];
var tcpPortNumber = process.argv[argumentsOffset+2]
var interface=process.argv[argumentsOffset+3];

/*
 * Parse or initialize the baudrate.
 */
if (baudrate){
	baudrate = parseInt(baudrate);
} else {
	baudrate=9600;
}


/*
 * Create an instance of the serial server.
 */
var server = new serialserver.SerialServer(serialPort, baudrate, tcpPortNumber, interface);

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
if (monitoring){
	server.on("in",function(data){
		console.info("IN : "+asciistrings.expand(data.toString("utf8")));
	});

	server.on("out",function(data){
		console.info("OUT: "+asciistrings.expand(data));
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