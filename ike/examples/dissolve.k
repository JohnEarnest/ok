
/ animation effect demo: dissolve in

/i crate;lcd;http://i.imgur.com/lmVpqLA.png

d:    (#*crate;#crate)              / dimensions of the image
s:    */d                           / pixel count of the image
px:   ,/+crate                      / pixels of the image
ri:   _0.5*|/d                      / radius of the image
rr:   ri*?s                         / random radii
ra:   pi*2*?s                       / random angles
p2c:  {x*(cos y;sin y)}             / polar (r;a) to cartesian (x;y)
rc:   rr p2c'ra                     / random coordinates scattered in a circle
ic:   (+!d)-\:_d%2                  / coordinates of each pixel of the image

dur:  30                            / tween duration in frames
eas:  {1+t*t*t:x-1}                 / cubic ease out
int:  {(x*1-i)+y*i:eas(f&dur)%dur}  / eased interpolation from x to y

c:    (.5*(w;h))+/:                 / center and snap coordinates on screen
pnt:  {(y;lcd;x)}                   / draw a point at pos y in color x

/ draw each pixel of the image as a point at
/ the centered result of interpolating between
/ the scattered positions and final positions:

draw: { px pnt'c int[rc;ic] }
