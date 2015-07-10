"use strict";

////////////////////////////////////
//
//   A basic REPL wrapper for oK.
//
////////////////////////////////////

var ok = require("./oK");
var conv = require("./convert");
var fs = require("fs");
var fd = process.stdin.fd;
var usingDevice = false;

function readchar() {
	var buff = new Buffer(1);
	fs.readSync(fd, buff, 0, 1);
	return String.fromCharCode(buff[0]);
}
function readline() {
	try { fd = fs.openSync('/dev/stdin', 'rs'); usingDevice = true; } catch (e) {}
	var r=""; while(true) { var c = readchar(); if (c == "\n") { break; } r += c; }
	if (usingDevice) { fs.closeSync(fd); } return r;
}
function read(x) {
	// todo: use x to select a file descriptor
	return ok.parse('"'+readline()+'"')[0];
}
function write(x, y) {
	// todo: use x to select a file descriptor
	if (typeof conv.tojs(y) == 'string') { process.stdout.write(conv.tojs(y)); }
	else { process.stdout.write(format(y)); }
	return y;
}
ok.setIO("0:", 2, write);
ok.setIO("0:", 4, write);
ok.setIO("0:", 0, read);

if (process.argv.length == 3) {
	var program = fs.readFileSync(process.argv[2], { encoding:'utf8' });
	process.stdout.write(ok.format(ok.run(ok.parse(program), ok.baseEnv())));
	process.stdout.write("\n");
	process.exit(0);
}

process.stdout.write("oK v"+ok.version+"\n\n");
var env = ok.baseEnv();
while(true) {
	process.stdout.write("  ");
	var input = readline();
	if (input == "\\\\") { break; }
	if (input.trim() == "") { continue; }
	try { process.stdout.write(ok.format(ok.run(ok.parse(input), env)) + "\n"); }
	catch(err) { process.stdout.write(err.message + "\n"); }
}
