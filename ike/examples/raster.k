/ Raster Graphics Helpers

dim:   -1_#:'*:\                         / rectangular shape/dimensions of x
grid:  ,/'+,/'+                          / bitmap from grid of uniform tiles
scale: {2(+(,/x#')')/y}                  / scale up bitmap y by x
pad:   {(x#y)*(#y)>!x}                   / make y length x, padding with 0
crop:  {{+pad[y]'+pad[z]'x}[y].x}        / make y dimension x, padding with 0
tess:  {{y#z#'x}[y].x}                   / make y dimension x, tesselating bitmap
full:  {,((w|h)*2 2\'0 1 3 2;("";x))}    / background color x
