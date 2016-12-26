/ Island Generator
/ adapted from http://exupero.org/hazard/post/islands/

/ generate the vertices of a regular n-gon
/ with between 3 and 20 sides centered in screen space:

v: {(w%2)+50*(cos x;sin x)}'{(2*pi%x)*!x}3+*1?17

/ loop a sequence x, repeating the first element:

l: {(1+#x)#x}

/ generate a randomly offset midpoint
/ from two vertices x and y:

m: {(.5*x+y)+(-1 1*|x-y)*-.5+*?1}

/ subdivide a sequence of vertices by taking
/ the flat-map of the first vertex and midpoint
/ of every 2-slice of the looped sequence:

s: ,/{(x;m[x;y])}.'2':l@

/ subdivide our vertex list several times:

i: 8 s/v

/ use standard web-safe colors to draw a filled
/ blue background and then a green outlined landmass:

((w*(0 0;1 0;1 1;0 1);("black";"lightblue"))
 (i;("green";"lightgreen")))