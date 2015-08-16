/ iKeanoid

br: 4(+|2,)/6 14#3 2 3                       / brick
bp: +16 8*!10 5                              / brick positions (x;y)
bc: {{{&/(x>0;x<16;y>0;y<8)}.p-x}'bp}        / brick collisions
ba: 50#1                                     / bricks alive?
pl: 8 64#3                                   / paddle
bl: {x,|x}(001100b;011110b;111111b)          / ball
p:  _(w;h)%2                                 / ball position
v:  2 -3                                     / ball velocity

cw: {{((x>159)|x<1;y<1)}.p}                  / ball collides with walls
cp: {{0,&/(y>0;y<8;x>0;x<64)}.p-(mx-32;146)} / ball collides with paddle
cc: {{{((x>0)&x<16;(y>0)&y<8)}.p-x}'bp}      / ball collides with brick axes
cb: {|/0 0,cc[]@&bc[]&ba}                    / ball collides with bricks

ts: {_((p@0)-mx)%10}                         / topspin

mm: {y;mx::x}
mx: 0

tick: {p+::v; v*::1 -1@cw[]|cb[]|cp[]; v+::|cp[]*ts[];  ba*::~bc[]}
draw: {((bp@&ba;`cga;`br);((mx-32;150);`cga;`pl);(p-3 3;`cga;`bl))}
