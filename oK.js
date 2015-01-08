////////////////////////////////////
//
//   A small(ish) implementation
//   of the K programming language.
//
//   John Earnest
//
////////////////////////////////////

"use strict";

var typenames = [
	"number"    , //  0 : value
	"char"      , //  1 : value
	"symbol"    , //  2 : value
	"list"      , //  3 : array -> k
	"dictionary", //  4 : value (map string->kval)
	"function"  , //  5 : body, args, curry, env
	"view"      , //  6 : value, r, cache, depends->val
	"nameref"   , //  7 : name, l(index?), r(assignment), global?
	"verb"      , //  8 : name, l(?), r
	"adverb"    , //  9 : name, l(?), verb, r
	"return"    , // 10 : value (expression)
	"nil"       , // 11 :
	"cond"      , // 12 : body (list of expressions)
	"amend"     , // 13 : body (list of expressions)
	"dmend"     , // 14 : body (list of expressions)
	"query"     , // 15 : body (list of expressions)
];

var NIL = asSymbol("");
var EC = [["\\","\\\\"],["\"","\\\""],["\n","\\n"],["\t","\\t"]];

function k(t, v)         { return { 't':t, 'v':v }; }
function kl(vl)          { return vl.length==1?vl[0]:k(3,vl); }
function s(x)            { return x.t == 3 && x.v.every(function(c) { return c.t == 1; }); }
function asSymbol(x)     { return k(2, "`"+x); }
function asVerb(x, y, z) { return { t:8, v:x, l:y, r:z }; }
function kmod(x, y)      { return x-y*Math.floor(x/y); }

function stok(x) {
	var r=[]; for(var z=0;z<x.length;z++) { r.push(k(1,x.charCodeAt(z))); } return kl(r);
}
function ktos(x, esc) {
	var r = x.v.map(function(k) { return String.fromCharCode(k.v); }).join("");
	if (esc) { for(var z=0;z<EC.length;z++) { r=r.replace(EC[z][0],EC[z][1]); }} return r;
}
function kmap(x, f) {
	l(x); var r=[]; for(var z=0;z<x.v.length;z++) { r.push(f(x.v[z],z)); } return k(3,r);
}
function kzip(x, y, f) {
	l(x); l(y); if (x.v.length != y.v.length) { throw new Error("length error."); }
	var r=[]; for(var z=0;z<x.v.length;z++) { r.push(f(x.v[z],y.v[z])); } return k(3,r);
}
function checktype(n, t) {
	if (n.t == t) { return; }
	throw new Error(typenames[t]+" expected, found "+typenames[n.t]+".");
}
function n(x) { return checktype(x, 0); }
function l(x) { return checktype(x, 3); }
function d(x) { return checktype(x, 4); }
function a(x) { if (x.t > 2) { throw new Error("domain error."); }}
function p(x) { n(x); if (x.v < 0 || x.v%1 != 0)  { throw new Error("positive int expected."); }}
function m(x) {
	l(x); if (!x.v.every(function(y) { return y.t == 3 && y.v.length == x.v[0].v.length; })) { 
		throw new Error("matrix expected.");
	}
}

////////////////////////////////////
//
//   Primitive Verbs
//
////////////////////////////////////

function plus  (x, y) { n(x); n(y); return k(0, x.v + y.v); }
function minus (x, y) { n(x); n(y); return k(0, x.v - y.v); }
function times (x, y) { n(x); n(y); return k(0, x.v * y.v); }
function divide(x, y) { n(x); n(y); return k(0, x.v / y.v); }
function mod   (x, y) { n(x); n(y); return k(0, kmod(x.v, y.v)); }
function max   (x, y) { n(x); n(y); return k(0, Math.max(x.v, y.v)); }
function min   (x, y) { n(x); n(y); return k(0, Math.min(x.v, y.v)); }
function less  (x, y) { a(x); a(y); return k(0, x.v <  y.v ? 1 : 0); }
function more  (x, y) { a(x); a(y); return k(0, x.v >  y.v ? 1 : 0); }
function equal (x, y) {             return k(0, x.v == y.v ? 1 : 0); }
function cat   (x, y) {             return k(3, (x.t== 3?x.v:[x]).concat(y.t== 3?y.v:[y])); }
function except(x, y) {             return exceptl(x, k(3, [y])); }
function take  (x, y) {             return takel(x, k(3, [y])); }
function rsh   (x, y) {             return rshl(x, k(3, [y])); }
function negate   (x) { n(x);       return k(0, -x.v); }
function first    (x) {             return (x.t != 3) ? x : x.v[0]; }
function sqrt     (x) { n(x);       return k(0, Math.sqrt(x.v)); }
function keys     (x) { d(x);       return k(3, Object.keys(x.v).map(asSymbol)); }
function zero     (x) { p(x);       return kmap(iota(x), function(x) { return k(0,0); }); }
function reverse  (x) { l(x);       return k(3,x.v.slice(0).reverse()); }
function desc     (x) { l(x);       return reverse(asc(x)); }
function not      (x) { n(x);       return k(0, x.v == 0 ?1:0); }
function enlist   (x) {             return k(3, [x]); }
function isnull   (x) {             return max(match(x, NIL),match(x,k(11))); }
function count    (x) {             return k(0, x.t == 3 ? x.v.length : 1); }
function floor    (x) { n(x);       return k(0, Math.floor(x.v)); }
function atom     (x) {             return k(0, x.t != 3 ?1:0); }
function kfmt     (x) { var r=stok(format(x)); if (r.t!=3) { r=k(3,[r]); } return r; }

