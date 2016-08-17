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
	"dictionary", //  4 : values, k(keys)
	"function"  , //  5 : body, args, curry, env
	"view"      , //  6 : value, r, cache, depends->val
	"nameref"   , //  7 : name, l(index?), r(assignment), global?
	"verb"      , //  8 : name, l(?), r, curry?
	"adverb"    , //  9 : name, l(?), verb, r
	"return"    , // 10 : return (deprecated)
	"nil"       , // 11 :
	"cond"      , // 12 : body (list of expressions)
	"native"    , // 13 : (deprecated)
	"quote"     , // 14 : value (for quoting verbs/etc as a value)
];

var NIL = ks("");
var k0 = k(0, 0);
var k1 = k(0, 1);
var EC = [["\\","\\\\"],["\"","\\\""],["\n","\\n"],["\t","\\t"]];
var kt = [-9, -10, -11, 0, 99, 102, NaN, NaN, 107, 105, NaN, NaN, NaN, NaN];
var SP = k(1, " ".charCodeAt(0));
var NA = k(0, NaN);

function k(t, v)         { return { 't':t, 'v':v }; }
function md(x, y)        { if (y.t != 3) { y=take(k(0,len(x)),y); } return { t:4, k:x, v:y }; }
function kl(vl)          { return vl.length==1 ? vl[0] : k(3,vl); }
function kf(x)           { return match(k(3,[]), x).v || match(k0, x).v; }
function kb(x)           { return x ? k1 : k0; }
function s(x)            { return x.t == 3 && x.v.every(function(c) { return c.t == 1; }); }
function ks(x)           { return k(2, x); }
function asVerb(x, y, z) { return { t:8, v:x, l:y, r:z }; }
function kmod(x, y)      { return x-y*Math.floor(x/y); }
function len(x)          { l(x); return x.v.length; }
function krange(x, f)    { var r=[]; for(var z=0;z<x;z++) { r.push(f(z)); } return k(3,r); }
function h2(x)           { return (x.v+0x100).toString(16).substr(-2); }

function lget(x, y)    { if(y<0||y>=len(x)) { throw new Error("length error."); } return x.v[y]; }
function dget(x, y)    { var i=find(x.k, y); return (i.v==len(x.k)) ? NA : atl(x.v, i); }
function dset(x, y, z) { var i=find(x.k, y).v; if(i==len(x.k)) { x.k.v.push(y); } x.v.v[i]=z; }
function lset(x, y, v) { if (len(x) <= p(y)) { throw new Error("index error."); } x.v[y.v]=v; }
function c(x) { return (x.t==3) ? k(x.t, x.v.slice(0)) : (x.t==4) ? md(c(x.k), c(x.v)) : x; }
function stok(x) { return kl(krange(x.length, function(z) { return k(1,x.charCodeAt(z)); }).v); }
function ktos(x, esc) {
	if (x.t != 3) { x = enlist(x); }
	var h = x.v.some(function(v){ return (v.v<32||v.v>127)&v.v!=9&v.v!=10; });
	if (h) { return "0x"+x.v.map(h2).join(""); }
	var r = x.v.map(function(k) { return String.fromCharCode(k.v); }).join("");
	if (esc) { for(var z=0;z<EC.length;z++) { r=r.split(EC[z][0]).join(EC[z][1]); }}
	return esc ? '"'+r+'"' : r;
}
function kmap(x, f) { var r=[]; for(var z=0;z<len(x);z++) { r.push(f(x.v[z],z)); } return k(3,r); }
function kzip(x, y, f) {
	if (len(x) != len(y)) { throw new Error("length error."); }
	return kmap(x, function(z, i) { return f(z, y.v[i]); });
}
function checktype(n, t) {
	if (n.t == t) { return n; }
	throw new Error(typenames[t]+" expected, found "+typenames[n.t]+".");
}
function n(x) { if (x.t==0||x.t==1) { return x; } return checktype(x, 0); }
function l(x) { return checktype(x, 3); }
function d(x) { return checktype(x, 4); }
function a(x) { if (x.t > 2) { throw new Error("domain error."); } return x; }
function na(x) { return x.t === 0 && isNaN(x.v); }
function p(x) {
	n(x); if (x.v < 0 || x.v%1 != 0) { throw new Error("positive int expected."); } return x.v;
}

////////////////////////////////////
//
//   Primitive Verbs
//
////////////////////////////////////

function plus  (x, y) { return k(0, n(x).v + n(y).v); }
function minus (x, y) { return k(0, n(x).v - n(y).v); }
function times (x, y) { return k(0, n(x).v * n(y).v); }
function divide(x, y) { return k(0, n(x).v / n(y).v); }
function mod   (x, y) { return k(0, n(x).v>0 ? kmod(n(y).v, x.v) : Math.floor(n(y).v / -x.v)); }
function max   (x, y) { return na(x)?y:na(y)?x:k(0, Math.max(n(x).v, n(y).v)); }
function min   (x, y) { return                 k(0, Math.min(n(x).v, n(y).v)); }
function less  (x, y) { return kb(a(x).v < a(y).v); }
function more  (x, y) { return kb(a(x).v > a(y).v); }
function equal (x, y) { return kb((x.v == y.v) || (na(x) && na(y))); }
function join  (x, y) { return l(y).v.reduce(function(z, y) { return cat(z, cat(x, y)); }); }
function ident    (x) { return x; }
function negate   (x) { return k(0, -n(x).v); }
function first    (x) { return (x.t == 4) ? first(x.v) : (x.t != 3) ? x : len(x) ? x.v[0]:k(3,[]); }
function sqrt     (x) { return k(0, Math.sqrt(n(x).v)); }
function keys     (x) { return c(d(x).k); }
function rev      (x) { return x.t==4?md(rev(x.k),rev(x.v)):x.t==3?k(3,c(l(x)).v.reverse()):x; }
function desc     (x) { return rev(asc(x)); }
function not      (x) { return equal(n(x), k0); }
function enlist   (x) { return k(3, [x]); }
function isnull   (x) { return max(match(x, NIL),match(x,k(11))); }
function count    (x) { return k(0, x.t == 4 ? len(x.v) : x.t == 3 ? len(x) : 1); }
function floor    (x) { return k(0, Math.floor(n(x).v)); }
function type     (x) { return k(0, kt[x.t]); }
function kfmt     (x) { var r=stok(format(x, 0, 1)); if (r.t!=3) { r=k(3,[r]); } return r; }
function real     (x) { return krange(n(x).v, function() { return k(0, Math.random()); }); }

