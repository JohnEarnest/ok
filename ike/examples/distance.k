/ 2D Distance Fields
/ (and a few shader primitives)

len:   {%+/x*x}                         / length of vector
sstep: {(3-2*t)*t*t:0|1&(z-x)%y-x}      / smoothstep (a;b;tween)
trans: {x-y}                            / (pos;offset)
scale: {x%y}                            / (pos;scale)
rot:   {t:(cos;sin)@\:y;(+/t*x;-/t*|x)} / (pos;rads)
circ:  {(-y)+len x}                     / (pos;radius)
rect:  {(0&|/d)+o:len 0|d:abs[x]-y%2}   / (pos;size)

/ rendering

size:  w
grid:  t,\:/:t:(-size%2)+!size
field: {,(;gray;255&0|_16*x''grid)}     / distance field itself
waves: {,(;solarized;8!0|_x''grid)}     / frontier waves of distance field
hard:  {,(;;0>x''grid)}                 / hard-edged object(s)

/ demo

dist: {rect[rot[x;.5];20 40]&rect[x;10 100]&circ[x+20 20;17]}
waves dist
