From K5 to K6
=============
NOTE: these materials should no longer be considered accurate. k6 was entirely abandoned and never finished, so I no longer consider the behavior of that interpreter strictly normative. oK is its own dialect, striving to follow the _intent_ of k5/k6, but not the gory edge cases. Keeping this up for posterity, but it will _not_ be kept up to date!

oK was started as an effort to create a widely accessible interpreter for k5, the bleeding-edge work-in-progress version of Arthur Whitney's inimitable programming language. Recently, I have discovered that Arthur abandoned k5 and rewrote it from scratch in response to significant structural reorganization. The result is k6. I've obtained a k6 binary from Arthur, and looking forward I plan to retrofit oK to work toward k6 compatibility. This document will gather known differences between k5 and k6 and track oK's progress during the transition. Everything here is the result of my own experimentation, but I'll be as exhaustive as possible. When this transition is complete, I hope this document will still provide an interesting window into the evolution of K.

For those features implemented in k6 itself, injection of invalid arguments makes it possible to examine this implementation, both simplifying the work of supporting these features in oK and ensuring the best possible edge-case compatibility.

As in the oK manual, the following symbols will be used as a shorthand:

- `a`: any atom
- `n`: any number
- `l`: any list
- `m`: monadic verb or function
- `d`: dyadic verb or function
- `nyi` : not yet implemented

Where We Got Lucky
==================
In a handful of situations, k6 acts more like oK than k5. Hooray, less work for me!

Dot-Apply is now supported (<font color="green">Done</font>, but see Note)
--------------------------
Dyadic `.` applies a list of arguments to a function or verb. In k5 this operator was nyi. oK went ahead and implemented this because it is useful for desugaring various language constructs.

	 {x+y}.(1;2)
	3
	 {2*x}.,33
	66

Note that unlike some older versions of K, k6 does not special-case dot-apply for single items; the argument must be a list. In k2:

	  {2*x}. 3
	6

In k6:

	 {2*x}. 3
	{2*x}. 3
		 ^
	rank error

Explicit Function Argument Lists (<font color="green">Done</font>)
--------------------------------
Functions can optionally be given a list of named arguments. In k5, this feature was dropped in favor of using only the implicit argument names `x`, `y` and `z`. k6 brings it back.

	 {[apple;pear] apple,2*pear}[1;5]
	1 10

Note that globals can referenced from inside any function, but nested functions do not close over the locals of surrounding functions:

	 a: 24; {x+a} 5
	29
	 {[b] {x+b}5} 29
	{x+b}
	   ^
	value error

Unified Numeric Types (<font color="green">Done</font>)
---------------------
k5 drew distinctions between a variety of numeric types, including integers, floats and booleans. k6 largely removes these distinctions. oK already took this approach by necessity, since JavaScript uses a single numeric type.

Rollbacks
=========
In some situations, k6 diverges from k5 to act more like older versions of K.

Removed Literal Dictionary Syntax (<font color="red">Todo</font>)
---------------------------------
k5 introduced a special literal syntax for dictionaries in which the keys are symbols:

	 `a`b!5 2
	[a:5;b:2]

While convenient, this feature does create some annoying whitespace-disambiguated syntax by occasionally colliding with function arglists and function application. In k6, this feature is removed; you may only use "makedict":

 	 `a`b!5 2
	`a`b!5 2

