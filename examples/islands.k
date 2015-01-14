
/ Given a boolean matrix, identify regions which are orthogonally connected.
/ adapted from https://github.com/kevinlawler/kona/wiki/Islands for K5.
/ K5 lacks a 'shape' primitive, so we must use # and #* to get the same effect.

col: {x*s#1+!*/s:(#x;#*x)};                 / give each 1 a unique id
ab:  {e:{(0,)'x};+(e(+e x))};               / add a border of zeroes
rb:  {(1_)'1_ x};                           / remove the border of zeroes
adj: {(,x),(-1 1!'\:x),(-1 1)!\:x};         / adjacent cells
mrg: {(~~x)*|/adj x};                       / merge neighboring ids
rc:  {l:0,,/x; g:=l;l[g]:!#g;(#x;#*x)#1_l}; / renumber ids sequentially
isl: {rc rb(mrg/ab col x)};                 / find islands

/ Example:
isl (1 0 0 0 1;1 1 1 0 0;0 0 0 0 1;0 0 0 1 1;1 0 1 1 1;0 0 1 0 1)
