/*
 * Code from serial-to-tcp server in node js.
 * Copyright© 2012 by Daan Kets (Blackbit Consulting, http://www.blackbit.be)
 * Licensed under the Apache 2.0 license.
 */

if (String.prototype.startsWith==undefined){
	String.prototype.startsWith=function(substring){
		return this.indexOf(substring)==0;
	};
}

var CommandLine=function(args,argNames){

	this.executable=args[0]; // Ought to be node
	this.script=args[1];
	this.orderedArgNames=argNames;
	
	this.orderedArguments=new Array();
	this.orderedArguments.commandLine=this;
	this.orderedArguments.pushArgument=function(value){
		if (!isNaN(value)){
			if(value.indexOf(".")==-1){
				value=parseInt(value);
			} else {
				value=parseFloat(value);
			}
		} else {
			if (value=="true" || value=="false"){
				value=("true"==value);
			} else if ("null"==value || ""==value){
				value=null;
			}
		}
		this.push(value);
		if (this.commandLine.orderedArgNames){
			if (this.commandLine.orderedArgNames[this.length-1]){
				this.commandLine[this.commandLine.orderedArgNames[this.length-1]]=value;
			}
		}
	};
	
	// this.parseArgument=parseArgument;
	
	for (var i=2; i <args.length;i++){
		this.parseArgument(args[i]);
	}
}

CommandLine.prototype.parseArgument=function(argument){
	if (argument.startsWith("-")){ // Named argument!
		var argName=argument.substring(1);
		if (argName.indexOf(":")>-1){
			var argValue=argName.substring(argName.indexOf(":")+1);
			argName=argName.substring(0, argName.indexOf(":"));
			if (!isNaN(argValue)){
				if(argValue.indexOf(".")==-1){
					this[argName]=parseInt(argValue);
				} else {
					this[argName]=parseFloat(argValue);
				}
			} else {
				if (argValue=="true" || argValue=="false"){
					this[argName]=("true"==argValue);
				} else if ("null"==argValue || ""==argValue){
					this[argName]=null;
				} else {
					this[argName]=argValue;
				}
			}
		} else {
			this[argName]=true;
		}
	} else {
		this.orderedArguments.pushArgument(argument);
	}
};

module.exports.CommandLine=CommandLine;