function keval(x, env) {
	if (x.t == 2) { return env.lookup(x.v.slice(1), true); }
	return run(parse(ktos(x)), env);
}

function iota(x) {
	if (x.t == 4) { return keys(x); }
	p(x); var r=[]; for(var z=0;z<x.v;z++) { r.push(k(0,z)); } return k(3,r);
}

function write(x, y) {
	// todo: use x to select a file descriptor
	process.stdout.write(s(y)?ktos(y):format(y)); return y;
}
function read(x) {
	// todo: use x to select a file descriptor
	// note: line IO like this will only work on a bleeding-edge release of node.
	var fs = require("fs");
	function readchar() {
		var buff = new Buffer(1); fs.readSync(process.stdin.fd, buff, 0, 1);
		if (buff[0] === null) { return -1; } return buff[0];
	};
	var r=[]; while(true) {
		var c = readchar(); if (c == "\n".charCodeAt(0)) { return k(3,r); } r.push(k(1,c));
	}
}

function dfmt(x, y) {
	var r = kfmt(y); var c = Math.abs(x.v);
	if (x.v < 0) { // pad right
		while(r.v.length > c) { r.v.pop(); }
		while(r.v.length < c) { r.v.push(k(1, " ".charCodeAt(0))); }
	}
	else { // pad left
		while(r.v.length > c) { r.v.shift(); }
		while(r.v.length < c) { r.v.unshift(k(1, " ".charCodeAt(0))); }
	} return r;
}

function exceptl(x, y) {
	l(x); l(y); return k(3, x.v.filter(function(z) {
		return !y.v.some(function(w) { return match(z, w).v; })
	}));
}

function drop(x, y) {
	n(x); if (y.t != 3 || y.v.length < 1) { return y; }
	return k(3, x.v<0?y.v.slice(0,x.v):y.v.slice(x.v));
}

function takel(x, y) {
	n(x); l(y); var r=[]; var s=x.v<0?kmod(x.v, y.v.length):0;
	for(var z=0;z<Math.abs(x.v);z++) { r.push(y.v[kmod(z+s, y.v.length)]); } return k(3,r);
}

function rshl(x, y) {
	l(x); l(y); count = 0;
	function rshr(x, y, index) {
		var r=[]; for(var z=0;z<x.v[index].v;z++) {
			if (index == x.v.length-1) { r.push(y.v[kmod(count++, y.v.length)]); }
			else { r.push(rshr(x, y, index+1)); }
		} return k(3,r);
	} return rshr(x, y, 0);
}

function rotate(x, y) {
	n(x); return kmap(y, function(a,i){ return y.v[kmod(x.v+i,y.v.length)]; });
}

function match(x, y) {
	if (x.t != y.t) { return k(0,0); }
	if (x.t != 3) { return equal(x, y); }
	if (x.v.length != y.v.length) { return k(0,0); }
	return k(0, x.v.every(function(x,i) { return match(x, y.v[i]).v; })?1:0);
}

function find(x, y) {
	l(x); for(var z=0;z<x.v.length;z++) { if(match(x.v[z],y).v) { return k(0,z); } }
	return k(0,x.v.length);
}

function cut(x, y) {
	l(x); l(y); var r=[]; for(var z=0;z<x.v.length;z++) {
		r.push(k(3, [])); p(x.v[z]);
		var max = x.v.length-1 == z ? y.v.length : x.v[z+1].v;
		for(var i=x.v[z].v;i<max;i++) { r[z].v.push(y.v[i]); }
	} return k(3,r);
}

function rnd(x, y) {
	p(y); return kmap(iota(x), function(x){ return k(0,Math.floor(Math.random()*y.v)); });
}

function flip(x) {
	m(x); var r=[]; var d=x.v[0].v.length; for(var z=0;z<d;z++) {
		r.push(k(3,[])); for(var t=0;t<x.v.length;t++) { r[z].v.push(x.v[t].v[z]); }
	} return k(3,r);
}

function asc(x) {
	l(x); return k(3, x.v.map(function(x,i) { return k(0, i); }).sort(function(a, b) {
		if (less(x.v[a.v], x.v[b.v]).v) { return -1; }
		if (more(x.v[a.v], x.v[b.v]).v) { return  1; }
		return 0;
	}));
}

function where(x) {
	l(x); var r=[]; for(var z=0;z<x.v.length;z++) {
		p(x.v[z]); for(var t=0;t<x.v[z].v;t++) { r.push(k(0, z)); }
	} return k(3,r);
}

function group(x) {
	l(x); var r=[]; var y={}; for(var z=0;z<x.v.length;z++) {
		var i = x.v[z].v; if (!(i in y)) { y[i] = r.length; r.push(k(3, [])); }
		r[y[i]].v.push(k(0, z));
	} return k(3,r);
}

