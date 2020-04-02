#!/usr/bin/env node
var ok = require('./oK');
var fs = require('fs');
var os = require('os');
var path = require('path');
var readline = require('readline');
var conv = require('./convert');
help = `oK has atom, list (2;\`c), dict \`a\`b!(2;\`c) and func {[x;y]x+y}
20 primitives/verbs, 6 operators/adverbs and 3 system functions

Verb       (unary)    Adverb             Noun         (null)
: gets                '  each            name  \`a\`b    \`
+ plus      flip      /  over|join       char  "ab"    " "
- minus     negate    \\  scan|split      num   2 .3    0N(nan) 0w(inf)
* times     first     ': eachprior       hex   0x2a2b
% divide    sqrt      /: eachright       bool  01000b
! mod|map   enum|key  \\: eachleft
& min|and   where
| max|or    reverse   System             list (2;3.4;\`ab)
< less      asc       0: file r/w        dict \`a\`b!(2;\`c)
> more      desc      1: json r (file)   view f::32+1.8*c
= equal     group     5: printable form  func {[c]32+1.8*c}
~ match     not
, concat    enlist
^ except    null                         \\t x   time
# take|rsh  count                        \\\\     exit
_ drop|cut  floor
$ cast|sum  string    $[c;t;f]     COND
? find|rnd  distinct  ?[x;I;[f;]y] insert
@ at        type      @[x;i;[f;]y] amend
. dot       eval|val  .[x;i;[f;]y] dmend
`

// register I/O hooks
function str(x) { // convert a k string or symbol to a js string
	var s = conv.tojs(x);
	if (typeof s !== 'string') { throw Error('ERROR: type'); }
	return s;
}
function read(x) {
	var f = str(x);
	if (f) {
		f = path.resolve(process.cwd(), f);
		return conv.tok(fs.statSync(f).isDirectory() ? fs.readdirSync(f) : fs.readFileSync(f, 'utf8').replace(/\r?\n$/, '').split(/\r?\n/));
	} else if (rl) {
		throw Error('ERROR: cannot read from stdin while in REPL');
	} else {
		var b = Buffer(128), b0, n = 0;
		while (fs.readSync(process.stdin.fd, b, n, 1) && b[n] !== 10) {
			n++;
			if (n === b.length) { b0 = b; b = Buffer(2 * n); b0.copy(b, 0, 0, n); b0 = null; } // resize buffer when full
		}
		return conv.tok(b.toString('utf8', 0, n));
	}
}
function write(x, y) {
	var s = conv.tojs(y);
	if (Array.isArray(s)) { s = s.join('\n') + '\n'; }
	if (typeof s !== 'string') { throw Error('ERROR: type'); }
	var f = str(x);
	if (f) {
		fs.writeFileSync(path.resolve(process.cwd(), f), s);
	} else {
		fs.writeSync(process.stdout.fd, s);
	}
	return y;
}
function readJSON(x) {
	var f = str(x);
	if (f) {
		f = path.resolve(process.cwd(), f);
		var t;
		try {
			// ? would it make sense to also give back a directory list in json when the string is a directory ?
			t = JSON.parse(fs.readFileSync(f, 'utf8'));
		} catch (err) {
			process.stdout.write('JSON parsing error: ' + err.message + '\n');
		}
		return conv.tok(t);
	}
}
for (var i = 0; i < 2; i++) { ok.setIO('0:', i, read ); }
for (var i = 2; i < 6; i++) { ok.setIO('0:', i, write); }
for (var i = 0; i < 2; i++) { ok.setIO('1:', i, readJSON); }
for (var i = 0; i < 2; i++) { ok.setIO('5:', i, function(x) { return conv.tok(ok.format(x)); }); }

var env = ok.baseEnv();

// run user prelude file if exists
try {
	var preludeFile = os.homedir() + "/.config/okrc.k"
	var program = fs.readFileSync(preludeFile, 'utf8');
	ok.run(ok.parse(program), env)
} catch (err) {
	if (err.code != 'ENOENT') throw err
}

// process filename.k as a command-line arg
if (process.argv.length > 2) {
	var program = fs.readFileSync(process.argv[2], 'utf8');
	env.put('x', true, conv.tok(process.argv.slice(3)))
	process.stdout.write(ok.format(ok.run(ok.parse(program), env)) + '\n');
	process.exit(0);
}

// actual REPL
process.stdout.write('oK v' + ok.version + ' (inspired by K5: http://kparc.com/k.txt; \\h for help)\n');
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
	var showtime = false;
	var showhelp = false;
	if (line.lastIndexOf("\\t") == 0) {
		line = line.slice(2);
		showtime = true;
	} else if (line.lastIndexOf("\\h") == 0) {
		showhelp = true;
	}
	try {
		if (line.trim()) {
			if (!showhelp) {
				var starttime = new Date().getTime();
				var output = ok.format(ok.run(ok.parse(line), env)) + '\n';
				if (showtime) {
					var endtime = new Date().getTime();
					output += "completed in "+(endtime-starttime)+"ms.\n";
				}
			} else {
				output = help;
			}
			process.stdout.write(output);
		}
	} catch (err) {
		process.stdout.write(err.message + '\n');
	}
	rl.prompt();
});
rl.on('close', function () { process.stdout.write('\n'); process.exit(0); });
rl.setPrompt(' '); rl.prompt();
