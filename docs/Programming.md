Programming in K
================

Array programming languages demand a very different approach to problem solving than garden-variety imperative languages. After you've memorized K's small vocabulary of primitive functions and learned about the wrinkles and shorthand of the syntax you may find that you understand the language, but still don't fully grasp how it can be applied. In this guide I will try to gather examples of problem solving techniques that I discover or find in existing programs, in the hopes that these ideas can help other beginners.

Filtering
---------
You've built a list of values and you want to extract a subset of them that have some property based on a predicate monad `P`. Use `where` (`&`) and then index into the original list to gather the subset:

	P: {~~3!x}    / not multiples of 3
	{x@&P'x}@!20  / filter out matches
	
If your predicate consists of atomic primitives, you can avoid the `each` (`'`). If your input list is a 0-indexed enumeration, you can avoid the need to index the original list. Thus, the above example could be simplified as follows:

	{&P x}@!20    / get rid of unnecessary indexing and each
	{&~~3!x}@!20  / inline predicate
	&~~3!!20      / eliminate lambda

The use of `where` to solve this kind of problem is an extremely important concept.

K5 adds a special overload to `take` (`#`) which simplifies this pattern, performing essentially `x@&y'x`:

	  (2!)#!8
	1 3 5 7
	
	  {x~|x}#("racecar";"nope";"bob")
	("racecar"
	 "bob")

Case Selection
--------------
K offers an equivalent to "if" statements in the form of the 3 or more argument version of `$`, sometimes called `cond` for its semantic similarity to the Lisp statement:

	{$[2!x; x%2; 1+3*x]}

This statement checks conditions one after another and falls through to the final case if none of the predicates succeeds. This behavior is useful in many situations. However, if you want to avoid using "cond", you can often replace it by constructing a list and indexing into it, provided each case has no side effects:

	{(1+3*x; x%2)2!x}
	
This is nicely general and if you augment the list by indexing it to replicate elements you can express complex logic based on a lookup table:

	{(`A;`B;`C)[1 0 0 1 2 1 0]x}

Zipping
-------
You have two lists and you want to map a function `D` over pairings of the elements of these lists. Concatenate the lists and then use `flip` (`+`) to create a list of pairings. You can then apply each pair to `D` by using `eval` (`.`). This works equally well for dyads, triads, tetrads, etc. and an appropriate number of input lists:

	V1: ("A  ";"B  ";"C  ")
	V2: 2 1 3
	D:  {x@(#x)!y+!#x}      / rotate the list x by y positions
	D.'+(V1;V2)             / flip and apply

When you only need to pair up two elements, each-dyad is simpler:

	V1 D'V2

Always consider whether `flip` can make it easier to calculate "with the grain" of your data. If `V1` and `V2` are of different lengths we can insert `take` (`#`) to replicate elements or `drop` (`_`) to remove elements from lists.

Alternatively, it might be easy to construct our desired lists in place provided an index:

	V1: {2!x}          / alternating parity
	V2: {65+x}         / ascii alphabet characters
	D:  {`c$y+x*32}    / make an upper- or lowercase character
	{D[V1 x;V2 x]}'!26

Of course, sometimes we can do the whole operation in parallel and combine the construction of the sequences:

	  `c${65+x+32*2!x}@!26
	"AbCdEfGhIjKlMnOpQrStUvWxYz"

Cartesian Product
-----------------
You want to consider all combinations of two lists of elements via a dyad `D`. This is called a _Cartesian Product_ and can be formed by combining `each left` and `each right`, and possibly joining the results:

	V1: "AB"
	V2: "XYZ"
	D:  {x,y}
	,/V1 D/:\:V2
	
If the order of results matters (such as if you are doing some kind of minimizing search), reversing the order of the adverbs is equivalent to taking the `flip` of the results:

	  ,/V1 D/:\:V2
	("AX"
	 "AY"
	 "AZ"
	 "BX"
	 "BY"
	 "BZ")
	 
	  ,/V1 D\:/:V2
	("AX"
	 "BX"
	 "AY"
	 "BY"
	 "AZ"
	 "BZ")
	 
	  ,/+V1 D/:\:V2
	("AX"
	 "BX"
	 "AY"
	 "BY"
	 "AZ"
	 "BZ")

If `D` consists of atomic primitives, you can often just use one of `eachleft` or `eachright`:

	  (4+!3)+/:!4
	(4 5 6
	 5 6 7
	 6 7 8
	 7 8 9)
	 
	  (4+!3)+\:!4
	(4 5 6 7
	 5 6 7 8
	 6 7 8 9)

Combining a Cartesian Product with a Filter (as described above) is a straightforward way to approach many search or optimization problems. While a naive K interpreter may perform a great deal of unnecessary work while executing such a program, an interpreter which performs the Cartesian Product lazily using an approach similar to that described in [An APL Machine](http://www.slac.stanford.edu/cgi-wrap/getdoc/slac-r-114.pdf)(1970) could avoid this overhead.

Since this type of operation is so common, there's a primitive which which will handle many such cases- monadic `!` applied to a list, sometimes called "odometer":

	  !3 2
	(0 0 1 1 2 2
	 0 1 0 1 0 1)
	 
	  "ABC"@!3 2
	("AABBCC"
	 "ABABAB")
 
Iterative Algorithms
--------------------
If an algorithm can be completed in a known number of steps, it is well suited to a solution involving array processing as in the above techniques. Some algorithms, however, must execute for a number of steps which is not easily determined ahead of time or yield a variable number of results depending on the input. K includes some verbs which handle very common algorithms of this nature- for example:

- `find` (dyadic `?`) locates the first instance of a value in a list via a linear search.
- `bin` (dyadic `'`) performs a binary search on a list to find the closest index to a key element.
- `except` (dyadic `^`) removes instances of an element from a list.
- `distinct` (monadic `?`) isolates the unique elements of a list.
- `group` (monadic `=`) collates the indices of matching elements of a list.
- `split` (dyadic `\`) breaks a list at each instance of an element.

When these "irregular" problems come up, the above verbs should come to mind. Do any of them offer a solution, or allow you to break the problem into pieces which are each regular?

Otherwise, we consider the special forms of `over` (`/`) and `scan` (`\`):

- `f/ x` (where `f` is a monadic function) iteratively applies `f` to `x` until the value stops changing or the initial value of `x` is revisited. Also known as _Fixed Point_.
- `n f/ x` (where `f` is a monadic function and `n` is a number) iteratively applies `f` to `x`, `n` times. This is essentially a "for" loop, and often instances of this form could be replaced with a use of `'!`.
- `p f/ x` (where `f` and `p` are monadic functions) iteratively applies `f` to `x` until the predicate `p` applied to `x` evaluates to 0. This is essentially a "do...while" loop and the most general-purpose of the above forms.

The `scan` variations are identical except as with normal uses of `scan` they accumulate a list of intermediate results.

When using the "do...while" forms to implement nontrivial algorithms, it is common to write the body of the loop as taking a tuple containing all the loop's state and returning a new tuple for each iteration:

	  {x[0]<x[1]}{(x[0]*x[0];x[1]*2)}\(2;100)
	(2 100
	 4 200
	 16 400
	 256 800
	 65536 1600)

You might find that `eval` (`.`) is useful for unpacking this tuple into separate arguments, making the loop body and predicate both shorter and easier to understand, especially if tuple elements are used in many places:

	{{x<y}.x}{{(x*x;y*2)}.x}\(2;100)

Sequential Processing
---------------------
Sometimes problems which appear to require sequential processing can be performed in parallel if you provide each iteration with the necessary context. `eachprior` (`':`) handles the most straightforward of these cases. It is usually combined with one of the *difference* operations:

- `-':` *delta* (change in value)
- `%':` *ratio* (percent change)
- `~~':` *differ* (beginnings of identical runs)
- `^':` *set difference* (items added to each set)

For example,

	  -':3 3 4 0 1 1 3 0
	3 0 1 -4 1 0 2 -3

	  %':1 3 4 2 1
	1.0 3.0 1.333333 .5 .5

	  ~~':3 3 4 0 1 1 3 0
	1 0 1 1 1 0 1 1

	  ^':(1 2;1 3 2;1 3 5 6 2)
	(1 2;,3;5 6)

If you need more context, you can split the list appropriately yourself. To provide sliding windows into a list `x` which each have a length `y`:

	  {+x@(-y-1)_'(!#x)+/:!y}[4 8 9 10 22 3;3]
	(4 8 9
	 8 9 10
	 9 10 22
	 10 22 3)

K6 introduces `window` (`'`), which makes this much simpler:

	 3'4 8 9 10 22 3
	(4 8 9
	 8 9 10
	 9 10 22
	 10 22 3)

If you don't want these windows to overlap, `reshape` with a "greedy" `0N` is the ticket:

	  0N 3#4 8 9 10 22 3 7 0 9
	(4 8 9
	 10 22 3
	 7 0 9)
	
	  0N 2#4 8 9 10 22 3 7 0
	(4 8
	 9 10
	 22 3
	 7 0)

If the iterations are truly sequentially dependent, use dyadic `over`. Consider processing a list of typed characters where each "#" represents a backspace. You can't simply remove every character followed by a "#", as several "#"es may appear consecutively, as in "ab#def##". If we treat the left argument to our dyadic reducing function as a stack we can push elements into with `x,y` and pop elements from with `-1_x`, we can arrive at the following solution:

	  (){$[y="#";-1_x;x,y]}/"ab#def##"
	"ad"

(Or a slightly shorter equivalent, if we're golfing:)

	  (){(x,y;-1_x)y=35}/"ab#def##"

The way this works is clearer if we show the intermediate results:

	  {x{x,"|",y}'(){$[y="#";-1_x;x,y]}\x}"ab#def##"
	("a|a"
	 "b|ab"
	 "#|a"
	 "d|ad"
	 "e|ade"
	 "f|adef"
	 "#|ade"
	 "#|ad")

If you find yourself seemingly needing to update several data structures on each iteration of an algorithm, consider whether you can break the algorithm into several simpler passes. For example, consider a program which, given a graph as an adjacency list `g`, finds the visited items at each layer of a breadth-first traversal. We can first simply walk the graph by expanding a visited set, and then afterwards extract each ply's expansion by using *set difference*:

	  g: (1 2 4;0 5;0 6 7;,7;0 9;1 8;,2;2 3 9;5 9;4 7 8);

	  {?x,,/g@x}\,0
	(,0
	 0 1 2 4
	 0 1 2 4 5 6 7 9
	 0 1 2 4 5 6 7 9 8 3)

	  ^':{?x,,/g@x}\,0
	(,0
	 1 2 4
	 5 6 7 9
	 8 3)
