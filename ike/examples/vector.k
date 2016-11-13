/ Vector Math Helpers

dot:   +/*                           / dot product
mag:   {%dot[x;x]}                   / magnitude of vector
norm:  {x%mag x}                     / normalized vector
vang:  {acos dot[x;y]%*/mag'(x;y)}   / angle between vectors
mmul:  (+/*)\:                       / matrix multiply
det2:  {-/x*|y}.                     / 2x2 matrix determinant
rot2:  {((a;-b);(b:sin x;a:cos x))}  / 2x2 rotation matrix
scal:  {(x,1)*=1+#x}                 / arbitrary scale matrix
tran:  {(-1_'=1+#x),'x,1}            / arbitrary translation matrix
c2p:   {(mag x;atan2.x)}             / cartesian (x,y) to polar (r,a)
p2c:   {x*(sin y;cos y)}.            / polar (r,a) to cartesian (x,y)
cross: {-/'(|3 2#x)*3 2#|y}          / 3-vector cross product
sign:  {(0<x)-(x<0)}                 / -1,0,1
mix:   {(x*1-z)+y*z}                 / lerp from x to y via z
