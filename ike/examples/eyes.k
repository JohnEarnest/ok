/ k eyes

cir: {{x,|x}'{x,|x}x>t{%(x*x)+y*y}\:t:|!x}
ew: 4 1@cir[20]
ep: 4 3@cir[10]

a1:   0
a2:   0
mm:   {a1:: atan2[y-80;x- 60]
       a2:: atan2[y-80;x-100]}

draw: {(( 40 60;cga;ew)
        ( 80 60;cga;ew)
        ( 50 70+_10*(cos a1;sin a1);cga;ep)
        ( 90 70+_10*(cos a2;sin a2);cga;ep))}