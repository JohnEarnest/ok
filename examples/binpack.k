
/ Given a set of items with weights and values
/ compute the optimal packed value of a container
/ of a given capacity.

a: {$[z=0;0; 0>z-*y;x@z; (x@z)|(y@1)+x@z-*y]};
p: {[c;i] r::-1; (#i){r+::1; a[x;i@r]'!#x}\&1+c};

p[5;(2 12;1 10;3 20;2 15)]
