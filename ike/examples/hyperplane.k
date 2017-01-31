/ Hyperplane

dist: {%(x*x)+y*y}                             / cartesian distance
c2p:  {(dist;atan2).\:(y;x)}                   / cartesian (x;y) to polar (r;a)
p2c:  {(x*sin y;x*cos y)}                      / polar (r;a) to cartesian (x;y)
fish: p2c.{(tanh x;y+f*.02)}.c2p.              / fisheye distortion

grid: 0.2*(!21 21)-10 10                       / grid of points in [-2,2] space
any:  {-2+4*?2}                                / random point in [-2,2] space
goal: any[]                                    / where are we going
pos:  0 0                                      / where are we now
mark: text"x"                                  / goal icon

tick: {pos+::.05* d:goal-pos                   / move toward goal
       goal::$[.1>dist.d;any[];goal]}          / pick new goal when we're close
draw:: ((+80+80*fish grid-pos;cga;2)           / draw the grid
        ( 76+80*fish goal-pos;cga@3 4;mark))   / draw the goal
