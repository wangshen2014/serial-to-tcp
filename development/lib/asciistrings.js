/*
 * Code from serial-to-tcp server in node js.
 * Copyright© 2012 by Daan Kets (Blackbit Consulting, http://www.blackbit.be)
 * Licensed under the Apache 2.0 license.
 */

var ascii =
	["<NUL>","<SOH>","<STX>","<ETX>","<EOT>","<ENQ>","<ACK>","<BEL>","<BS>","<TAB>","<LF>","<VT>","<FF>","<CR>","<SO>","<SI>",
	"<DLE>","<DC1>","<DC2>","<DC3>","<DC4>","<NAK>","<SYN>","<ETB>","<CAN>","<EM>","<SUB>","<ESC>","<FS>","<GS>","<RS>","<US>"];
	
for (var i = 32; i<127;i++){
	ascii.push(String.fromCharCode(i));
}

ascii.push("<DEL>");

for (var i=128; i<256; i ++ ){
	ascii.push("["+asciiToHex(i)+"]");
}

/*
 * Expands an ascii string to expanded notation.
 * All characters between 0 and 32, and 128 and 255 are expanded.
 */
function asciiExpand(buffer){
	var expandedString ="";
	for(var i=0;i<buffer.length;i++){
		var asciiCode = buffer[i];
		if (asciiCode>255){
			expandedString+="[NOASC]";
		} else {
			expandedString+=ascii[asciiCode];
		}
		
	}
	return expandedString;
}

function pad(string, template){
	string=string.toString();
	return template.substring(string.length)+string;
}

function hex(buffer){
	var hexString="";
	for(var i=0;i<buffer.length;i++){
		hexString+=asciiToHex(buffer[i])+" ";
	}
	return hexString;
}

function asciiToHex(ascii){
	return pad(ascii.toString(16).toUpperCase().substring(0,2),"00");
	// return ascii.toString(16).toUpperCase();
}

module.exports.expand=asciiExpand;
module.exports.pad=pad;
module.exports.hex=hex;