function iota(x) {
	if (x.t == 4) { return keys(x); }
	var i = krange(Math.abs(n(x).v), k.bind(null, 0)); return x.v>=0 ? i : ar(plus)(x, i);
}

function cat(x, y) {
	if (x.t==4&&y.t==4) { x=c(x); kmap(y.k, function(v) { dset(x,v,dget(y,v)); }); return x; };
	return k(3, (x.t==3?x.v:[x]).concat(y.t==3?y.v:[y]));
}

function keval(x, env) {
	return x.t == 4 ? c(x.v) : x.t == 2 ? env.lookup(x, true) : run(parse(ktos(x)), env);
}

function dfmt(x, y) {
	if ( x.t == 3           && y.t == 3) { return kzip(x, y, dfmt); }
	if ( x.t == 3           && y.t != 3) { return kmap(x, function(z) { return dfmt(z, y); }); }
	if ((x.t == 2 || !s(y)) && y.t == 3) { return kmap(y, function(z) { return dfmt(x, z); }); }
	if (x.t == 2) { return {b: k(0,y.v&1), i: k(0,y.v|0), f: k(0,y.v), c: k(1,y.v)}[x.v]; }
	if (y.t == 1) { return y; } var r=c(y); var d=Math.abs(x.v);
	while(len(r) < d) { x.v>0 ? r.v.push(SP) : r.v.unshift(SP); }
	while(len(r) > d) { x.v>0 ? r.v.pop()    : r.v.shift();     }
	return r;
}

function except(x, y) {
	x = c(x.t != 3 ? iota(x) : x); y = y.t != 3 ? enlist(y) : y;
	kmap(y, function(v) { for(var i=pfind(x, v); !na(i); i=pfind(x, v)) { x.v.splice(i.v, 1); }});
	return x;
}

function drop(x, y) {
	if (y.t == 4) { return md(drop(x, y.k), drop(x, y.v)); }
	return (y.t != 3 || len(y) < 1) ? y : k(3, n(x).v<0 ? y.v.slice(0,x.v) : y.v.slice(x.v));
}

function take(x, y, env) {
	if (x.t == 5 || x.t == 8 || x.t == 9) { return ar(atl)(y, where(each(x, y, env)), env); }
	if (y.t == 4) { return md(take(x, y.k), take(x, y.v)); }
	if (y.t != 3 || len(y) == 0) { y = enlist(y); }
	var s=n(x).v<0?kmod(x.v, len(y)):0;
	return krange(Math.abs(x.v), function(x) { return y.v[kmod(x+s, len(y))]; });
}

function reshape(x, y) {
	if (na(first(x))) { // with a leading 0N, group from innermost to outermost
		y = c(y); for(var z=len(x)-1;z>0;z--) {
			var w=[]; for(var a=0; a<len(y); a += x.v[z].v) {
				var t=[]; w.push(k(3, t));
				for(var b=0; b<x.v[z].v && a+b<len(y); b++) { t.push(y.v[a+b]); }
			} y.v = w;
		} return y;
	}
	else if (na(first(rev(x)))) { // with a trailing 0N, act like normal but don't repeat elements.
		var p=1; for(var z=0;z<len(x)-1;z++) { p*=x.v[z].v; }
		x = c(x); x.v[len(x)-1].v = Math.floor(len(y)/p);
		if (y.t != 3) { y = enlist(y); } var count = 0; var rshr = function(x, y, index) {
			if (count + x.v[index].v + 1 == len(y)) { x.v[index].v++; }
			var r=[]; for(var z=0; z<x.v[index].v && count<len(y); z++) {
				r.push(index==len(x)-1 ? y.v[count++] : rshr(x, y, index+1));
			} return k(3, r);
		}; return rshr(x, y, 0);
	}
	if (y.t != 3) { y = enlist(y); } var count = 0; function rshr(x, y, index) {
		return krange(x.v[index].v, function(z) {
			return index==len(x)-1 ? y.v[kmod(count++, len(y))] : rshr(x, y, index+1);
		});
	} return rshr(l(x), y, 0);
}

function match(x, y) {
	if (x.t != y.t) { return k0; }
	if (x.t == 4) { return min(match(x.k, y.k), match(x.v, y.v)); }
	if (x.t != 3) { return equal(x, y); }
	if (len(x) != len(y)) { return k0; }
	return kb(x.v.every(function(x,i) { return match(x, y.v[i]).v; }));
}

function find(x, y) {
	for(var z=0;z<len(x);z++) { if(match(x.v[z],y).v) { return k(0,z); } } return k(0,len(x));
}
function pfind(x, y) {
	for(var z=0;z<len(x);z++) { if(equal(x.v[z],y).v) { return k(0,z); } } return NA;
}
function pisnull(x) {
	return kb(match(x, NIL).v || match(x, k(11)).v || na(x));
}

function cut(x, y) {
	return kzip(x, cat(drop(k1,x),k(0,len(y))), function(a, b) { // {x{x@y+!z-y}[y]'1_x,#y} ?
		var r=[]; for(var z=p(a);z<p(b);z++) { r.push(lget(y,z)); } return k(3,r);
	});
}

function rnd(x, y, env) {
	if (y.t == 1) { return dfmt(k(2,"c"),rnd(x,ar(plus)(y,iota(k(0,26))))); }
	if (y.t == 3) { return ar(atl)(y, rnd(x, k(0, len(y)))); } p(y);
	if (n(x).v<0) { if (-x.v>y.v) throw new Error("length error."); return take(x,asc(real(y))); }
	return kmap(iota(x), function(x){ return k(0,Math.floor(Math.random()*y.v)); });
}

