////////////////////////////////////
//
//   A companion to oK which bridges
//   the gap between k-values and
//   native JavaScript types.
//
//   John Earnest
//
////////////////////////////////////

"use strict";

function tok(v) {
	if (v == null) { return { t:11, v:null }; }
	if (typeof v == 'number') { return { t:0, v:v }; }
	if (typeof v == 'string') {
		var r = [];
		for(var z=0;z<v.length;z++) { r[z] = { t:1, v:v.charCodeAt(z) }; }
		return { t:3, v:r };
	}
	if (v instanceof Array) {
		var r = [];
		for(var z=0;z<v.length;z++) { r[z] = tok(v[z]); }
		return { t:3, v:r };
	}
	if (typeof v == 'object') {
		var r = { t:4, k:{ t:3, v:[] }, v:{ t:3, v:[] }};
		var k = Object.keys(v);
		for(var z=0;z<k.length;z++) {
			r.k.v.push( { t:2, v:k[z] } );
			r.v.v.push( tok(v[k[z]]) );
		}
		return r;
	}
	throw new Error("cannot convert '"+v+"' to a K datatype.");
}

function tojs(v) {
	if (v.t == 0 || v.t == 11)	{ return (v.v || v.v == 0) ? v.v : null; }
	if (v.t == 2) 				{ return v.v; }
	if (v.t == 1) 				{ return String.fromCharCode(v.v); }
	if (v.t == 3) {
		var r = [];
		var same = true;
		for(var z=0;z<v.v.length;z++) { r[z] = tojs(v.v[z]); same &= v.v[z].t == v.v[0].t; }
		if (same && v.v.length != 0 && v.v[0].t == 1) { return r.join(""); }
		return r;
	}
	if (v.t == 4) {
		var r = {};
		for(var z=0;z<v.k.v.length;z++) { r[tojs(v.k.v[z])] = tojs(v.v.v[z]); }
		return r;
	}
	throw new Error("cannot convert '"+JSON.stringify(v)+"' to a JavaScript datatype.");
}

function trampoline(env, name, args, body) {
	// construct a function-wrapper trampoline for a pseudonative.
	// this permits dyadic/triadic extension functions to be properly curryable.
	var arguse = []; for(var z=0; z<args.length; z++) { arguse.push({"t":7, "v":args[z]}); }
	env.put(ks(name), true, {t: 5, args:args, v: [ {"t":8,"v":name,"curry":arguse} ]});
}

this.tok = tok;
this.tojs = tojs;