function unique(x) {
	l(x); var r=[]; for(var z=0;z<x.v.length;z++) {
		if (!r.some(function(e) { return match(x.v[z], e).v })) { r.push(x.v[z]); }
	} return k(3,r);
}

function bin(x, y) {
	l(x); var a=0; var b=x.v.length; if (b<1 || less(y, x.v[0]).v) { return k(0,-1); }
	while(b - a > 1) { var i=Math.floor((b+a)/2); if (more(x.v[i], y).v) { b=i; } else { a=i; }}
	return k(0, a);
}

function join(x, y) {
	l(y); return y.v.reduce(function(z, y) { return cat(z, cat(x, y)); });
}

function split(x, y) {
	l(y); var r=[k(3,[])]; for(var z=0;z<y.v.length;z++) {
		if (match(x, y.v[z]).v) { r.push(k(3,[])); }
		else { r[r.length-1].v.push(y.v[z]); }
	} return k(3,r);
}

function makedict(x) {
	m(x); if (x.v.length != 2) { throw new Error("valence error."); }
	var r={}; for(var z=0;z<x.v[0].v.length;z++) {
		var key = x.v[0].v[z];
		if      (key.t == 1) { key = String.fromCharCode(key.v); }
		else if (key.t == 2) { key = key.v.slice(1); }
		else if (s(key))     { key = ktos(key, true); }
		else { throw new Error("map keys must be strings or symbols."); }
		r[key] = x.v[1].v[z];
	} return k(4, r);
}

////////////////////////////////////
//
//   Primitive Adverbs
//
////////////////////////////////////

function each(monad, x, env) {
	if (monad.t != 5 && monad.t != 8 && monad.t != 9) { return ar(bin)(monad, x); }
	return kmap(x, function(x) { return applym(monad, x, env); });
}

function eachright(dyad, left, list, env) {
	return kmap(list, function(x) { return applyd(dyad, left, x, env); });
}

function eachleft(dyad, list, right, env) {
	return kmap(list, function(x) { return applyd(dyad, x, right, env); });
}

function eachprior(dyad, x, env) {
	l(x); var r=[];
	for(var z=1;z<x.v.length;z++) { r.push(applyd(dyad, x.v[z], x.v[z-1], env)); }
	return k(3,r);
}

function over(dyad, x, env) {
	l(x); if (x.v.length < 1) { return x; }
	if (dyad.t != 5 && dyad.t != 8 && dyad.t != 9) { return join(dyad, x); }
	return x.v.reduce(function(x, y) { return applyd(dyad, x, y, env); });
}

function fixed(monad, x, env) {
	var r=x; var p=x;
	do { p=r; r=applym(monad, r, env); } while(!match(p, r).v && !match(r, x).v);
	return p;
}

function fixedwhile(monad, x, y, env) {
	if (x.t == 0) { for(var z=0;z<x.v;z++) { y = applym(monad, y, env); } }
	else { do { y = applym(monad, y, env); } while (applym(x, y, env).v != 0); }
	return y;
}

function scan(dyad, x, env) {
	l(x); if (x.v.length < 1) { return x; }
	if (dyad.t != 5 && dyad.t != 8 && dyad.t != 9) { return split(dyad, x); }
	var c=x.v[0]; var r=[c];
	for(var z=1;z<x.v.length;z++) { c = applyd(dyad, c, x.v[z], env); r.push(c); }
	return k(3, r);
}

function scanfixed(monad, x, env) {
	var r=[x]; while(true) {
		var p = r[r.length-1]; var n = applym(monad, p, env);
		if (match(p, n).v || match(n, atom).v) { break; } r.push(n);
	} return k(3,r);
}

function scanwhile(monad, x, y, env) {
	var r=[y]; if (x.t == 0) { for(var z=0;z<x.v;z++) { y = applym(monad, y, env); r.push(y); } }
	else { do { y = applym(monad, y, env); r.push(y); } while (applym(x, y, env).v != 0); }
	return k(3, r);
}

////////////////////////////////////
//
//   Interpreter
//
////////////////////////////////////

function am(monad) { // create an atomic monad
	return function recur(value) {
		if (value.t != 3) { return monad(value); }
		return kmap(value, function(x) { return recur(x); });
	};
}
function ad(dyad) { // create an atomic dyad
	return function recur(left, right) {
		if (left.t != 3 && right.t != 3) { return dyad(left, right); }
		if (left.t  != 3) { return kmap(right, function(x) { return recur(left, x ); }); }
		if (right.t != 3) { return kmap(left,  function(x) { return recur(x, right); }); }
		return kzip(left, right, function(x,y) { return recur(x, y); });
	};
}
function al(dyad) { // create a left atomic dyad
	return function recur(left, right) {
		if (left.t != 3) { return dyad(left, right); }
		return kmap(left, function(x) { return recur(x, right); });
	};
}
function ar(dyad) { // create a right atomic dyad
	return function recur(left, right) {
		if (right.t != 3) { return dyad(left, right); }
		return kmap(right, function(x) { return recur(left, x); });
	};
}

