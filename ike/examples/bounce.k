/ bouncing ball demo:

back:  w#'h#+0,+0,7 7#1
ball: (4 4 2 2 2 4 4
       4 2 2 2 1 2 4
       2 2 2 2 2 2 2
       2 2 2 2 2 2 2
       2 2 2 2 2 2 2
       4 2 2 2 2 2 4
       4 4 2 2 2 4 4)

dim: (w;h)-7
org:  0  0
pos: 10 10
vel:  2  5

tick: {pos::vel+0|dim&pos
       vel*::1 -1(pos<0)|pos>dim}

draw: (`org `solarized `back
       `pos `hot       `ball)
