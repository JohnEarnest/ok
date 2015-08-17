/ iKeanoid

br: 4(+|2,)/6 14#3 2 3                       / brick sprite
bp: +16 8*!10 5                              / brick positions (x;y)
bl: {x,|x}'e:{x,|x}(001b;011b;111b)          / ball sprite
pl: 3*e{x,y,|x}'6 58#1                       / paddle sprite
p:  _(w;h)%2                                 / ball position
v:  2 -3                                     / ball velocity
ba: 50#1                                     / bricks alive?

r:   {(z>x)&z<y}                             / vector within range?
cw:: ~r[1 1;159 320]p                        / ball collides with walls
cp:: 0,&//r[0 0;64 8]p-(mx-32;146)           / ball collides with paddle
cc:: r[-1 -1;17 9]'p-/:bp                    / ball collides with brick axes
co:: &/'cc                                   / ball overlaps with bricks
cb:: |/0 0,cc@&ba&co                         / ball collides with bricks
ts:: _((p@0)-mx)%10                          / topspin

tick: {p+::v; v*::1 -1@cw|cb|cp; v+::|cp*ts; ba*::~co}
draw: {((bp@&ba;`cga;`br);((mx-32;150);`cga;`pl);(p-3 3;`cga;`bl))}
