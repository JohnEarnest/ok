/ cursor movement demo

ball: (0 0 2 2 2 0 0
       0 2 2 2 1 2 0
       2 2 2 2 2 2 2
       2 2 2 2 2 2 2
       2 2 2 2 2 2 2
       0 2 2 2 2 2 0
       0 0 2 2 2 0 0)

pos:  _-3+(w;h)%2
tick: {pos::0 0|(w-7;h-7)&pos+3*dir}
draw: ,`pos`hot`ball
