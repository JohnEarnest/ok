
// 3d Perlin noise

// unfold two copies of a permutation array, for easy cyclic indexing.
// most implementations hardcode this table, but it's easy to generate with K:
var pp = tojs(run(parse("512#<?256"), baseEnv()));

function perlinnoise(x, y, z) {
	// find unit cube that contains point:
	var X = Math.floor(x) & 255;
	var Y = Math.floor(y) & 255;
	var Z = Math.floor(z) & 255;

	// find relative x/y/z of point in cube:
	x -= Math.floor(x);
	y -= Math.floor(y);
	z -= Math.floor(z);

	// compute fade curves for x/y/z:
	function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
	var u = fade(x);
	var v = fade(y);
	var w = fade(z);

	// hash coordinates of the 8 cube corners:
	var A = pp[X  ]+Y, AA = pp[A]+Z, AB = pp[A+1]+Z;
	var B = pp[X+1]+Y, BA = pp[B]+Z, BB = pp[B+1]+Z;

	// and add blended results from 8 corners of the cube:
	function scale(n)      { return (1 + n)/2; }
	function lerp(t, a, b) { return a + t * (b - a); }
	function grad(hash, x, y, z) {
		// convert low 4 bits of hashcode into 12 gradient directions:
		var h = hash & 15;
		var u = h<8 ? x : y;
		var v = h<4 ? y : h==12||h==14 ? x : z;
		return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
	}	
	
	return scale(lerp(w, lerp(v, lerp(u, grad(pp[AA  ], x  , y  , z   ),
										 grad(pp[BA  ], x-1, y  , z   )),
								 lerp(u, grad(pp[AB  ], x  , y-1, z   ),
										 grad(pp[BB  ], x-1, y-1, z   ))),
						 lerp(v, lerp(u, grad(pp[AA+1], x  , y  , z-1 ),
										 grad(pp[BA+1], x-1, y  , z-1 )),
								 lerp(u, grad(pp[AB+1], x  , y-1, z-1 ),
										 grad(pp[BB+1], x-1, y-1, z-1 )))));
}
