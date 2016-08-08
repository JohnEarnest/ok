/ based on http://chessboardifygame.xyz

T:     30                             / tile size
D:     3 3                            / board dimensions
b:     D#(*/D)?2                      / random initial grid
h:w:   T*#b                           / set display size
adj:   {.[D#0;(D-1)&0|(x-1)+!3 3;1]}  / adjacent cells to position x
md:    {b::~b=adj@_(x;y)%T}           / xor board with adjacency mask from click
done:: (b~+b)&&//(~=)':b              / is the board chessboardified?
tile:: ,/'+,/'((2#T)#)''2*b           / draw the board as tiles
draw:: ,(0 0;solarized;(8*done)+tile)
