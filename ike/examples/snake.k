/ SnaKe
pr: {(x'!#y){x,,y}'~text y}
pd: {(x+_ 8 5*y,cos .1*y+f;cga)}
pt: {(26 60 +_20 8*x,sin x+.3*f;pico 16,8+x)}
tl: {`setup`title@~+/dir}
td: {pr[pt;"SnaKe!"],pr[pd[20 120];"Press arrows..."]}
ol: {tr::30;`setup`over@~+/dir}
od: {pr[pd[35 60];"Game Over!"],pr[pd[20 120];"Score: ",-8$$(l-7)%2]}

sd: {,(;;)}
su: {p::  ,10 10                      / pos of snake segments
     g::  *p                          / pos of goal
     d::  0 1                         / direction of snake
     l::  5                           / length of snake
     tr:: 7                           / tick rate
     `game}                           / proceed to main game

gl: {a:   p~?p                        / not colliding with self?
     d::  a*(dir;d)@~+/dir            / update direction
     p::  (-l&1+#p)#p,,20!d+*|p       / grow/move snake
     b:   |/g~/:p                     / overlapping goal?
     g::  (g;2?20)b                   / respawn goal if needed
     l+:: 2*b                         / increment length if needed
     `game`over(~a)&1=#?p}            / end if snake is totally dead

wi: {_({(sin x;cos x)}'f+2*!#x)+x}    / snake wiggle
gd: {((w*2 2\'0 1 3 2;pico 2 1)       / background
      (wi 8*-1_p;c;text 48)           / snake
      (8**|p;c:cga (2+p~?p),4;text 5) / head
      (8*g;cga 2 4;text 8))}          / goal

ss:   `title
s:    [title:(tl;td);setup:(su;sd);game:(gl;gd);over:(ol;od)]
tick: {ss::s[ss;0][]}
draw: {s[ss;1][]}
