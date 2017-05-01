
/ The following is a K translation of some core ideas from
/ "The Key to a Data Parallel Compiler" (Aaron Hsu, 2016)
/ http://dl.acm.org/citation.cfm?id=2935331

/ A node coordinate matrix is an expanded form of a depth-vector
/ tree representation which gives nodes lexicographically sorted
/ coordinate vectors corresponding to a depth-first traversal.
/ Parent coordinates are prefixes of their children, so a variety
/ of structural queries can be performed in parallel.

/ constructing the node coordinate matrix:

t: {y*x>!#y}                         / x take y with right zero pad
c: {(1+x)t'+\x=/:\:!1+|/x}           / node coordinate matrix
p: {&/x{(~y)|x=y}'y}                 / y is a prefix of x
a: {f@{|/x*!#x}'(x t'y)p/:\:f:y@&z}  / ancestors (depth;ncm;mask)
k: {x'y@=z}                          / key (reducer;values;groups)

/ examples of using 'key':
/ note that in K, it is natural for key to produce a dict,
/ rather than a pair of key-value columns in a matrix.

k[+/;1 2 5;`x`z`z]                   / [x:1;z:7]
k[#:;v;v: 1 1 4 0 1 3 1]             / 1 4 0 3!4 1 1 1

/ using node coordinates to expand
/ AST queries given (depth;type;val;mask)
e:{[x;y;z;m] (1_+(x;y;z;i))@=1_a[x;i:c x;m]}

Fd: 0 1 2 3 4 4 4 2 3    / depth
Ed: 0 1 2 2 2 1 1 2 2 2
Ft: "FEFEVPVAN"          / types
Et: "EEVPVPEVPV"
Fv: "f000w+w07"          / values
Ev: "v0a+b%0c*d"
e[Fd;Ft;Fv;Ft="F"]       / function lifting
e[Ed;Et;Ev;Et="E"]       / expression flattening
