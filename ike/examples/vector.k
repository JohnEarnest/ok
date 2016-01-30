/ Vector Math Helpers

id:    {x=\:x}@!                     / NxN identity matrix
dot:   {+/x*y}                       / dot product
mag:   {%dot[x;x]}                   / magnitude of vector
norm:  {x%mag x}                     / normalized vector
vang:  {acos dot[x;y]%*/mag'(x;y)}   / angle between vectors
mmul:  {x dot\:y}                    / matrix multiply
det2:  {-/*/'+(*x;|*|x)}             / 2x2 matrix determinant
rot2:  {((a;-b);(b:sin x;a:cos x))}  / 2x2 rotation matrix
scal:  {(x,1)*id 1+#x}               / arbitrary scale matrix
tran:  {(-1_'id 1+#x),'(x,1)}        / arbitrary translation matrix
c2p:   {(mag x;atan2.x)}             / cartesian (x,y) to polar (r,a)
p2c:   {x*(sin y;cos y)}.            / polar (r,a) to cartesian (x,y)
cross: {-/'(|3 2#x)*3 2#|y}          / 3-vector cross product
