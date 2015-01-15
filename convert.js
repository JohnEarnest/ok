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
	if (typeof v == 'number') {
		return { t:0, v:v };
	}
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
		var r = {};
		var k = Object.keys(v);
		for(var z=0;z<k.length;z++) { r[k[z]] = tok(v[k[z]]); }
		return { t:4, v:r };
	}
	throw new Error("cannot convert '"+v+"' to a K datatype.");
}

function tojs(v) {
	if (v.t == 0) {
		return v.v;
	}
	if (v.t == 1) {
		return String.fromCharCode(v.v);
	}
	if (v.t == 3) {
		var r = [];
		var same = true;
		for(var z=0;z<v.v.length;z++) { r[z] = tojs(v.v[z]); same &= v.v[z].t == v.v[0].t; }
		if (same && v.v.length != 0 && v.v[0].t == 1) { return r.join(""); }
		return r;
	}
	if (v.t == 4) {
		var r = {};
		var k = Object.keys(v.v);
		for(var z=0;z<k.length;z++) { r[k[z]] = tojs(v.v[k[z]]); }
		return r;
	}
	throw new Error("cannot convert '"+JSON.stringify(v)+"' to a JavaScript datatype.");
}

this.tok = tok;
this.tojs = tojs;
