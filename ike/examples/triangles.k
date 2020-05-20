/ Positive-Negative Triangles

ang:  2*pi%3  / triangle third
rad:  20      / triangle radius
fc:   200     / frames in anim
sp:   .01     / speed

/ draw and animate a triangle 
tri:  {+x*(cos;sin)@\:y+ang*!3} / (radius;angle)
spin: {                         / 1:left, -1:right
	a:2!sp*f; c:x~-1; b:c*pi
	r:b+(2*ang)*x*.5*1-cos pi*1!a
	tri.$[c=1<a;(rad;b);(rad+10*sin 2*pi*1!a;r)]
}

/ position sets of triangles on a regular grid
/ (every other column is offset for a hex grid)
grid:  ,/{x,/:\:x}@-3+!7
oh:   rad*sin pi%6
ov:   rad*sin pi%3
rh:    rad+oh
rv:    2*ov
rgrid: {(rh*x;rv*y+.5*2!x)}.'grid  / right tri origins
lgrid: (oh;ov)+/:rgrid             / left tri origins
off:   {(+z+80++spin x;cga 0,y)}   / position triangle

/ alternate between our two types/colors
/ of triangles and a static background of
/ the opposing color
b:w*(0 0;0 1;1 1;1 0)
draw: {
	l:(,(b;cga 0 3)),off[-1;2]'lgrid
	r:(,(b;cga 0 2)),off[ 1;3]'rgrid
	(l;r)@_2!sp*f
}