function applym(verb, x, env) {
	if (verb.t == 5) { return call(verb, k(3,[x]), env); }
	if (verb.t == 9 & verb.r == null) { verb.r=x; var r=run(verb, env); verb.r=null; return r; }
	if (verb.sticky) {
		var s=verb.sticky; s.r=x; verb.sticky=null;
		var r=run(verb, env); verb.sticky=s; s.r=null; return r;
	}
	return applyverb(verb, null, x, env);
}

function applyd(verb, x, y, env) {
	if (verb.t == 5) { return call(verb, k(3,[x,y]), env); }
	return applyverb(verb, x, y, env);
}

var verbs = {
	//     a-a         l-a         a-l         l-l         a           l
	"+" : [plus,       ad(plus),   ad(plus),   ad(plus),   null,       flip      ],
	"-" : [minus,      ad(minus),  ad(minus),  ad(minus),  negate,     am(negate)],
	"*" : [times,      ad(times),  ad(times),  ad(times),  first,      first     ],
	"%" : [divide,     ad(divide), ad(divide), ad(divide), sqrt,       null      ],
	"!" : [mod,        al(mod),    rotate,     al(rotate), iota,       makedict  ],
	"&" : [min,        ad(min),    ad(min),    ad(min),    zero,       where     ],
	"|" : [max,        ad(max),    ad(max),    ad(max),    null,       reverse   ],
	"<" : [less,       ad(less),   ad(less),   ad(less),   null,       asc       ],
	">" : [more,       ad(more),   ad(more),   ad(more),   null,       desc      ],
	"=" : [equal,      ad(equal),  ad(equal),  ad(equal),  null,       group     ],
	"~" : [match,      match,      match,      match,      not,        am(not)   ],
	"," : [cat,        cat,        cat,        cat,        enlist,     enlist    ],
	"^" : [null,       except,     null,       exceptl,    isnull,     am(isnull)],
	"#" : [take,       rsh,        takel,      rshl,       count,      count     ],
	"_" : [drop,       null,       drop,       cut,        floor,      am(floor) ],
	"$" : [dfmt,       ad(dfmt),   ad(dfmt),   ad(dfmt),   kfmt,       am(kfmt)  ],
	"?" : [rnd,        find,       null,       find,       null,       unique    ],
	"@" : [atd,        atl,        atd,        ar(atl),    atom,       atom      ],
	"." : [call,       call,       call,       call,       keval,      keval     ],
	"0:": [write,      null,       write,      null,       read,       null      ],
	"1:": [null,       null,       null,       null,       null,       null      ], // todo
	"2:": [null,       null,       null,       null,       null,       null      ], // todo
};

function applyverb(node, left, right, env) {
	if (node.t == 9) { return applyadverb(node, node.verb, left, right, env); }
	var r = verbs[node.forcemonad ? node.v[0] : node.v][(right.t != 3) ? 4 : 5];
	if (left && right) {
		if (left.t != 3 && right.t != 3) { r = verbs[node.v][0]; }
		if (left.t == 3 && right.t != 3) { r = verbs[node.v][1]; }
		if (left.t != 3 && right.t == 3) { r = verbs[node.v][2]; }
		if (left.t == 3 && right.t == 3) { r = verbs[node.v][3]; }
	}
	if (r == null) { throw new Error("invalid arguments to "+node.v); }
	return left ? r(left, right, env) : r(right, env);
}

var adverbs = {
	//      monad-m     monad-d     dyad
	"':"  : [eachprior,  null ,      null      ],
	"'"   : [each,       each ,      null      ],
	"/:"  : [eachright,  null ,      eachright ],
	"\\:" : [eachleft,   null ,      eachleft  ],
	"/"   : [over,       fixed,      fixedwhile],
	"\\"  : [scan,       scanfixed,  scanwhile ],
}

function applyadverb(node, verb, left, right, env) {
	var r = adverbs[node.v][0];
	if (node.l) { r = adverbs[node.v][2]; }
	else if (verb.t == 9) { r = adverbs[node.v][1]; }
	else if (verb.t == 5 && verb.args.length == 1) { r = adverbs[node.v][1]; }
	if (r == null) { throw new Error("invalid arguments to "+node.v); }
	return left? r(verb, left, right, env) : r(verb, right, env);
}

function Environment(pred) {
	this.p = pred; this.d = {};
	this.put = function(n, g, v) {
		if (g && this.p) { this.p.put(n, g, v); } else { this.d[n] = v; }
	};
	this.lookup = function(n, g) {
		if (g && this.p) { return this.p.lookup(n, g); }
		if (!(n in this.d)) {
			if (!this.p) { throw new Error("the name '"+n+"' has not been defined."); }
			return this.p.lookup(n);
		}
		if (this.d[n].t == 6) {
			var view = this.d[n]; var dirty = view.cache == 0;
			var keys = Object.keys(view.depends);
			for(var z=0;z<keys.length;z++) {
				var n = this.lookup(keys[z]); var o = view.depends[keys[z]];
				if (!o || !match(n,o).v) { dirty = true; view.depends[keys[z]] = n; }
			}
			if (dirty) { view.cache = run(view.r, this); }
			return view.cache;
		}
		return this.d[n];
	};
}

