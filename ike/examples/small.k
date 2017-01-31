
/ trail
spr:  1+,/'+text"oK"
pos:  50 2#100?w
mm:   {pos::50#(,x,y),pos}
tick: {pos::w!pos+(#pos;2)#(2*#pos)?-1 0 1}
draw: {,`pos`lcd`spr}

/ vortex
bmp:  {x,|x}'{x,|x}t{_%(x*x)+y*y}\:t:|!80
pal:  (|t),t:8#solarized
draw: {,(;`pal;(#pal)!bmp+f)}

/ marching ants

edge: {|+(4!f+!#x),'x}
draw: {,(;`cga;4 edge/64 64#0)}

/ word vortex

bobs:  2+text"We Like iKe"
words: {+({,_80+60*(cos x;sin x)}'.5*(.1*f)+!11;`cga;bobs)}
bmp:   {x,|x}'{x,|x}t{_%(x*x)+y*y}\:t:|!70
pal:   (|t),t:8#solarized
vortx: {,(;`pal;(#pal)!bmp+f)}
draw:  {vortx[],words[]}

/ keyboard tester

draw:: ,(;cga;30#,2+|/(-1,keys)=\:!128)

/ fermat spiral

fs:   {(%t)*(sin t;cos t:137.508*x)}'!
draw: {,(80+.2*fs f;`lcd;2)}
