/ iKeanoid

br: 4(+|2,)/6 14#3 2 3                       / brick sprite
bp: +16 8*!10 5                              / brick positions (x;y)
pl: 8 64#3                                   / paddle sprite
bl: {x,|x}(001100b;011110b;111111b)          / ball sprite
p:  _(w;h)%2                                 / ball position
v:  2 -3                                     / ball velocity
ba: 50#1                                     / bricks alive?

cw:: {((x>159)|x<1;y<1)}.p                   / ball collides with walls
cp:: {0,&/(y>0;y<8;x>0;x<64)}.p-(mx-32;146)  / ball collides with paddle
co:: {{&/(x>-1;x<17;y>-1;y<17)}.x-y}[p]'bp   / ball overlaps with bricks
cc:: {{((x>0)&x<16;(y>0)&y<8)}.x-y}[p]'bp    / ball collides with brick axes
cb:: |/0 0,cc@&co&ba                         / ball collides with bricks

ts:: _((p@0)-mx)%10                          / topspin

tick: {p+::v; v*::1 -1@cw|cb|cp; v+::|cp*ts; ba*::~co}
draw: {((bp@&ba;`cga;`br);((mx-32;150);`cga;`pl);(p-3 3;`cga;`bl))}
