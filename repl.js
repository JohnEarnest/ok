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
	var r=""; while(true) { var c = readchar(); if (c == "\n") { return r; } r += c; }
}
function read(x) {
	// todo: use x to select a file descriptor
	return ok.parse('"'+readline()+'"')[0];
}
function write(x, y) {
	// todo: use x to select a file descriptor
	var r = ok.format(y); r = r[0]=='"' ? r.slice(1,-1) : r; r = ok.parse('"'+r+'"')[0];
	for(var z=0; z<r.v.length;z++) { process.stdout.write(String.fromCharCode(r.v[z].v)); }
	return y;
}
ok.setIO("0:", 0, write);
ok.setIO("0:", 2, write);
ok.setIO("0:", 4, read);

if (process.argv.length == 3) {
	var program = fs.readFileSync(process.argv[2], { encoding:'utf8' });
	process.stdout.write(ok.format(ok.run(ok.parse(program), new ok.Environment(null))));
	process.stdout.write("\n");
	process.exit(0);
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
