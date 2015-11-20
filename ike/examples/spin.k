/ liquid Karma

p2c:    {x*(cos y;sin y)}         / polar to cartesian
slice:  .0157*!100                / a quarter circle of radians
arc:    {80++p2c[x]slice+y}       / centered points of a slice at a radius and offset
wind:   {arc[y*3]x+y*0.01*f}      / scale arc radius and offset by frame counter
curve:  {,/wind[x]'1+!20}         / a wedge of windings

draw:   {((curve[ 0];cga;2)
          (curve[pi];cga;3))}