function flip(x) {
	x=eachright(k(8,"#"), over(k(8,"|"), each(k(8,"#"), x)), x);
	return krange(len(x) > 0 ? len(x.v[0]) : 0, function(z){
		return krange(len(x), function(t){ return x.v[t].v[z]; });
	});
}

function asc(x) {
	if (x.t == 4) { return ar(atl)(x.k, asc(x.v)); }
	return k(3, l(x).v.map(function(x,i) { return k(0, i); }).sort(function(a, b) {
		var av = x.v[a.v]; if (s(av)) { av = ks(ktos(av)); }
		var bv = x.v[b.v]; if (s(bv)) { bv = ks(ktos(bv)); }
		return (less(av,bv).v) ? -1 : (more(av,bv).v) ? 1 : 0;
	}));
}

function where(x) {
	if (x.t != 3) { x=enlist(x); } var r=[]; for(var z=0;z<len(x);z++) {
		for(var t=0;t<p(x.v[z]);t++) { r.push(k(0, z)); }
	} return k(3,r);
}

function group(x) {
	var r={t:4, k:unique(x)}; r.v=kmap(r.k, function(){ return k(3,[]); });
	for(var z=0;z<len(x);z++) { dget(r, x.v[z]).v.push(k(0, z)); } return r;
}

function unique(x) {
	var r=[]; for(var z=0;z<len(x);z++) {
		if (!r.some(function(e) { return match(x.v[z], e).v })) { r.push(x.v[z]); }
	} return k(3,r);
}

function split  (x, y) { return (x.t != 1) ? unpack(x, y) : call(splitimpl, k(3, [x,y])); }
function unpack (x, y) { return call(unpackimpl, k(3, [x,y])); }
function pack   (x, y) { return (x.t == 1) ? join(x, y) : call(packimpl, k(3, [x,y])); }
function kwindow(x, y) { return (x.t > 1) ? ar(atd)(x, y) : call(winimpl, k(3, [x,y])); }
function splice(xyz)   { return call(spliceimpl, k(3, xyz)); }
function imat(x)       { return call(imatimpl, k(3, [x])); }
function odometer(x)   { return call(odoimpl, k(3, [x])); }

////////////////////////////////////
//
//   Primitive Adverbs
//
////////////////////////////////////

function each(monad, x, env) {
	if (x.t == 4) { return md(x.k, each(monad, x.v, env)); }
	return kmap(x, function(x) { return applym(monad, x, env); });
}

function eachd(dyad, left, right, env) {
	if (!env) { return kmap(left, function(x) { return applyd(dyad, x, null, right); }); }
	if (left.t!=3) { return eachright(dyad, left, right, env); }
	if (right.t!=3) { return eachleft(dyad, left, right, env); }
	return kzip(left, right, function(x, y) { return applyd(dyad, x, y, env); });
}

function eachright(dyad, left, list, env) {
	return kmap(list, function(x) { return applyd(dyad, left, x, env); });
}

function eachleft(dyad, list, right, env) {
	return kmap(list, function(x) { return applyd(dyad, x, right, env); });
}

function eachprior(dyad, x, env) {
	var specials = {"+":k0, "*":k1, "-":k0, "&":first(x), ",":k(3,[]), "%":k1};
	return eachpc(dyad, (dyad.v in specials) ? specials[dyad.v] : NA, x);
}

function eachpc(dyad, x, y, env) {
	return kmap(y, function(v) { var t=x; x=v; return applyd(dyad, v, t, env); });
}

function over(dyad, x, env) {
	var specials = {"+":k0, "*":k1, "|":k(0,-1/0), "&":k(0,1/0)};
	if (x.t == 3 && len(x) < 1 && dyad.v in specials) { return specials[dyad.v]; }
	if (x.t == 3 && len(x) == 1 && dyad.v == ",") { return x.v[0].t != 3 ? x : x.v[0]; }
	if (x.t != 3 || len(x) < 1) { return x; }
	return x.v.reduce(function(x, y) { return applyd(dyad, x, y, env); });
}

function overd(dyad, x, y, env) {
	if (len(y) < 1) { return x; }
	return y.v.reduce(function(x, y) { return applyd(dyad, x, y, env); }, x);
}

function fixed(monad, x, env) {
	var r=x; var p=x;
	do { p=r; r=applym(monad, r, env); } while(!match(p, r).v && !match(r, x).v); return p;
}

function fixedwhile(monad, x, y, env) {
	if (x.t == 0) { for(var z=0;z<x.v;z++) { y = applym(monad, y, env); } }
	else { do { y = applym(monad, y, env); } while (applym(x, y, env).v != 0); } return y;
}

function scan(dyad, x, env) {
	if (x.t != 3 || len(x) < 1) { return x; } if (len(x) == 1) { return first(x); }
	var r=[x.v[0]];
	for(var z=1;z<len(x);z++) { r.push(applyd(dyad, r[z-1], x.v[z], env)); } return k(3,r);
}

function scand(dyad, x, y, env) {
	return kmap(y, function(v) { return x = applyd(dyad, x, v, env); });
}

