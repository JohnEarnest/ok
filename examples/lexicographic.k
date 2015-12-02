
/ Generate lexicographically ordered permutations of a list,
/ one permutation at a time. np is a helper definition.
/ ap generates all permutations starting from a sorted list.

np: {{x,|y}.(0,1+*y)_x[y]:x[|y]} / next permutation for (x;pivots)
lp: {a:*|&>':x                   / non-increasing suffix (pivot+1)
     b:{*|&(x@y-1)<x}[x;a]       / rightmost index > pivot
     np[x,();(a-1;b)]}           / swap pivots, reverse suffix

ap: {(-1+*/1+!#x)lp\x}           / there are n! permutations of a list of length n

/ Examples:
ap'("ABC";1 2 3 4;`one`two)