function atd(x, y, env) {
	if (x.t == 2) { x = env.lookup(x.v.slice(1), true); }
	if (x.t == 3) { return atl(x, y, env); }
	if (x.t == 5) { return call(x, k(3,[y]), env); }
	if (x.t == 8 || x.t == 9) { return applym(x, y, env); }
	d(x); checktype(y, 2); if (!(y.v.slice(1) in x.v)) {
		throw new Error("index error: "+format(y));
	} return x.v[y.v.slice(1)];
}

function atl(x, y) {
	if (x.t == 2) { x = env.lookup(x.v.slice(1), true); }
	l(x); if (y.t != 0 || y.v < 0 || y.v >= x.v.length || y.v%1 != 0) {
		throw new Error("index error: "+format(y));
	} return x.v[y.v];
}

function atdepth(x, y, i, env) {
	if (i >= y.v.length) { return x; }
	if (isnull(y.v[i]).v) { return kmap(x, function(x) { return atdepth(x, y, i+1, env); }); }
	if (y.v[i].t != 3) { return atdepth(ar(atl)(x, y.v[i], env), y, i+1, env); }
	return kmap(y.v[i], function(t) { return atdepth(ar(atl)(x, t, env), y, i+1, env); });
}

function call(x, y, env) {
	if (x.t == 2) { x = env.lookup(x.v.slice(1), true); }
	if (y.t == 0) { return atd(x, y); }
	if (y.t == 3 && y.v.length == 0) { return x; }
	if (x.t == 3 && y.t == 3) { return atdepth(x, y, 0, env); }
	if (x.t != 5) { throw new Error("function or list expected."); }
	if (y.t != 3) { y = k(3, [y]); }
	var environment = new Environment(x.env); var curry = x.curry?x.curry.concat([]):[];
	if (x.args.length != 0 || y.v.length != 1 || !isnull(y.v[0]).v) {
		var all=true; var i=0; for(var z=0;z<x.args.length;z++) {
			if (curry[z] && !isnull(curry[z]).v) { continue; }
			if (i >= y.v.length) { all=false; break; }
			if (isnull(y.v[i]).v) { all=false; }
			curry[z]=y.v[i++];
		}
		if (!all) { return { t:5, v:x.v, args:x.args, env:x.env, curry:curry }; }
		if (i < y.v.length) { throw new Error("valence error."); }
		for(var z=0;z<x.args.length;z++) { environment.put(x.args[z], false, curry[z]); }
	}
	var r = run(x.v, environment);
	return (r.t == 10) ? r.v : r;
}

function run(node, environment) {
	if (node == null) { return k(11); }
	if (node instanceof Array) {
		var r; for(var z=0;z<node.length;z++) {
			r=run(node[z], environment); if (r.t == 10) { return k(10, r.v); }
		} return r;
	}
	if (node.sticky) { return node; }
	if (node.t == 3) { return kmap(node, function(x){ return run(x, environment); }); }
	if (node.t == 6) { environment.put(node.v, false, node); return node; }
	if (node.t == 7) {
		if (node.r) { environment.put(node.v, node.global, run(node.r, environment)); }
		return environment.lookup(node.v);
	}
	if (node.t == 8 && node.r) {
		var right = run(node.r, environment);
		var left  = node.l ? run(node.l, environment) : null;
		return applyverb(node, left, right, environment);
	}
	if (node.t == 9 && node.r) {
		var right = run(node.r, environment);
		var verb  = run(node.verb, environment);
		var left  = node.l ? run(node.l, environment) : null;
		return applyadverb(node, verb, left, right, environment);
	}
	if (node.t == 10) { return k(10, run(node.v, environment)); }
	if (node.t == 12) {
		for(var z=0;z<node.v.length-1;z+=2) {
			if (!match(k(0,0), run(node.v[z], environment)).v) {
				return run(node.v[z+1], environment);
			}
		} return run(node.v[node.v.length-1], environment);
	}
	if (node.t == 13) { return mend(node, environment, amendm, amendd); }
	if (node.t == 14) { return mend(node, environment, dmend, dmend); }
	if (node.t == 15) { return mend(node, environment, query, query); }
	if (node.t == 5 && !node.env) { node.env = environment; }
	return node;
}

function mend(node, env, monadic, dyadic) {
	if (node.v.length != 3 && node.v.length != 4) { throw new Error("valence error."); }
	var ds = run(node.v[0], env);
	var d = (ds.t == 2 ? env.lookup(ds.v.slice(1),true) : ds); l(d);
	var i = run(node.v[1], env);
	var y = node.v[3] ? run(node.v[3], env) : null;
	var f = run(node.v[2], env);
	(y?dyadic:monadic)(d, i, y, f, env);
	if (ds.t!=2) { return d; } env.put(ds.v.slice[1], true, d); return ds;
}

function amendm(d, i, y, monad, env) {
	if (i.t != 3) { d.v[i.v] = applym(monad, atl(d, i), env); return; }
	for(var z=0;z<i.v.length;z++) { amendm(d, i.v[z], y, monad, env); }
}