function scanfixed(monad, x, env) {
	var r=[x]; while(true) {
		var p = r[r.length-1]; var n = applym(monad, p, env);
		if (match(p, n).v || match(n, x).v) { break; } r.push(n);
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
	return function recur(value, env) {
		if (value.t == 4) { return md(value.k, recur(value.v, env)); }
		if (value.t != 3) { return monad(value, env); }
		return kmap(value, function(x) { return recur(x, env); });
	};
}
function ad(dyad) { // create an atomic dyad
	return function recur(left, right, env) {
		if (left.t == 4 && right.t == 4) {
			var r=md(k(3,[]),k(3,[])); kmap(unique(cat(left.k,right.k)), function(k) {
				var a=dget(left,k), b=dget(right,k); dset(r,k,a==NA?b:b==NA?a:dyad(a,b,env));
			}); return r;
		}
		if (left.t  == 4) { return md(left.k,  recur(left.v, right, env)); }
		if (right.t == 4) { return md(right.k, recur(left, right.v, env)); }
		if (left.t != 3 && right.t != 3) { return dyad(left, right, env); }
		if (left.t  != 3) { return kmap(right, function(x) { return recur(left, x, env); }); }
		if (right.t != 3) { return kmap(left,  function(x) { return recur(x, right, env); }); }
		return kzip(left, right, function(x,y) { return recur(x, y, env); });
	};
}
function ar(dyad) { // create a right atomic dyad
	return function recur(left, right, env) {
		if (right.t != 3) { return dyad(left, right, env); }
		return kmap(right, function(x) { return recur(left, x, env); });
	};
}

function applym(verb, x, env) {
	if (verb.t == 5) { return call(verb, k(3,[x]), env); }
	if (verb.t == 3) { return atl(verb, x, env); }
	if (verb.t == 9 & verb.r == null) { verb.r=x; var r=run(verb, env); verb.r=null; return r; }
	if (verb.sticky) {
		var s=verb.sticky; s.r=x; verb.sticky=null;
		var r=run(verb, env); verb.sticky=s; s.r=null; return r;
	}
	return applyverb(verb, [x], env);
}

function applyd(verb, x, y, env) {
	if (verb.t == 5) { return call(verb, k(3,[x,y]), env); }
	if (verb.sticky && verb.sticky != verb) {
		var s=verb.sticky; s.l=x; s.r=y; verb.sticky=null;
		var r=run(verb, env); verb.sticky=s; s.r=null; s.l=null; return r;
	}
	return applyverb(verb, [x, y], env);
}

var verbs = {
	//     a          l           a-a         l-a         a-l         l-l         triad    tetrad
	"+" : [ident,     flip,       ad(plus),   ad(plus),   ad(plus),   ad(plus),   null,    null  ],
	"-" : [am(negate),am(negate), ad(minus),  ad(minus),  ad(minus),  ad(minus),  null,    null  ],
	"*" : [first,     first,      ad(times),  ad(times),  ad(times),  ad(times),  null,    null  ],
	"%" : [sqrt,      am(sqrt),   ad(divide), ad(divide), ad(divide), ad(divide), null,    null  ],
	"!" : [iota,      odometer,   mod,        md,         ar(mod),    md,         null,    null  ],
	"&" : [where,     where,      ad(min),    ad(min),    ad(min),    ad(min),    null,    null  ],
	"|" : [rev,       rev,        ad(max),    ad(max),    ad(max),    ad(max),    null,    null  ],
	"<" : [asc,       asc,        ad(less),   ad(less),   ad(less),   ad(less),   null,    null  ],
	">" : [desc,      desc,       ad(more),   ad(more),   ad(more),   ad(more),   null,    null  ],
	"=" : [imat,      group,      ad(equal),  ad(equal),  ad(equal),  ad(equal),  null,    null  ],
	"~" : [am(not),   am(not),    match,      match,      match,      match,      null,    null  ],
	"," : [enlist,    enlist,     cat,        cat,        cat,        cat,        null,    null  ],
	"^" : [pisnull,   am(pisnull),except,     except,     except,     except,     null,    null  ],
	"#" : [count,     count,      take,       reshape,    take,       reshape,    null,    null  ],
	"_" : [am(floor), am(floor),  drop,       null,       drop,       cut,        null,    null  ],
	"$" : [kfmt,      am(kfmt),   dfmt,       dfmt,       dfmt,       dfmt,       null,    null  ],
	"?" : [real,      unique,     rnd,        pfind,      rnd,        ar(pfind),  splice,  null  ],
	"@" : [type,      type,       atd,        atl,        atd,        ar(atl),    amend4,  amend4],
	"." : [keval,     keval,      call,       call,       call,       call,       dmend4,  dmend4],
	"'" : [null,      null,       null,       atl,        kwindow,    ar(atl),    null,    null  ],
	"/" : [null,      null,       null,       null,       pack,       pack,       null,    null  ],
	"\\": [null,      null,       null,       unpack,     split,      null,       null,    null  ],
};

function applyverb(node, args, env) {
	if (node.curry) {
		var a=[]; var i=0; for(var z=0;z<node.curry.length;z++) {
			if (!isnull(node.curry[z]).v) { a[z]=run(node.curry[z], env); continue; }
			while(i<args.length && !args[i]) { i++; } if (!args[i]) { return node; }
			a[z]=args[i++];
		} args = a;
	}
	if (node.t == 9) { return applyadverb(node, node.verb, args, env); }
	var left  = args.length == 2 ? args[0] : node.l ? run(node.l, env) : null;
	var right = args.length == 2 ? args[1] : args[0];
	if (!right) { return { t:node.t, v:node.v, curry:[left,k(11)] }; }
	var r = null; var v = verbs[node.forcemonad ? node.v[0] : node.v];
	if (!v) {}
	else if (args.length == 3)            { r = v[6]; }
	else if (args.length == 4)            { r = v[7]; }
	else if (!left       && right.t != 3) { r = v[0]; }
	else if (!left       && right.t == 3) { r = v[1]; }
	else if (left.t != 3 && right.t != 3) { r = v[2]; }
	else if (left.t == 3 && right.t != 3) { r = v[3]; }
	else if (left.t != 3 && right.t == 3) { r = v[4]; }
	else if (left.t == 3 && right.t == 3) { r = v[5]; }
	if (!r) { throw new Error("invalid arguments to "+node.v); }
	if (args.length > 2) { return r(args, env); }
	return tracer(node.v, left, null, right, env,
		(left ? r(left, right, env) : r(right, env)));
}

function valence(node, env) {
	if (node.t == 5)     {
		if (!node.curry) { return node.args.length; } var r=node.args.length;
		for(var z=0;z<node.curry.length;z++) { if (!isnull(node.curry[z]).v) { r--; } } return r;
	}
	if (node.t == 7) { return valence(env.lookup(ks(node.v))); }
	if (node.t == 9 && node.v == "'") { return valence(node.verb, env); }
	if (node.t == 9)       { return 1; }
	if (node.t != 8)       { return 0; }
	if (node.forcemonad)   { return 1; }
	if (node.v in natives) { return 1; }
	if (node.sticky) {
		if (node.sticky.t == 9)                      { return 1; }
		if (node.sticky.forcemonad || node.sticky.l) { return 1; }
	}
	return 2;
}

var adverbs = {
	//       mv/nv       dv          l-mv         l-dv
	"':"  : [null,       eachprior,  null,        eachpc   ],
	"'"   : [each,       eachd,      eachd,       eachd    ],
	"/:"  : [null,       null,       eachright,   eachright],
	"\\:" : [null,       null,       eachleft,    eachleft ],
	"/"   : [fixed,      over,       fixedwhile,  overd    ],
	"\\"  : [scanfixed,  scan,       scanwhile,   scand    ],
};

function applyadverb(node, verb, args, env) {
	if (verb.t == 7) { verb = run(verb, env); }
	var r = null; var v = valence(verb, env);
	if (v == 0 && verb.t != 5) { return applyverb(k(8,node.v), [verb, args[1]], env); }
	if (v == 0 && verb.t == 5) { v = 1; }
	if (v == 2 && !args[1])    { args = [null, args[0]]; }
	if (v == 1 && !args[0])    { r = adverbs[node.v][0]; }
	if (v == 2 && !args[0])    { r = adverbs[node.v][1]; }
	if (v == 1 &&  args[0])    { r = adverbs[node.v][2]; }
	if (v == 2 &&  args[0])    { r = adverbs[node.v][3]; }

	if (!r) { throw new Error("invalid arguments to "+node.v+" ["+
		(args[0]?format(args[0])+" ":"")+" "+format(verb)+" (valence "+v+"), "+format(args[1])+"]");
	}
	return tracer(node.v, args[0], verb, args[1], env,
		(args[0] ? r(verb, args[0], args[1], env) : r(verb, args[1], env)));
}

function Environment(pred) {
	this.p = pred; this.d = md(k(3,[]), k(3,[]));
	this.put = function(n, g, v) {
		if(typeof n == "string") n = ks(n);
		if (g && this.p) { this.p.put(n, g, v); } else { dset(this.d, n, v); }
	};
	this.contains = function(x) { return find(this.d.k, x).v != len(this.d.k); }
	this.lookup = function(n, g) {
		if (g && this.p) { return this.p.lookup(n, g); }
		if (!this.contains(n)) {
			if (!this.p) { throw new Error("the name '"+n.v+"' has not been defined."); }
			return this.p.lookup(n);
		}
		var view = dget(this.d, n);
		if (view.t == 6) {
			var dirty = view.cache == 0;
			var keys = Object.keys(view.depends);
			for(var z=0;z<keys.length;z++) {
				var n = this.lookup(ks(keys[z])); var o = view.depends[keys[z]];
				if (!o || !match(n,o).v) { dirty = true; view.depends[keys[z]] = n; }
			}
			if (dirty) { view.cache = run(view.r, this); }
			return view.cache;
		}
		return view;
	};
}

function atd(x, y, env) {
	if (x.t == 2) { return x; }
	if (x.t == 3) { return atl(x, y, env); }
	if (x.t == 5) { return call(x, k(3,[y]), env); }
	if (x.t == 8 || x.t == 9) { return applym(x, y, env); }
	d(x); return dget(x, y);
}

function atl(x, y, env) {
	if (x.t == 4) { return dget(x, y); }
	if (y.t == 4) { return md(y.k, (ar(atl))(x, y.v, env)); }
	if (y.t > 1 || y.v < 0 || y.v >= len(x) || y.v%1 != 0) { return NA; }
	return x.v[y.v];
}

function atdepth(x, y, i, env) {
	if (i >= len(y)) { return x; }
	if (isnull(y.v[i]).v) { return kmap(x, function(x) { return atdepth(x, y, i+1, env); }); }
	if (y.v[i].t != 3) { return atdepth(ar(atl)(x, y.v[i], env), y, i+1, env); }
	return kmap(y.v[i], function(t) { return atdepth(ar(atl)(x, t, env), y, i+1, env); });
}

function call(x, y, env) {
	if (x.sticky) { return (valence(x.sticky, env)==1?applym:applyd)(x, y.v[0], y.v[1]); }
	if (x.t == 4) { return y.t == 3 ? atdepth(x, y, 0, env) : dget(x, y); }
	if (x.t == 2) { return x; }
	if (y.t == 0) { return atd(x, y, env); }
	if (y.t == 3 && len(y) == 0) { return (x.t==5&&x.args.length==0) ? run(x.v, env) : x; }
	if (x.t == 3 && y.t == 3) { return atdepth(x, y, 0, env); }
	if (x.t == 8) { return applyverb(x, y.t == 3 ? y.v : [y], env); }
	if (x.t == 9) { return applyadverb(x, x.verb, y.v, env); }
	if (x.t != 5) { throw new Error("function or list expected."); }
	if (y.t == 4) { var e=new Environment(null); e.d=y; x.env=e; return x; }
	if (y.t != 3) { y = enlist(y); }
	var environment = new Environment(x.env); var curry = x.curry?x.curry.concat([]):[];
	if (x.args.length != 0 || len(y) != 1 || !isnull(y.v[0]).v) {
		var all=true; var i=0; for(var z=0;z<x.args.length;z++) {
			if (curry[z] && !isnull(curry[z]).v) { continue; }
			if (i >= len(y)) { all=false; break; }
			if (y.v[i] == null || isnull(y.v[i]).v) { all=false; }
			curry[z]=y.v[i++];
		}
		if (!all) { return { t:5, v:x.v, args:x.args, env:x.env, curry:curry }; }
		if (i < len(y) && x.args.length != 0) { throw new Error("valence error."); }
		for(var z=0;z<x.args.length;z++) { environment.put(ks(x.args[z]), false, curry[z]); }
	}
	environment.put(ks("o"), false, x); return run(x.v, environment);
}

function run(node, env) {
	if (node.t == 14) { return run(node.v, env); }
	if (node instanceof Array) { var r; node.forEach(function(v) { r=run(v, env); }); return r; }
	if (node.t == 8 && node.curry && !node.r) { return applyverb(node, [], env); }
	if (node.sticky) { return node; }
	if (node.t == 3) { return rev(kmap(rev(node), function(v) { return run(v, env); })); }
	if (node.t == 4) { return md(node.k, kmap(node.v, function(x) { return run(x, env); })); }
	if (node.t == 5 && node.r) { return call(node, k(3,[run(node.r, env)]), env); }
	if (node.t == 6) { env.put(ks(node.v), false, node); return node; }
	if (node.t == 7) {
		if (node.r) { env.put(ks(node.v), node.global, run(node.r, env)); }
		return env.lookup(ks(node.v));
	}
	if (node.t == 8 && node.r) {
		var right = run(node.r, env);
		var left  = node.l ? run(node.l, env) : null;
		return applyverb(node, [left, right], env);
	}
	if (node.t == 9 && node.r) {
		var right = run(node.r, env);
		var verb  = run(node.verb, env);
		var left  = node.l ? run(node.l, env) : null;
		return applyadverb(node, verb, [left, right], env);
	}
	if (node.t == 12) {
		for(var z=0;z<node.v.length-1;z+=2) {
			if (!kf(run(node.v[z], env))) { return run(node.v[z+1], env); }
		} return run(node.v[node.v.length-1], env);
	}
	if (node.t == 5 && !node.env) {
		return { t:5, v:node.v, args:node.args, curry:node.curry, env:env };
	}
	return node;
}

function amend4(args, env) { return mend(args, env, amendm, amendd); }
function dmend4(args, env) { return mend(args, env, dmend, dmend); }

function mend(args, env, monadic, dyadic) {
	var ds = args[0], i = args[1], f = args[2], y = args[3];
	(y?dyadic:monadic)(ds.t == 2 ? env.lookup(ds,true) : ds, i, y, f, env); return ds;
}

function amendm(d, i, y, monad, env) {
	if (monad.t == 0) { monad = { t:5,args:["x"],v:[{ t:0, v:monad.v }] }; }
	if (i.t != 3) { lset(d, i, applym(monad, atl(d, i, env), env)); return; }
	kmap(i, function(v) { amendm(d, v, y, monad, env); });
}

function amendd(d, i, y, dyad, env) {
	if      (i.t==3&y.t==3) { for(var z=0;z<len(i);z++) { amendd(d,i.v[z],y.v[z],dyad,env); } }
	else if (i.t==3&y.t!=3) { for(var z=0;z<len(i);z++) { amendd(d,i.v[z],y     ,dyad,env); } }
	else if (d.t==4)        { dset(d, i, applyd(dyad, atl(d, i, env), y, env)); }
	else                    { lset(d, i, applyd(dyad, atl(d, i, env), y, env)); }
}

function dmend(d, i, y, f, env) {
	if (i.t != 3) { (y?amendd:amendm)(d, i, y, f, env); return; }
	if (len(i) == 1) { dmend(d, i.v[0], y, f, env); return; }
	var rest = drop(k1,i); if (len(i)<1) { return; } if (i.v[0].t == 3) {
		if (y && y.t == 3) { kzip(i, y, function(a, b) { amendd(d, a, b, f, env); }); return; }
		kmap(i.v[0],function(x) { dmend(atl(d,x,env), rest, y, f, env); });
	}
	else if (isnull(i.v[0]).v) { kmap(d,function(x,i) { dmend(atl(d,k(0,i),env),rest,y,f,env); }); }
	else if (d.v[0].t != 3) { (y?amendd:amendm)(d, i, y, f, env); }
	else { dmend(atl(d, first(i), env), rest, y, f, env); }
}

////////////////////////////////////
//
//   Tokenizer
//
////////////////////////////////////

var NUMBER  = /^(-?0w|0N|-?\d*\.?\d+)/;
var HEXLIT  = /^0x[a-zA-Z\d]+/;
var BOOL    = /^[01]+b/;
var NAME    = /^[a-z][a-z\d]*/i;
var SYMBOL  = /^`([a-z][a-z0-9]*)?/i;
var STRING  = /^"(\\.|[^"\\\r\n])*"/;
var VERB    = /^[+\-*%!&|<>=~,^#_$?@.]/;
var ASSIGN  = /^[+\-*%!&|<>=~,^#_$?@.]:/;
var IOVERB  = /^\d:/;
var ADVERB  = /^['\\\/]:?/;
var SEMI    = /^;/;
var COLON   = /^:/;
var VIEW    = /^::/;
var COND    = /^\$\[/;
var DICT    = /^\[[a-z]+:/i;
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
desc[COLON  ]="':'"   ;desc[VIEW   ]="view"   ;desc[COND   ]="'$['"  ;desc[APPLY ]="'.'";
desc[OPEN_B ]="'['"   ;desc[OPEN_P ]="'('"    ;desc[OPEN_C ]="'{'"   ;desc[ASSIGN]="assignment";
desc[CLOSE_B]="']'"   ;desc[CLOSE_P]="')'"    ;desc[CLOSE_C]="'}'";

var text = "";
var funcdepth = 0;
function begin(str) {
	str = str.replace(/("(?:[^"\\\n]|\\.)*")|(\s\/.*)|([a-z\d\]\)]-\.?\d)/gi, function(_, x, y, z) {
		// preserve a string (x), remove a comment (y), disambiguate a minus sign (z)
		return x ? x : y ? "" : z.replace('-', '- ')
	})
	text = str.trim().replace(/\n/g, ";"); funcdepth = 0;
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
	if (node == null)          { return names; }
	if (node instanceof Array) { node.forEach(function(v) { findNames(v, names); }); return names; }
	if (node.t == 7)           { names[node.v] = 0; }
	if (node.t != 5)           { findNames(node.v, names); }
	return findNames([node.l, node.r, node.verb, node.curry], names);
}

function atNoun() {
	return !done()&&at(NUMBER)||at(NAME)||at(SYMBOL)||at(STRING)||at(COND)||at(OPEN_P)||at(OPEN_C);
}

function indexedassign(node, indexer) {
	var op = { t:5, args:["x","y"], v:[{ t:7, v:"y" }] }; // {y}
	var gl = matches(COLON);
	var ex = parseEx(parseNoun());
	//t[x]::z  ->  ..[`t;x;{y};z]   t[x]:z  ->  t:.[t;x;{y};z]
	if (!gl) { node.r = { t:8, v:".", curry:[ k(7,node.v), kl(indexer), op, ex] }; return node; }
	return { t:8, v:".", r:{ t:8, v:".", curry:[ks(node.v), kl(indexer), op, ex] }};
}

