/ cursor movement demo

ball: (0 0 2 2 2 0 0
       0 2 2 2 1 2 0
       2 2 2 2 2 2 2
       2 2 2 2 2 2 2
       2 2 2 2 2 2 2
       0 2 2 2 2 2 0
       0 0 2 2 2 0 0)

once: _-3+(w;h)%2
tick: {0|((w;h)-7)&x+3*dir}
draw: {,(x;hot;ball)}
