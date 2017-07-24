/ Brownian Economy

/ "Imagine a room full of 100 people with 100 dollars each.
/  With every tick of the clock, every person with money gives
/  a dollar to one randomly chosen other person. After some
/  time progresses, how will the money be distributed?"

p: 72                                       / players
c: {(+/(!#x)=/:(+/t)?#x)-t:0<x}             / change (per round)

b: {[c;p;y;x](p+0,2*y;;x#c)}                / draw bar (color;pos;y;x)
g: {x'[!#y;_60*y%|/y]}                      / draw graph (bar;data)

once: p#100                                 / initial scores
tick: {20{x+c x}/x}                         / iterate several steps/frame
draw: {g[b[3;10 10];x@<x],g[b[2;90 10];x]}  / graph sorted, raw value
