
/ Given a set of items with weights and values
/ compute the optimal packed value of a container
/ of a given capacity.

a: {x[z]|$[0>t:z-*y;0; y[1]+x@t]};
p: {[c;i] (&1+c){a[x;i@y]'!#x}\!#i};

p[5;(2 12;1 10;3 20;2 15)]
