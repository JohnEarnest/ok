#!/usr/bin/env node
var ok = require('./oK');
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var conv = require('./convert');

// register I/O hooks
function str(x) { // convert a k string or symbol to a js string
	var s = x.t === 2 ? x.v : conv.tojs(x);
	if (typeof s !== 'string') { throw Error('ERROR: type'); }
	return s;
}
function read(x) {
	var f = str(x);
	if (f) {
		f = path.resolve(process.cwd(), f);
		return conv.tok(fs.statSync(f).isDirectory() ? fs.readdirSync(f) : fs.readFileSync(f, 'utf8').split(/\r?\n/));
	} else if (rl) {
		throw Error('ERROR: cannot read from stdin while in REPL');
	} else {
		var b = Buffer(128), b0, n = 0, fd = fs.openSync('/dev/stdin', 'rs');
		while (fs.readSync(fd, b, n, 1) && b[n] !== 10) {
			n++;
			if (n === b.length) { b0 = b; b = Buffer(2 * n); b0.copy(b, 0, 0, n); b0 = null; } // resize buffer when full
		}
		fs.closeSync(fd);
		return conv.tok(b.toString('utf8', 0, n));
	}
}
function write(x, y) {
	var s = y.t === 2 ? y.v : conv.tojs(y);
	if (Array.isArray(s)) { s = s.map(str).join('\n') + '\n'; }
	if (typeof s !== 'string') { throw Error('ERROR: type'); }
	var f = str(x);
	if (f) {
		fs.writeFileSync(path.resolve(process.cwd(), f), s);
	} else {
		fs.writeSync(process.stdout.fd, s);
	}
	return x;
}
for (var i = 0; i < 2; i++) { ok.setIO('0:', i, read ); }
for (var i = 2; i < 6; i++) { ok.setIO('0:', i, write); }

// process filename.k as a command-line arg
if (process.argv.length === 3) {
	var program = fs.readFileSync(process.argv[2], 'utf8');
	process.stdout.write(ok.format(ok.run(ok.parse(program), ok.baseEnv())) + '\n');
	process.exit(0);
}

// actual REPL
process.stdout.write('oK v' + ok.version + '\n');
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
rl.setPrompt(' '); rl.prompt();
