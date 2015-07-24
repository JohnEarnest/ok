
/ Tic-Tac-Toe for two

pr:    `0:"\n",                               / print a line to stdout
num:   {*(0:`)-"0"}                           / read a digit from stdin

lines: (,0 4 8),(,2 4 6),t,(+t:3 3#!9)        / diags, rows, cols
won:   {|/(&/(y+1)=)'x[lines]}                / did player y win board x?
cell:  {$[~x;"012345678"@y;".xo"@x]}          / format one board cell
disp:  {pr@"\n"/"|"/'3 3#cell.'x,'!#x;x}      / display the whole board
ask:   {pr("ox"@p),"> ";num[]}                / prompt for a move
pick:  {[a]{~0~a[x]}{x;9!ask[]}/0}            / repeat until valid move
move:  {x[pick[x]]:1+(p::~p)}                 / make a move
done:  {won[x;p]|~+/0=x}                      / player won or no moves remain

end: {pr$[won[x;0];"X Wins!";won[x;1];"O Wins!";"Tie!"]}
p:0; end disp {~done x}{move disp x}/9#0;
