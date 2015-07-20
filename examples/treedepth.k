
/ Given a list of elements assembled
/ in order into a binary tree,
/ how deep is a given element?

ranges: {$[(z>y[0])&z<x; z,y[1]; (z<y[1])&z>x; y[0],z; y]}
depth:  {-1+#?(,t),(t:-0w 0w)ranges[x@y]\(y+1)#x}

/ should be: 0 1 2 1 3 2 2 3
depth[5 1 3 9 4 7 0 8]'!8
