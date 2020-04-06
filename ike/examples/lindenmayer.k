/ Fun with Lindenmayer Systems

p:   0 0                           / turtle position
d:   0                             / turtle direction
F:   {p+::(cos d;sin d)}           / move the turtle forward
r:   {,/$[y>1;rz[x].\:y-1;F[]]}    / recursively apply a rule
s:   0N 2#(^)_                     / filter rotates out of vertex list
dim: {(|/'x)-&/'x}@+               / dimensions of the polygon
scl: w%|/dim@                      / rescale polygon
off: {(.5*w-dim x)-&/'+x}          / offset polygon
cnt: {+off[t]++t:x*scl x}          / center polygon

/ sierpinski gasket
t:  pi*2%3                         / turn angle
rz: [R:{d+::t;0N}                  / move the turtle right
     L:{d-::t;0N}                  / move the turtle left
     a:r `a`L`b`R`a`R`b`L`a
     b:r `b`b]

/ animate
shape:  cnt s rz[`a]6
wiggle: {x+0N 2#1.3*(?2*#x)-.5}
draw::  ,(((#shape)!f)#wiggle shape;cga@2 3)
