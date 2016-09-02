Trees
=====
K permits recursion, but recursive solutions to problems tend to be slow and clumsy compared to vector-oriented solutions. Tree structures lend themselves very naturally to recursion. How would we represent trees in a non-recursive fashion and operate on them in a vector-oriented style?

Consider a binary tree:

	    a
	   / \
	  b   c
	 /   / \
	d   e   f
	         \
	          g

The most straightforward representation of the structure of this tree is a series of nested lists, with null or a value at each leaf:

	((`d;);(`e;(;`g)))

If we want to preserve a value for each node, we might go for an even more Lispy approach in which the value of each node is the first element of a nested list:

	(`a;(`b;`d;);(`c;`e;(`f;;`g)))

Alternatively, consider representing the tree as a matrix in which each row is a list of the indices of the left and right children of that node. Since a tree cannot contain "loops", The number `0` will serve to identify null references.

	(1 2;3 0;4 5;0 0;0 0;0 6;0 0)

If we didn't care about the order of children, we might represent an N-ary tree without these 0 placeholders:

	(1 2;,3;4 5;();();,6;())

One nice feature that immediately arises is that we can augment such a matrix with a list of values to be stored at each node (or several such lists!) without altering our representation. We have separated the _structure_ of the tree from the _data_ on the tree, and each can be manipulated separately:

	tree:  (1 2;3 0;4 5;0 0;0 0;0 6;0 0)
	data: `a  `b  `c  `d  `e  `f  `g

Let's consider some common tree operations applied to this representation.

Traversal
---------
Starting from the root, we wish to create a list of the nodes at each layer of a breadth-first traversal of the tree. The successors of a given node N are exactly the list at position N of our tree-matrix:

	  tree@2
	4 5

Indexing allows us to gather the successors of several nodes all at once:

	  ,/tree@1 2
	3 0 4 5

There may be several zeroes and we want to get rid of all of them. This is an excellent use for _unique_ and _except_:

	(?,/tree@1 2)^0

Generalizing, a complete traversal can be performed by using a fixed-point scan starting with `,0`- the root. When we select only zeroes, `^0` will produce the empty list and indexing will produce no further successors.

	  bfs: {(?,/tree@x)^0}\
	  bfs@,0
	(,0
	 1 2
	 3 4 5
	 ,6
	 ())

Joining these gives us a list of the reachable nodes in the tree from a particular starting point:

	  (,/bfs@)'!#tree
	(0 1 2 3 4 5 6
	 1 3
	 2 4 5 6
	 ,3
	 ,4
	 5 6
	 ,6)

Finding Leaves
--------------
We wish to gather a list of all the (indices of) leaf nodes in our tree. A leaf node is a node with no children, so the tree-matrix entry for this node must be the list `0 0`:

	  &(0 0~)'tree
	3 4 6

Naturally the complement of this operation finds non-leaves:

	  &~(0 0~)'tree
	0 1 2 5

For an N-ary tree we might more generally say that a leaf node's successor list is all zeroes:

	  &(&/0=)'tree
	3 4 6

Path from Root
------------
Given a node N, we wish to know the sequence of left/right paths taken to get to N from the root. There is exactly one instance of each node's index in the tree. By finding these references, we find the parent of a given node:

	  *&+/'tree=4
	2

Applying this repeatedly until we find the root gives us the chain of parents of N. Reversing this list provides the sequence of nodes which should be visited to reach N:

	  |{x>0}{*&+/'tree=x}\4 
	0 2 4

For each of these nodes we simply need to determine whether the child we're interested in was the left or right. More generally, we want the index in their successor list where the next node can be found:

	  p:{*&+/tree=x}'1_|{x>0}{*&+/'tree=x}\
	  p'1_!#tree
	(,0
	 ,1
	 0 0
	 1 0
	 1 1
	 1 1 1)

Going the other way, if we have just one such path we can easily obtain the node at that position via over:

	  0{tree[x;y]}/1 0
	4

Note that these approaches generalize to N-ary trees and permit treating any node of a tree as a starting point, rather than just node 0.

Build a Complete Binary Tree
----------------------------
A complete binary tree of size N contains N nodes. If we list complete tree matrices a clear pattern emerges:

	1   ->  (0 0)
	2   ->  (1 0;0 0)
	3   ->  (1 2;0 0;0 0)
	4   ->  (1 2;3 0;0 0;0 0)
	5   ->  (1 2;3 4;0 0;0 0;0 0)
	6   ->  (1 2;3 4;5 0;0 0;0 0;0 0)

We can produce any such tree by generating an appropriate enumeration (`1+!2*x`), forcing all indices which would reference nodes outside this boundary to zero (`a*x>a:`) and then reshaping the result into a list of pairs (`0N 2#`):

	  {0N 2#a*x>a:1+!2*x} 9
	(1 2
	 3 4
	 5 6
	 7 8
	 0 0
	 0 0
	 0 0
	 0 0
	 0 0)

An Alternate Take
-----------------
The columnar tree representation we've been working with up to this point behaves nicely in many cases. You may have noticed a few downsides, though. There are odd edge cases: we have to treat the zero index specially and appending to and removing from such a representation is enormously clumsy.

How can we fix this? Turn it on its head! Instead of using links from a parent to each child, have each node track the index of its parent. The root will be indicated with a node which links to itself. A side benefit to this representation is that trees require only a single flat _shape vector_ no matter how many children may be attached to any given node; N-ary trees are not a special case.

	    a
	   / \
	  b   c
	 /|  / \
	d e f   g
	       /|\
	      h i j
         /
        k
	
	d:`a`b`c`d`e`f`g`h`i`j`k
	t: 0 0 0 1 1 2 2 6 6 6 7

Without delving into too much detail, we can easily enough carry out the same sorts of operations as above:

	  |d@(t@)\d?`h           / path from root
	`a`c`g`h

	  d@{&0||/t=/:x}\,d?`c   / reachable successors (BFS)
	(,`c
	 `f`g
	 `h`i`j
	 ,`k
	 ())

	  *d@&t=!#t              / identify the root
	`a

	  d@&^t?!#t              / identify leaf nodes
	`d`e`f`i`j`k

Note that the vector representing a given tree is not unique. Consider the following equivalent representations of the same tree:

	  a
	 / \
	b   d
	 \
	  c
	
	ud:`c`a`b`d
	ut: 2 1 1 1

	nd:`a`b`c`d
	nt: 0 0 1 0

We'll say a _normalized tree_ is one in which parent nodes strictly precede their children. Trees glued together using our append procedure will preserve this property, and our remove procedure depends on it. Checking whether a tree is normalized is fairly straightforward- no parent index should be greater than the index of the current node.

	  norm: {~|/(!#x)<x}

	  norm'(nt;ut)
	1 0

Let's look at tree appends.

	  a       d
	 / \     / \
	b   c   e   f
           / \   \
          g   h   i

	t1: 0 0 0
	t2: 0 0 0 1 1 2

In an append, the auxiliary data columns can simply be concatenated. The lists of tree indices can be concatenated as well, but the child tree's indices must be altered to represent their new relative positions. The root of the child tree must become the index in the parent tree to which it is being attached:

	  2*t2=!#t2
	2 0 0 0 0 0

All the other nodes of the child tree must be incremented by the size of the parent tree to preserve their existing relative structure:

	  ~t2=!#t2
	0 1 1 1 1 1
	  (~t2=!#t2)*t2+#t1
	0 3 3 4 4 5

So, to attach a subtree `y` to node `z` of base tree `x`:

	app:{x,(z*~m)|(m:~y=!#y)*y+#x}

	(d;d@app[t1;t2;1])
	(`a`b`c`d`e`f`g`h`i
	 `a`a`a`b`d`d`e`e`f)

How about removing nodes? Let's begin with assuming that the set of nodes you which to remove, `r`, is it's own transitive closure. That is, any descendants of nodes in `r` are contained in `r`. This ensures that we are removing complete subtrees at once, and avoiding the risk of leaving "dangling" nodes behind. Furthermore, we'll assume our tree is normalized.

Where do the nodes in `r` appear in the overall tree?

	  r: `b`d`e`f
	
	  m:^(d?r)?!#t
	1 0 1 0 0 0 1 1 1 1 1

Thus, the indices of the nodes (and data items) which will be preserved:

	  &m
	0 2 6 7 8 9 10

And the number of spaces by which each node will be displaced by the removal of intervening nodes:

	  -~m
	0 -1 0 -1 -1 -1 0 0 0 0 0

	  +\-~m
	0 -1 -1 -2 -3 -4 -4 -4 -4 -4 -4

So, we must select the nodes which will be preserved and adjust the indices of the tree to reflect how far the parent of each preserved node was shifted:

	  (d@&m;(d@&m)@(t+(+\-~m)t)@&m:^(d?r)?!#t)
	(`a`c`g`h`i`j`k
	 `a`a`c`g`g`g`h)

	  {(x+(+\-~y)x)@&y}[t;1 0 1 0 0 0 1 1 1 1 1]  / if we already have a mask...
	0 0 1 2 2 2 3

Phew! Observe that if we have a mask of nodes to preserve we can remove an arbitrary number of nodes in linear time. Not too shabby!