function amendd(d, i, y, dyad, env) {
	if      (i.t==3&y.t==3) { for(var z=0;z<i.v.length;z++) { amendd(d,i.v[z],y.v[z],dyad,env); } }
	else if (i.t==3&y.t!=3) { for(var z=0;z<i.v.length;z++) { amendd(d,i.v[z],y     ,dyad,env); } }
	else { p(i); d.v[i.v] = applyd(dyad, atl(d, i), y, env) }
}

function dmend(d, i, y, f, env) {
	if (i.t != 3) { (y?amendd:amendm)(d, i, y, f, env); return; }
	if (i.v.length == 1) { dmend(d, i.v[0], y, f, env); return; }
	var rest = drop(k(0,1),i);
	if (i.v[0].t == 3) { kmap(i.v[0],function(x) { dmend(atl(d,x), rest, y, f, env); }); }
	else if (isnull(i.v[0]).v) { kmap(d,function(x,i) { dmend(atl(d,k(0,i)), rest, y, f, env); }); }
	else { dmend(atl(d, first(i)), rest, y, f, env); }
}

function query(t, c, a, b, env) {
	l(t); if (a) { throw new Error("not implemented!"); }
	if (c.t == 3) { var x=c.v[0]; var y=c.v[1]; p(x); p(y); t.v.splice(x.v, y.v-x.v); c = x; }
	if (b.t != 3) { b = k(3,[b]); }
	p(c); var x=c.v; for(var z=0;z<b.v.length;z++) { t.v.splice(x++, 0, b.v[z]); }
}

////////////////////////////////////
//
//   Tokenizer
//
////////////////////////////////////

var NUMBER  = /^(-?\d*\.?\d+)/;
var BOOL    = /^[01]+b/;
var NAME    = /^([A-Za-z]+)/;
var SYMBOL  = /^(`[A-Za-z]*)/;
var STRING  = /^"((\\n)|(\\t)|(\\")|(\\\\)|[^"])*"/;
var VERB    = /^(\+|-|\*|%|!|&|\||<|>|=|~|,|\^|#|_|\$|\?|@|\.)/;
var ASSIGN  = /^(\+|-|\*|%|!|&|\||<|>|=|~|,|\^|#|_|\$|\?|@|\.):/;
var IOVERB  = /^\d:/;
var ADVERB  = /^(':|'|\/:|\\:|\/|\\)/;
var SEMI    = /^[\;\n]/;
var COLON   = /^:/;
var VIEW    = /^::/;
var COND    = /^\$\[/;
var AMEND   = /^@\[/;
var DMEND   = /^\.\[/;
var QUERY   = /^\?\[/;
var APPLY   = /^\./;
var OPEN_B  = /^\[/;
var OPEN_P  = /^\(/;
var OPEN_C  = /^{/;
var CLOSE_B = /^\]/;
var CLOSE_P = /^\)/;
var CLOSE_C = /^}/;

var desc = {};
desc[NUMBER ]="number";desc[NAME   ]="name"   ;desc[SYMBOL ]="symbol";desc[STRING]="string";
desc[VERB   ]="verb"  ;desc[IOVERB ]="IO verb";desc[ADVERB ]="adverb";desc[SEMI  ]="';'";
desc[COLON  ]="';'"   ;desc[VIEW   ]="view"   ;desc[COND   ]="'$['"  ;desc[APPLY ]="'.'";
desc[OPEN_B ]="'['"   ;desc[OPEN_P ]="'('"    ;desc[OPEN_C ]="{"     ;desc[ASSIGN]="assignment";
desc[CLOSE_B]="']'"   ;desc[CLOSE_P]="')'"    ;desc[CLOSE_C]="}";

var text = "";
var funcdepth = 0;
function begin(str) {
	str = str.replace(/\s\/[^\n]*/g, "");                          // strip comments
	str = str.replace(/([A-Za-z0-9\]\)])-(\d|(\.\d))/g, "$1- $2"); // minus ambiguity
	text = str.trim(); funcdepth = 0;
}
function done()         { return text.length < 1; }
function toplevel()     { return funcdepth == 0; }
function at(regex)      { return regex.test(text); }
function matches(regex) { return at(regex) ? expect(regex) : false; }
function expect(regex) {
	var found = regex.exec(text);
	if (regex == OPEN_C) { funcdepth++; } if (regex == CLOSE_C) { funcdepth--; }
	if (found == null) { throw new Error("parse error. "+desc[regex]+" expected."); }
	text = text.substring(found[0].length).trim(); return found[0];
}

////////////////////////////////////
//
//   Parser
//
////////////////////////////////////

function findNames(node, names) {
	if (node instanceof Array) { for(var z=0;z<node.length;z++) { findNames(node[z], names); } }
	if (node.t == 7)           { names[node.v] = 0; }
	if (node.t != 5)           { if (node.v instanceof Array) { findNames(node.v, names); } }
	if (node.l)                { findNames(node.l, names); }
	if (node.r)                { findNames(node.r, names); }
	if (node.verb)             { findNames(node.verb, names); }
	return names;
}

function atNoun() {
	return !done()&&at(NUMBER)||at(NAME)||at(SYMBOL)||at(STRING)||at(COND)||at(OPEN_P)||at(OPEN_C);
}

function indexedassign(node, indexer) {
	var op = { t:5, args:["x","y"], v:[{ t:7, v:"y" }] }; // {y}
	var gl = matches(COLON);
	var ex = parseEx(parseNoun());
	//t[x]::z  ->  ..[`t;x;{y};z]   t[x]:z  ->  t:.[t;x;{y};z]
	if (!gl) { node.r = { t:14, v:[ k(7,node.v), kl(indexer), op, ex] }; return node; }
	return { t:8, v:".", r:{ t:14, v:[asSymbol(node.v), kl(indexer), op, ex] }};
}

