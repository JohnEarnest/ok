"use strict";

////////////////////////////////////
//
//   A basic REPL wrapper for oK.
//
////////////////////////////////////

var ok = require("./oK");
var fs = require("fs");

function readchar() {
	var buff = new Buffer(1);
	fs.readSync(process.stdin.fd, buff, 0, 1);
	return String.fromCharCode(buff[0]);
}
function readline() {
	var r=""; while(true) {
		var c = readchar();
		if (c == "\n") { return r; }
		r += c;
	}
}

process.stdout.write("oK v0.1\n\n");
var env = new ok.Environment(null);
while(true) {
	process.stdout.write("  ");
	var input = readline();
	if (input == "\\\\") { break; }
	if (input.trim() == "") { continue; }
	try { process.stdout.write(ok.format(ok.run(ok.parse(input), env)) + "\n"); }
	catch(err) { process.stdout.write(err.message + "\n"); }
}
