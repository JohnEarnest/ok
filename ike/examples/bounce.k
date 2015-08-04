/ bouncing ball demo:

backc: ("#CCCCCC";"#AAAAAA")
back:  w#'h#+0,+0,7 7#1
ballc: ("#FFFFFF";"#FF0000";"rgba(0,0,0,0)")
ball: (2 2 1 1 1 2 2
       2 1 1 1 0 1 2
       1 1 1 1 1 1 1
       1 1 1 1 1 1 1
       1 1 1 1 1 1 1
       2 1 1 1 1 1 2
       2 2 1 1 1 2 2)

pos: 10 10
vel:  2  5

kd: {[x]ballc[1]::"#0000FF"}
ku: {[x]ballc[1]::"#FF0000"}
md: {pos::(x;y)}

tick: {pos+:vel
       vel*:1 -1@(pos<0 0)|(pos>(w-7;h-7))
       pos::0 0|(w-7;h-7)&pos}

draw: {((0 0; `backc ; `back)
        (pos; `ballc ; `ball))}
