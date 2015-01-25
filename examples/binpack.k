
/ Given a set of items with weights and values
/ compute the optimal packed value of a container
/ of a given capacity.

w: 2 1 3 2;
v: 12 10 20 15;

a: {$[z=0;0; 0>z-w@y;x@z; (x@z)|(v@y)+x@z-w@y]};
p: {r::-1; (#w){r+::1; a[x;r]'!#x}\(1+x)#0};

p[5]
