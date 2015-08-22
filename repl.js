#!/usr/bin/env node
var ok = require('./oK'); process.stdout.write('oK v' + ok.version + '\n');
var fs = require('fs');
var readline = require('readline');
var conv = require('./convert');

var env = ok.baseEnv();
var rl = readline.createInterface({
	input:  process.stdin,
	output: process.stdout,
	completer: function (line) {
		var m = /[a-z][a-z\d]*$/i.exec(line);
		var prefix = m ? m[0] : '';
		var names = [];
		for (var e = env; e; e = e.p) { // iterate over ancestor environments
			for (var name in e.d) {
				if (name.slice(0, prefix.length) === prefix && names.indexOf(name) < 0) {
					names.push(name);
				}
			}
		}
		return [names, prefix];
	}
});
rl.on('line', function (line) {
	if (line === '\\\\') { process.exit(0); }
	try {
		line.trim() && process.stdout.write(ok.format(ok.run(ok.parse(line), env)) + '\n');
	} catch (err) {
		process.stdout.write(err.message + '\n');
	}
	rl.prompt();
});
rl.on('close', function () { process.stdout.write('\n'); process.exit(0); });
function read(x) {
	// todo
	return conv.tok('');
}
function write(x, y) {
	// todo
	return y;
}
ok.setIO('0:', 2, write);
ok.setIO('0:', 4, write);
ok.setIO('0:', 0, read);
rl.setPrompt(' '); rl.prompt();
