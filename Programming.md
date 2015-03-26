Programming in K
================

Array programming languages demand a very different approach to problem solving than garden-variety imperative languages. After you've memorized K's small vocabulary of primitive functions and learned about the wrinkles and shorthand of the syntax you may find that you understand the language, but still don't fully grasp how it can be applied. In this guide I will try to gather examples of problem solving techniques that I discover or find in existing programs, in the hopes that these ideas can help other beginners.

Filtering
---------
You've built a list of values and you want to extract a subset of them that have some property based on a predicate monad `P`. Use `where` (`&`) and then index into the original list to gather the subset:

	P: {~~x!3}    / not multiples of 3
	{x@&P'x}@!20  / filter out matches
	
If your predicate consists of atomic primitives, you can avoid the `each` (`'`). If your input list is a 0-indexed enumeration, you can avoid the need to index the original list. Thus, the above example could be simplified as follows:

	{&P x}@!20    / get rid of unnecessary indexing and each
	{&~~x!3}!20   / inline predicate
	&~~![;3]!20   / curry fixed argument of dyadic ! and eliminate lambda

The use of `where` to solve this kind of problem is an extremely important concept.

Case Selection
--------------
K offers an equivalent to "if" statements in the form of the 3 or more argument version of `$`, sometimes called `cond` for its semantic similarity to the Lisp statement:

	{$[x!2; x%2; 1+3*x]}

This statement checks conditions one after another and falls through to the final case if none of the predicates succeeds. This behavior is useful in many situations. However, if you want to avoid using "cond", you can often replace it by constructing a list and indexing into it, provided each case has no side effects:

	{(x%2; 1+3*x)x!2}
	
This is nicely general and if you augment the list by indexing it to replicate elements you can express complex logic based on a lookup table:

	{(A;B;C)[1 0 0 1 2 1 0]x}

Zipping
-------
You have two lists and you want to map a function `D` over pairings of the elements of these lists. Concatenate the lists and then use `flip` (`+`) to create a list of pairings. You can then apply each pair to `D` by using `eval` (`.`). This works equally well for dyads, triads, tetrads, etc. and an appropriate number of input lists:

	V1: ("A  ";"B  ";"C  ")
	V2: 2 1 3
	D:  {y!x}               / rotate the list x by y positions
	D.'+(V1;V2)             / flip and apply

Always consider whether `flip` can make it easier to calculate "with the grain" of your data. If `V1` and `V2` are of different lengths we can insert `take` (`#`) to replicate elements or `drop` (`_`) to remove elements from lists.

Alternatively, it might be easy to construct our desired lists in place provided an index:

	V1: {x!2}          / alternating parity
	V2: {65+x}         / ascii alphabet characters
	D:  {`c$y+x*32}    / make an upper- or lowercase character
	{D[V1 x;V2 x]}'!26

Of course, sometimes we can do the whole operation in parallel and combine the construction of the sequences:

	  `c${65+x+32*x!2}@!26
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
	(0 0
	 0 1
	 1 0
	 1 1
	 2 0
	 2 1)
	 
	("ABC"@)'!3 2
	("AA"
	 "AB"
	 "BA"
	 "BB"
	 "CA"
	 "CB")
 
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