function compoundassign(node, indexer) {
	if (!at(ASSIGN)) { return node; }
	var op = expect(ASSIGN).slice(0,1); var gl = matches(COLON); var ex = parseEx(parseNoun());
	if (!indexer) {
		// t+::z  -> t::(.`t)+z
		var v = gl ? asVerb(".", null, ks(node.v)) : node;
		return { t:node.t, v:node.v, global:gl, r:asVerb(op, v, ex) };
	}
	// t[x]+::z -> ..[`t;x;+:;z]   t[x]+:z -> t:.[t;x;{y};z]
	if (!gl) { node.r={ t:8, v:".", curry:[ k(7,node.v),kl(indexer),asVerb(op),ex] }; return node; }
	return asVerb(".", null, { t:8, v:".", curry:[ks(node.v), indexer, asVerb(op), ex] });
}

function applycallright(node) {
	while (matches(OPEN_B)) {
		var args = parseList(CLOSE_B); node = asVerb(".", node, k(3, args.length ? args : [NIL]));
	} return node;
}

function applyindexright(node) {
	if (node.sticky && at(VERB)) {
		var x = parseNoun(); x.l = node; x.r = parseEx(parseNoun()); return x;
	}
	while (matches(OPEN_B)) { node = asVerb(".", node, k(3, parseList(CLOSE_B))); }
	return node;
}

