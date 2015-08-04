/ cursor movement demo

col: ("#FFFFFF";"#FF0000";"rgba(0,0,0,0)")
ball: (2 2 1 1 1 2 2
       2 1 1 1 0 1 2
       1 1 1 1 1 1 1
       1 1 1 1 1 1 1
       1 1 1 1 1 1 1
       2 1 1 1 1 1 2
       2 2 1 1 1 2 2)

pos:  _-3+(w;h)%2

tick: {pos::0 0|(w-7;h-7)&pos+3*dir}
draw: {,`pos`col`ball}