function compoundassign(node, indexer) {
	if (!at(ASSIGN)) { return node; }
	var op = expect(ASSIGN).slice(0,1);
	var gl = matches(COLON);
	var ex = parseEx(parseNoun());
	if (!indexer) {
		// t+::z  -> t::(.`t)+z
		var v = gl ? asVerb(".", null, asSymbol(node.v)) : node;
		return { t:node.t, v:node.v, global:gl, r:asVerb(op, v, ex) };
	}
	// t[x]+::z -> ..[`t;x;+:;z]   t[x]+:z -> t:.[t;x;{y};z]
	if (!gl) { node.r = { t:14, v:[ k(7,node.v), kl(indexer), { t:8, v:op }, ex] }; return node; }
	return { t:8, v:".", r: { t:14, v:[asSymbol(node.v), indexer, { t:8, v:op }, ex] }};
}

function applycallright(node) {
	while (matches(OPEN_B)) {
		var args = parseList(CLOSE_B);
		if (args.length == 0) { args = [NIL]; }
		node = asVerb(".", node, k(3, args));
	}
	if (atNoun()) { return asVerb("@", node, null); } return node;
}

function applyindexright(node) {
	while (matches(OPEN_B)) { node = asVerb(".", node, k(3, parseList(CLOSE_B))); }
	if (node.t == 3 && atNoun()) { return asVerb("@", node, null); } return node;
}

function findSticky(node) {
	if (node == null || node.t == 9 && node.r == null) { return null; }
	while(node.t == 8 || node.t == 9) {
		if (node.r == null) { return node; } node = node.r;
	} return null;
}

function parseList(terminal, cull) {
	var r = []; do {
		if (terminal && at(terminal)) { break; }
		while(matches(SEMI)) { if (!cull) { r.push(k(11)); } }
		var e = parseEx(parseNoun());
		var s = findSticky(e); if (s) { e.sticky = s; }
		if (e == null) { if (!cull) { r.push(k(11)); }}
		else { r.push(e); }
	} while(matches(SEMI));
	if (terminal) { expect(terminal); } return r;
}

function parseNoun() {
	if (matches(COLON)) { return k(10, parseEx(parseNoun())); }
	if (at(IOVERB)) { return k(8, expect(IOVERB)); }
	if (at(BOOL)) {
		var n = expect(BOOL); var r = [];
		for(var z=0;z<n.length-1;z++) { r.push(k(0, parseInt(n[z]))); }
		return applyindexright(k(3, r));
	}
	if (at(NUMBER)) {
		var r = []; while(at(NUMBER)) { r.push(k(0, parseFloat(expect(NUMBER)))); }
		return applyindexright(kl(r));
	}
	if (at(SYMBOL)) {
		var r = []; while(at(SYMBOL)) { r.push(k(2, expect(SYMBOL))); }
		return applyindexright(kl(r));
	}
	if (at(STRING)) {
		var str = expect(STRING); str = str.substring(1, str.length-1);
		for(var z=0;z<EC.length;z++) { str=str.replace(EC[z][1],EC[z][0]); }
		return applyindexright(stok(str));
	}
	if (matches(OPEN_B)) {
		var map = {}; do {
			var key = expect(NAME); expect(COLON);
			if (matches(COLON)) { var alias = expect(NAME); map[key] = map[alias]; }
			else { map[key] = parseEx(parseNoun()); }
		} while(matches(SEMI)); expect(CLOSE_B);
		return k(4, map);
	}
	if (matches(OPEN_C)) {
		var args = [];
		if (matches(OPEN_B)) {
			do { args.push(expect(NAME)); } while(matches(SEMI)); expect(CLOSE_B);
		}
		var r = k(5, parseList(CLOSE_C, true));
		if (args.length == 0) {
			var names = findNames(r.v, {});
			if      ("z" in names) { args = ["x","y","z"]; }
			else if ("y" in names) { args = ["x","y"]; }
			else if ("x" in names) { args = ["x"]; }
		}
		r.args = args;
		return applycallright(r);
	}
	if (matches(OPEN_P)) { return applyindexright(kl(parseList(CLOSE_P))); }
	if (matches(COND))   { return k(12, parseList(CLOSE_B, true)); }
	if (matches(AMEND))  { return k(13, parseList(CLOSE_B)); }
	if (matches(DMEND))  { return k(14, parseList(CLOSE_B)); }
	if (matches(QUERY))  { return k(15, parseList(CLOSE_B)); }
	if (at(VERB)) {
		var r = k(8, expect(VERB));
		if (matches(COLON)) { r.v += ":"; r.forcemonad = true; }
		return r;
	}
	if (at(NAME)) {
		var n = k(7, expect(NAME));
		if (toplevel() && matches(VIEW)) {
			var r = k(6, n.v);
			r.r = parseEx(parseNoun());
			r.depends = findNames(r.r, {});
			r.cache = 0;
			return r;
		}
		if (matches(COLON)) {
			n.global = matches(COLON);
			n.r = parseEx(parseNoun());
			return n;
		}
		if (matches(OPEN_B)) {
			var index = parseList(CLOSE_B);
			if (at(ASSIGN)) { return compoundassign(n, index); }
			if (matches(COLON)) { return indexedassign(n, index); }
			if (index.length == 0) { index = [NIL]; }
			n = asVerb(".", n, k(3, index));
		}
		return applycallright(compoundassign(n, null));
	}
	return null;
}

