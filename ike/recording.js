/**
* Recording animated GIFs
*
* For the sake of simplicity, this does not perform ANY LZW compression
* or windowing, but does squash together identical sequential frames.
**/

function gifBuilder(width, height) {
	const buffer = []
	const b = x => buffer.push(x & 0xFF)
	const s = x => { b(x); b(x >> 8) }
	const t = x => x.split('').forEach(x => b(x.charCodeAt(0)))
	const c = (t,z) => { for (let x=0; x<1<<z; x++) { const c=t[x]|0; b(c>>16); b(c>>8); b(c) } }

	t('GIF89a') // header
	s(width)
	s(height)
	b(0xF1)       // global colortable, 8-bits per channel, 4 colors
	b(0)          // background color index
	b(0)          // 1:1 pixel aspect ratio
	c([0x000000,0xFFFFFF,0x00FFFF,0xFF00FF], 2) // CGA

	return {
		comment: text => {
			s(0xFE21)      // comment extension block
			b(text.length) // payload size
			t(text)        // payload
			b(0)           // terminator
		},
		loop: count => {
			s(0xFF21)      // application extension block
			b(11)          // name/version size
			t('NETSCAPE2.0')
			b(3)           // payload size
			b(1)           // data sub-block index
			s(count)       // repeat count (0 is forever)
			b(0)           // terminator
		},
		frame: (colors,pixels,delay) => {
			const z = Math.ceil(Math.log(colors.length)/Math.log(2))

			s(0xF921)      // graphic control extension
			b(4)           // payload size
			b(4)           // do not dispose frame
			s(delay)       // n/100 seconds
			b(0)           // no transparent color
			b(0)           // terminator

			b(0x2C)        // image descriptor
			s(0)           // x offset
			s(0)           // y offset
			s(width)
			s(height)
			b(0x80|(z-1))  // local colortable, 2^z colors
			c(colors, z)

			b(7)           // minimum LZW code size
			for (let off = 0; off < pixels.length; off += 64) {
				b(1 + Math.min(64,pixels.length-off)) // block size
				b(0x80)                           // CLEAR
				pixels.slice(off, off+64).forEach(b)
			}
			b(0) // end of frame
		},
		finish: _ => { b(0x3B); return buffer },
	}
}

function colorDistance(x, y) {
	const r = ((x>>16)&0xFF) - ((y>>16)&0xFF),
	      g = ((x>> 8)&0xFF) - ((y>> 8)&0xFF),
	      b = ((x    )&0xFF) - ((y    )&0xFF)
	return (r*r)+(g*g)+(b*b)
}

function repalette(pixels) {
	// find all distinct colors and their frequency
	const hist={}
	pixels.forEach(x => {
		if (x in hist) { hist[x].c++ }
		else { hist[x]={c:1, v:x} }
	})

	// cull uncommon colors > 127 by mapping them
	// to the closest available common color
	const byfreq=Object.values(hist).sort((x,y) => y.c - x.c)
	while(byfreq.length>127) {
		const e=byfreq.pop()
		let n=byfreq[0], nd=colorDistance(e.v, n.v)
		for (let x=1; x<Math.min(127,byfreq.length); x++) {
			const d=colorDistance(e.v, byfreq[x].v)
			if (d<nd) { n=byfreq[x]; nd=d }
		}
		hist[e.v]=n
	}
	byfreq.forEach((x,i) => x.i = i)

	// rebuild the image based on the new palette
	return {
		pixels: pixels.map(x => hist[x].i),
		colors: byfreq.map(x => x.v),
	}
}

function record() {
	stop()
	env = extendedEnv()
	loadresources(function() {
		const code = editor.value
		try {
			setvars()
			run(parse(code), env)
			if (!env.contains(ks('draw'))) { throw new Error('no definition of draw.') }
			if (!env.contains(ks('fc')))   { throw new Error('no definition of fc (framecount).') }
			const framecount = env.lookup(ks('fc'), true).v
			const gif = gifBuilder(canvas.width, canvas.height)
			gif.comment('made with iKe on '+new Date().toISOString())
			gif.loop()
			for (frame = 0; frame < framecount; frame++) {
				// draw/update
				setvars()
				paintValue(callko('draw', [getonce()]))
				setvars()
				env.put(ks('once'), true, callko('tick', [getonce()]))

				// produce GIF frame
				const pixels = []
				const raw = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
				for(let z = 0; z < canvas.width*canvas.height; z++) {
					const p = (raw.data[z*4]<<16) | (raw.data[z*4+1]<<8) | (raw.data[z*4+2])
					pixels.push(p)
				}
				const processed = repalette(pixels)
				gif.frame(processed.colors, processed.pixels, 0|(frameDelay()/10)) // frameDelay is in ms...
			}
			saveAs(new Blob([new Uint8Array(gif.finish())], {type: 'image/gif'}), 'recording.gif')
			showStatus('exported '+canvas.width+'x'+canvas.height+' GIF with '+framecount+' frame(s)')
		}
		catch(e) {
			console.log(e)
			showError('export GIF failed: '+e.message)
		}
	})
}
