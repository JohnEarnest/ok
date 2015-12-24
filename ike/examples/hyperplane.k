/ Hyperplane

dist: {%(x*x)+y*y}                      / cartesian distance
c2p:  {(dist;atan2).\:(x;y)}            / cartesian (x;y) to polar (r;a)
p2c:  {(x*sin y;x*cos y)}               / polar (r;a) to cartesian (x;y)
fish: p2c.{(tanh x;y)}.c2p.             / fisheye distortion

grid: 0.2*(!21 21)-10 10                / grid of points in [-2,2] space
pos:  0 0                               / initial origin
tick: {pos+:0.05*dir}                   / offset origin by cursor deltas
draw: {,(+80+80*fish grid+pos;cga;2)}   / draw centered, fisheye distorted grid