Removed Boolean Type (<font color="red">Todo</font>)
--------------------
k5 had a format symbol and a special literal syntax for booleans:

	 `b$30 31 32
	010b

In keeping with the unification of numeric types, booleans have been expunged from k6:

	 `b$30 31 32
	`b$30 31 32
	  ^
	domain error
	 011010b
	0N

Removed Bin (<font color="green">Done</font>)
-----------
In k5, `l'n` and `l'l` were "bin", which performed a binary-search lookup for the index of the right item in the left (sorted) list:

	 0 2 4 6 8 10'5
	2
	 0 2 4 6 8 10'6 6 8 2
	3 3 4 1
	 0 2 4 6 8 10'-10 0 4 5 6 20
	-1 0 2 2 3 5

In k6, these cases simply perform indexing.

	 11 22 33'2 1 1
	33 22 22
	 11 22 33'2
	33
	 11 22 33'10
	0N

Goodbye To Infinity (<font color="red">Todo</font>)
-------------------
In k5, various compositions have special base cases for dealing with an empty list argument. Observe how using min or max produces an appropriate infinity value when applied to an empty list:

	 |/0#1 2 3
	-0W
	 &/0#1 2 3
	0W

k6 behaves like k2 and other older versions of K:

	 |/0#1 2 3
	0
	 &/0#1 2 3
	1

Padding Can Truncate (<font color="green">Done</font>)
--------------------
In k5, padding was treated as a minimum size for the output string:

	 2$"abcde"
	"abcde"
	 6$"abcde"
	"abcde "

In k6, as in older Ks, padding will produce a string with an exact length, truncating if necessary:

	 2$"abcde"
	"ab"
	 6$"abcde"
	"abcde "

Devil's In The Details
======================
Some features are minor tweaks of existing functionality.

Prettyprinting of Projections (<font color="red">Todo</font>)
-----------------------------
In k5, projected verbs generally prettyprint the way you'd create them, when they're allowed at all:

	 +[2]
	ERROR: parse
	+[2]
	  ^
	 #'1 2
	#'[1 2]

k6 instead uses a somewhat more pleasant but equivalent style of displaying such functions, and permits projection in more cases:

	 +[2]
	2+
	 #'1 2
	1 2#'

Except Removes All (<font color="green">Done</font>)
------------------
In k5, dyadic `^` removes the first instance of items on the right from the left argument. This permits a cute idiom for isolating items which occur more than once:

	 "ABCBBDA"^"BA"
	"CBBDA"
	 {?x^?x}"ABCBBDA"
	"BA"

In k6, dyadic `^` does the more obvious thing: remove all instances of items on the right from the left argument:

	"ABCBBDA"^"BA"
	"CD"

Each-Pair Base Cases (<font color="green">Done</font>)
--------------------
In k2, each-pair began pairing up with the second element of a list, producing `(#a)-1` results:

	  ,':1 2 3
	(2 1
	 3 2)

k5 supplied a type-appropriate null value for the initial pairing:

	 ,':1 2 3
	(1 0N;2 1;3 2)

In k6, each-pair does not apply the verb to the first element:

	 ,':1 2 3
	(,1;2 1;3 2)

Which of these interpretations is best is application-dependent and shrouded in mystery. The newly added "window" provides k6 an alternative way to gain the effect of k2's behavior, among other fun tricks.

New Magic Numbers (<font color="red">Todo</font>)
-----------------
Each new version of K tends to shuffle around the type numbers given by monadic `@`. In k5:

	 @:'(+;;`a;1.0;1;"a";();,"a";,1;,1.0;,`a)
	107 106 -11 -9 -6 -10 0 10 6 9 11

In k6:

	 @:'(+;;`a;1.0;1;"a";();,"a";,1;,1.0;,`a)
	-14 -13 -10 -9 -2 -1 0 1 2 9 10

Letter Deals (<font color="green">Done</font>)
------------
k5 special-cases "rand" when the right argument is the character "a" or "A", producing lower- or uppercase lists of letters. This feature does not work for any other character arguments.

	 10?"A"
	"QDTXHPTFCL"
	 10?"a"
	"xzzkkcgnpf"
	 10?"0"
	ERROR: domain
	10?"0"
	  ^

k6 generalizes this feature by apparently using any character argument as the base of an ASCII range of 26 possible characters:

	 10?"0"
	"B7D1B0DAA3"
	 {x@<x}@?5000?"0"
	"0123456789:;<=>?@ABCDEFGHI"
	 #?5000?"0"
	26

New And Tasty
=============
Some features of k6 are entirely new!

Window (<font color="green">Done</font>)
------
For the case `n'l`, k6 splits the right argument into sublists using a sliding window. This is a bit like a generalization of each-pair:

	 3'!6
	(0 1 2;1 2 3;2 3 4;3 4 5)
	 2'!6
	(0 1;1 2;2 3;3 4;4 5)

Identity Matrix (<font color="green">Done</font>)
---------------
For the case `=n`, k6 produces an NxN identity matrix:

	 =3
	(1 0 0;0 1 0;0 0 1)
	 =2
	(1 0;0 1)

Identity matrix is implemented in k6, in the common idiomatic manner:

	{x=/:x:!x}

Countdown (<font color="green">Done</font>)
---------
`!n` where `n` is negative will produce a list of negative numbers counting up:

	 !-5
	-5 -4 -3 -2 -1
	 !-1
	,-1

Permutations (<font color="green">Done</font>)
------------
The built in function `prm` generates the permutations of a list:

	 prm "xyz"
	("xyz";"xzy";"yxz";"yzx";"zxy";"zyx")
	 prm "aab"
	("aab";"aba";"aab";"aba";"baa";"baa")

If the argument is numeric, interpret it as `!x`.

	 prm 3
	(0 1 2;0 2 1;1 0 2;1 2 0;2 0 1;2 1 0)

Combinations (<font color="red">Todo</font>)
------------
The built in function `cmb` generates n-combinations of elements of a list. If invoked monadically, `cmb` is equivalent to `prm`:

	 cmb[1;"abc"]
	(,"a";,"b";,"c")
	 cmb[2;"abc"]
	("ab";"ac";"bc")
	 cmb[3;"abc"]
	,"abc"

`cmb` is implemented in k6:

	{$[~0>@y;y x o#y;0>x;,/o[-x;y][;prm -x];x&y-x;,/y,''(1+y)+x o'|x+y:!y-x-:1;,!x]}