function findSticky(root) {
	var n = root; if (n == null || (n.t == 9 && n.r == null)) { return; }
	while(n.t == 8 && !n.curry || n.t == 9) {
		if (n.r == null) { root.sticky = n; return; } n = n.r;
	}
}

function parseList(terminal, cull) {
	var r=[]; do {
		if (terminal && at(terminal)) { break; }
		while(matches(SEMI)) { if (!cull) { r.push(k(11)); } }
		var e = parseEx(parseNoun()); findSticky(e);
		if (e != null) { r.push(e); }
		else if (!cull) { r.push(k(11)); }
	} while(matches(SEMI)); if (terminal) { expect(terminal); } return r;
}

function parseNoun() {
	if (matches(COLON)) { return { t:5, args:["x","y"], v:[{ t:7, v:"y" }] }; } // {y}
	if (at(IOVERB)) { return k(8, expect(IOVERB)); }
	if (at(BOOL)) {
		var n = expect(BOOL); var r=[];
		for(var z=0;z<n.length-1;z++) { r.push(k(0, parseInt(n[z]))); }
		return applyindexright(k(3, r));
	}
	if (at(HEXLIT)) {
		var h=expect(HEXLIT); if (h.length%2) { throw new Error("malformed byte string."); }
		var r=krange(h.length/2-1, function(z) { return k(1,parseInt(h.slice(2*z+2,2*z+4),16)); });
		return (r.v.length == 1) ? first(r) : r;
	}
	if (at(NUMBER)) {
		var r=[]; while(at(NUMBER)) {
			var n=expect(NUMBER); r.push(k(0, n=="0w"?1/0:n=="-0w"?-1/0:n=="0N"?NaN:parseFloat(n)));
		} return applyindexright(kl(r));
	}
	if (at(SYMBOL)) {
		var r=[]; while(at(SYMBOL)) { r.push(k(2, expect(SYMBOL).slice(1))); }
		return applyindexright(kl(r));
	}
	if (at(STRING)) {
		var str = expect(STRING); str = str.substring(1, str.length-1);
		for(var z=0;z<EC.length;z++) { str=str.split(EC[z][1]).join(EC[z][0]); }
		return applyindexright(stok(str));
	}
	if (matches(OPEN_B)) {
		var m=md(k(3,[]), k(3,[])); if (!matches(CLOSE_B)) { do {
			var key = ks(expect(NAME)); expect(COLON);
			dset(m, key, matches(COLON) ? dget(m, ks(expect(NAME))) : parseEx(parseNoun()));
		} while(matches(SEMI)); expect(CLOSE_B); } return applyindexright(m);
	}
	if (matches(OPEN_C)) {
		var args=[]; if (matches(OPEN_B)) {
			do { args.push(expect(NAME)); } while(matches(SEMI)); expect(CLOSE_B);
		}
		var r = k(5, parseList(CLOSE_C, true));
		if (args.length == 0) {
			var names = findNames(r.v, {});
			if      ("z" in names) { args = ["x","y","z"]; }
			else if ("y" in names) { args = ["x","y"]; }
			else if ("x" in names) { args = ["x"]; }
		}
		r.args = args; return applycallright(r);
	}
	if (matches(OPEN_P)) { return applyindexright(kl(parseList(CLOSE_P))); }
	if (matches(COND))   { return k(12, parseList(CLOSE_B, true)); }
	if (at(VERB)) {
		var r = k(8, expect(VERB));
		if (matches(COLON)) { r.v += ":"; r.forcemonad = true; }
		if (at(OPEN_B) && !at(DICT)) {
			expect(OPEN_B); r.curry = parseList(CLOSE_B, false);
			if (r.curry.length < 2 && !r.forcemonad) { r.curry.push(k(11)); }
		} return r;
	}
	if (at(NAME)) {
		var n = k(7, expect(NAME));
		if (n.v in natives) { return applycallright(k(8, n.v)); }
		if (toplevel() && matches(VIEW)) {
			var r = k(6, n.v);
			r.r = parseEx(parseNoun());
			r.depends = findNames(r.r, {});
			r.cache = 0;
			return r;
		}
		if (matches(COLON)) {
			n.global = matches(COLON); n.r = parseEx(parseNoun());
			if (n.r == null) { throw new Error("noun expected following ':'."); }
			findSticky(n.r); if (n.r == n.r.sticky) { n.r.sticky = null; }
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
	if (at(OPEN_B)) { return applycallright({ t:9, v:a, verb:verb, l:left }); }
	return { t:9, v:a, verb:verb, l:left, r:parseEx(parseNoun()) };
}

function parseEx(node) {
	if (node == null) { return null; }
	if (at(ADVERB)) { return parseAdverb(null, node); }
	if (node.t == 8 && !node.r) {
		var p = at(OPEN_P); var x = parseNoun();
		node.r = parseEx((p && x.t == 8) ? k(14, x) : x); node.sticky = null;
	}
	if (atNoun() && !at(IOVERB)) {
		var x = parseNoun();
		if (x.t == 7 && x.v in infix) { return asVerb(".", x, k(3, [node, parseEx(parseNoun())])); }
		if (at(ADVERB)) { return parseAdverb(node, x); }
		return asVerb("@", node, parseEx(x));
	}
	if (at(VERB) || at(IOVERB)) {
		var x = parseNoun();
		if (x.forcemonad) { node.r = parseEx(x); return node; }
		if (at(ADVERB)) { return parseAdverb(node, x); }
		x.l = node; x.r = parseEx(parseNoun()); node = x;
	}
	return node;
}

function parse(str) {
	begin(" "+str); var r = parseList(null, false); if (done()) { return r; }
	throw new Error("unexpected character '"+text[0]+"'");
}

////////////////////////////////////
//
//   Prettyprinter
//
////////////////////////////////////

function format(k, indent, symbol) {
	if (typeof indent == "number") { indent = ""; } if (k == null) { return ""; }
	function indented(k) { return format(k, indent+" "); };
	if (k instanceof Array) { return k.map(format).join(";"); }
	if (k.sticky) { var s=k.sticky; k.sticky=null; var r=format(k); k.sticky=s; return "("+r+")"; }
	if (k.t == 0) {
		return k.v==1/0?"0w":k.v==-1/0?"-0w":na(k)?"0N":
		""+(k.v % 1 === 0 ? k.v : Math.round(k.v * 10000) / 10000);
	}
	if (k.t == 1) { return ktos(k,true); }
	if (k.t == 2) { return (symbol==1?"":"`")+k.v; }
	if (k.t == 3) {
		if (len(k) <  1) { return "()"; }
		if (len(k) == 1) { return ","+format(k.v[0]); }
		var same = true; var sublist = false; indent = indent || "";
		for(var z=0;z<len(k);z++) { same &= k.v[z].t == k.v[0].t; sublist |= k.v[z].t == 3; }
		if (sublist) { return "("+k.v.map(indented).join("\n "+indent)+")"; }
		if (same & k.v[0].t == 1) { return ktos(k, true); }
		if (same & k.v[0].t <  3) { return k.v.map(format).join(k.v[0].t == 2 ? "" : " "); }
		return "("+k.v.map(format).join(";")+")" ;
	}
	if (k.t == 4) {
		if (len(k.k)<1 || k.k.v[0].t != 2)
		{ var t=format(k.k); if (len(k.k)==1) { t="("+t+")"; } return t+"!"+format(k.v); }
		return "["+kzip(k.k,k.v,function(x,y){return x.v+":"+format(y);}).v.join(";")+"]";
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
		if (k.curry) { return k.v+"["+format(k.curry)+"]"+format(k.r); }
		var left = (k.l?format(k.l):""); if (k.l && k.l.l) { left = "("+left+")"; }
		return left+k.v+(k.r?format(k.r):"");
	}
	if (k.t ==  9) { return (k.l?format(k.l)+" ":"")+format(k.verb)+k.v+format(k.r); }
	if (k.t == 11) { return ""; }
	if (k.t == 12) { return "$["+format(k.v)+"]"; }
	if (k.t == 14) { return "("+format(k.v)+")"; }
}

// js natives and k natives:
var natives = {"log":0,"exp":0,"cos":0,"sin":0};
var infix   = {"o":0,"in":0};
function nmonad(n, f) { verbs[n]=[f, am(f), null,null,null,null,null,null]; }
function baseEnv() {
	var env = new Environment(null);
	nmonad("log", function(x) { return k(0, Math.log(n(x).v)) });
	nmonad("exp", function(x) { return k(0, Math.exp(n(x).v)) });
	nmonad("cos", function(x) { return k(0, Math.cos(n(x).v)) });
	nmonad("sin", function(x) { return k(0, Math.sin(n(x).v)) });
	run(parse("prm:{{$[x;,/x,''o'x^/:x;,x]}@$[-8>@x;!x;x]}"), env);
	run(parse("in:{~^y?x}"), env);
	return env;
}

var packimpl   = parse("{+/y*|*\\1,|1_(#y)#x}")[0];
var unpackimpl = parse("{(1_r,,y)-x*r:|y(_%)\\|x}")[0];
var spliceimpl = parse("{,/(*x;$[99<@z;z x 1;z];*|x:(0,y)_x)}")[0];
var imatimpl   = parse("{x=/:x:!x}")[0];
var winimpl    = parse("{$[0>x;3'0,y,0;y(!0|1+(#y)-x)+\\:!x]}")[0];
var odoimpl    = parse("{+x\\'!*/x}")[0];
var splitimpl  = parse("{1_'(&x=y)_y:x,y}")[0];

// export the public interface:
function setIO(symbol, slot, func) {
	if (!(symbol in verbs)) { verbs[symbol]=[null,null,null,null,null,null]; }
	verbs[symbol][slot] = func;
}
var tracer = function(verb, a, v, b, env, r) { return r; }
function setTrace(t) { tracer = t; }

this.version = "0.1";
this.parse = parse;
this.format = format;
this.run = run;
this.Environment = Environment;
this.baseEnv = baseEnv;
this.setIO = setIO;
this.setTrace = setTrace;
