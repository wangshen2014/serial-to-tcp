var ascii = ["NUL","SOH","STX","ETX","EOT","ENQ","ACK","BEL","BS","TAB","LF","VT","FF","CR","SO","SI","DLE","DC1","DC2","DC3","DC4","NAK","SYN","ETB","CAN","EM","SUB","ESC","FS","GS","RS","US"];

function asciiExpand(string){
	for(var i=0;i<32;i++){
		string=string.replace(String.fromCharCode(i),"<"+ascii[i]+">");
	}
	return string;
}

function asciiCompact(string){
	for(var i=0;i<32;i++){
		string=string.replace("<"+ascii[i]+">",String.forCharCode(i));
	}
	return string;
}

module.exports.expand=asciiExpand;
module.exports.compact=asciiCompact;