/ HexScape
/ adapted from https://gist.github.com/JohnEarnest/9147835
/ which in turn was based on a GIF I found somewhere...

hex:   {+x*(cos;sin)@\:(pi%3)*!7}                  / radius -> hex
hole:  {(hex x),|hex y}                            / (outer;inner) -> poly
pulse: {                                           / anim offset -> poly
	e:1+e*e*e:-1+1! a:2!x+.02*f                    / ease, anim timer
	hole.$[a>1;30*1,e;e*30 0]                      / eased holes
}

warp:  {                                           / fisheye warp (x;y) by z
	r:%+/(x*x;y*y)                                 / polar radius
	a:atan2[y;x]                                   / polar angle
	(cos a;sin a)*\:s*tanh r%s:w*z                 / hyperbolic, -> cartesian
}

hv:    30*cos pi%6                                 / vertical offset (radius 30)
hh:    2*hv*cos pi%6                               / horizontal offset
grid:  +2-!5 5                                     / {[-2,2],[-2,2]}
hgrid: ,/{(2*hh*x;2*hv*y)-/:(0 0;hh,hv)}.'grid     / hex origins
offs:  4 0N#2*?4*#hgrid                            / animation offsets

zd:    1.7 1.4 1.1 1.0
pal:   ("#21FFF2";"#FF7F00";"#FB0007";"#1E1400";"#00000000")
place: {(+80+warp[;;zd x].y++pulse[z];pal 4,x)}    / place hex at (z;pos;off)
draw:  {,/{place[x]'[hgrid;offs x]}'!4}            / draw all layers

w:h: 160; fc: 100