function parseAdverb(left, verb) {
	var a = expect(ADVERB);
	while(at(ADVERB)) { var b = expect(ADVERB); verb = { t:9, v:a, verb:verb }; a = b; }
	return { t:9, v:a, verb:verb, l:left, r:parseEx(parseNoun()) };
}

function parseEx(node) {
	if (node == null) { return null; }
	if (at(ADVERB)) { return parseAdverb(null, node); }
	if (node.t == 8 && !node.r) { node.r = parseEx(parseNoun()); }
	if (atNoun()) { var x = parseEx(parseNoun()); x.l = node; node = x; }
	if (at(VERB)) {
		var x = parseNoun();
		if (at(ADVERB)) { return parseAdverb(node, x); }
		x.l = node; x.r = parseEx(parseNoun()); node = x;
	}
	// nasty workaround/hack:
	// refold the AST for the special case of an adverb with two function predecessors:
	if (node.t != 8 || node.v != "@" || !node.l || !node.r ||
	  (node.l.t != 5 && node.l.t != 7) || node.r.t != 9 || !node.r.verb) { return node; }
	return { t:9, v:node.r.v, l:node.l, verb:node.r.verb, r:node.r.r };
}

function parse(str) { begin(str); return parseList(null, false); }

////////////////////////////////////
//
//   Prettyprinter
//
////////////////////////////////////

function format(k, indent) {
	function indented(k) { return format(k, indent+" "); };
	if (k instanceof Array) { return k.map(format).join(";"); }
	if (k.sticky) { var s=k.sticky; k.sticky=null; var r=format(k); k.sticky=s; return "("+r+")"; }
	if (k.t == 0) { return ""+(k.v % 1 === 0 ? k.v : Math.round(k.v * 10000) / 10000); }
	if (k.t == 1) { return '"'+String.fromCharCode(k.v)+'"'; }
	if (k.t == 2) { return k.v; }
	if (k.t == 3) {
		if (k.v.length <  1) { return "()"; }
		if (k.v.length == 1) { return ","+format(k.v[0]); }
		var same = true; var sublist = false; indent = indent || "";
		for(var z=0;z<k.v.length;z++) { same &= k.v[z].t == k.v[0].t; sublist |= k.v[z].t == 3; }
		if (sublist) { return "("+k.v.map(indented).join("\n "+indent)+")"; }
		if (same & k.v[0].t == 1) { return '"'+ktos(k, true)+'"'; }
		if (same & k.v[0].t <  3) { return k.v.map(format).join(" "); }
		return "("+k.v.map(format).join(";")+")" ;
	}
	if (k.t == 4) {
		return "["+Object.keys(k.v).map(function(x) { return x+":"+format(k.v[x]); }).join(";")+"]";
	}
	if (k.t == 5) {
		var r = ""; if (k.curry) {
			var c = []; for(var z=0;z<k.args.length;z++) { c.push(k.curry[z]?k.curry[z]:{t:11}); }
			r = "["+format(c)+"]";
		} return "{"+(k.args.length?"["+k.args.join(";")+"]":"")+format(k.v)+"}" + r;
	}
	if (k.t ==  6) { return k.v+"::"+format(k.r); }
	if (k.t ==  7) { return k.v+(k.r?(k.global?"::":":")+format(k.r):""); }
	if (k.t ==  8) {
		var left = (k.l?format(k.l):""); if (k.l && k.l.l) { left = "("+left+")"; }
		return left+k.v+(k.r?format(k.r):"");
	}
	if (k.t ==  9) { return (k.l?format(k.l)+" ":"")+format(k.verb)+k.v+(k.r?format(k.r):""); }
	if (k.t == 10) { return ":"+format(k.v); }
	if (k.t == 11) { return ""; }
	if (k.t == 12) { return "$["+format(k.v)+"]"; }
	if (k.t == 13) { return "@["+format(k.v)+"]"; }
	if (k.t == 14) { return ".["+format(k.v)+"]"; }
	if (k.t == 15) { return "?["+format(k.v)+"]"; }
}

// export the public interface:
this.parse = parse;
this.format = format;
this.run = run;
this.Environment = Environment;
