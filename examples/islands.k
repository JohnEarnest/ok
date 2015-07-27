
/ Given a boolean matrix, identify regions which are orthogonally connected.
/ adapted from https://github.com/kevinlawler/kona/wiki/Islands for K5.
/ K5 lacks a 'shape' primitive, so we must use # and #* to get the same effect.
/ similarly, we must define our own 'rotate' as k5 omits this primitive.

col: {x*s#1+!*/s:(#x;#*x)};                 / give each 1 a unique id
ab:  +0,+0,;                                / add a border of zeroes
rb:  1_'1_;                                 / remove the border of zeroes
r:   {y@(#y)!x+!#y};                        / rotate list y by x
adj: {(,x),(-1 1r'\:x),(-1 1)r\:x};         / adjacent cells
mrg: {(~~x)*|/adj x};                       / merge neighboring ids
rc:  {(?0,,/x)?x};                          / renumber ids sequentially
isl: {rc rb(mrg/ab col x)};                 / find islands

/ Example:
isl (1 0 0 0 1;1 1 1 0 0;0 0 0 0 1;0 0 0 1 1;1 0 1 1 1;0 0 1 0 1)
