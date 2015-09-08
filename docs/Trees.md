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
	  bfs ,0
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

	  0{t[x;y]}/1 0
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
