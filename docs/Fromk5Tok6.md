From K5 to K6
=============
oK was started as an effort to create a widely accessible interpreter for k5, the bleeding-edge work-in-progress version of Arthur Whitney's inimitable programming language. Recently, I have discovered that Arthur abandoned k5 and rewrote it from scratch in response to significant structural reorganization. The result is k6. I've obtained a k6 binary from Arthur, and looking forward I plan to retrofit oK to work toward k6 compatibility. This document will gather known differences between k5 and k6 and track oK's progress during the transition. Everything here is the result of my own experimentation, but I'll be as exhaustive as possible. When this transition is complete, I hope this document will still provide an interesting window into the evolution of K.

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

Dot-Apply is now supported (<font color="green">Done</font>)
--------------------------
Dyadic `.` applies a list of arguments to a function or verb. In k5 this operator was nyi. oK went ahead and implemented this because it is useful for desugaring various language constructs.

	 {x+y}.(1;2)
	3
	 {2*x}.,33
	66

Explicit Function Argument Lists (<font color="green">Done</font>)
--------------------------------
Functions can optionally be given a list of named arguments. In k5, this feature was dropped in favor of using only the implicit argument names `x`, `y` and `z`.

	 {[apple;pear] apple,2*pear}[1;5]
	1 10

Unified Numeric Types (<font color="green">Done</font>)
---------------------
K5 drew distinctions between a variety of numeric types, including integers, floats and booleans. K6 largely removes these distinctions. oK already took this approach by necessity, since JavaScript uses a single numeric type.

Regressions
===========
In some situations, k6 diverges from k5 to act more like older versions of K.

Removed Literal Dictionary Syntax (<font color="red">Todo</font>)
---------------------------------
k5 introduced a special literal syntax for dictionaries in which the keys are symbols:

	 `a`b!5 2
	[a:5;b:2]

While convenient, this feature does create some annoying whitespace-disambiguated syntax by colliding with function arglists and function application. In k6, this feature is removed; you may only use "makedict":

 	 `a`b!5 2
	`a`b!5 2

Removed Boolean Type (<font color="red">Todo</font>)
--------------------
In keeping with the unification of numeric types, booleans have been expunged from k6. k5 had format symbols and a special literal syntax for booleans:

	 `b$30 31 32
	010b

Neither of these are present in k6:

	 `b$30 31 32
	`b$30 31 32
	  ^
	domain error
	 011010b
	0N

Goodbye To Infinity (<font color="red">Todo</font>)
-------------------
In k5, various adverbs have special base cases. Observe how using min or max produces an appropriate infinity value when applied to an empty list:

	 |/0#1 2 3
	-0W
	 &/0#1 2 3
	0W

k6 behaves like k2 and other older versions of K:

	 |/0#1 2 3
	0
	 &/0#1 2 3
	1

Padding Can Truncate (<font color="red">Todo</font>)
--------------------
In k5, padding was treated as a minimum size for the output string:

	 2$"abcde"
	"ab"
	 6$"abcde"
	"abcde "

In k6, as in older Ks, padding will produce a string with an exact length, truncating if necessary:

	 2$"abcde"
	"ab"
	 6$"abcde"
	"abcde "

Little Tweaks
=============
Some features are minor tweaks of existing functionality.

Prettyprinting of curried functions (<font color="red">Todo</font>)
-----------------------------------
In k5, curried functions generally prettyprint the way you'd create them, when they're allowed at all:

	 +[2]
	ERROR: parse
	+[2]
	  ^
	 #'1 2
	#'[1 2]

K6 instead uses a somewhat more pleasant but equivalent style of displaying such functions:

	 +[2]
	2+
	 #'1 2
	1 2#'

Except Removes All (<font color="red">Todo</font>)
------------------
In k5, dyadic `^` removes the first instance of items on the right from the left argument. This permits a cute idiom for isolating items which occur more than once:

	 "ABCBBDA"^"BA"
	"CBBDA"
	 {?x^?x}"ABCBBDA"
	"BA"

In k6, dyadic `^` does the more obvious thing: remove all instances of items on the right from the left argument:

	"ABCBBDA"^"BA"
	"CD"

Each Pair Base Cases (<font color="red">Todo</font>)
--------------------
k5 used a type-appropriate null value for the initial pairing in each-pair:

	 ,':1 2 3
	(1 0N;2 1;3 2)

In k6, each-pair does not apply the verb to the first element:

	 ,':1 2 3
	(,1;2 1;3 2)

K2 had yet another behavior, ignoring that first value entirely:

	  ,':1 2 3
	(2 1
	 3 2)

Which of these interpretations is best is application-dependent and shrouded in mystery.

New And Tasty
=============
Some features of k6 are entirely new!

Window (<font color="red">Todo</font>)
------
For the case `n'l`, k6 splits the right argument into sublists using a sliding window. This is a bit like a generalization of each-pair:

	 3'!6
	(0 1 2;1 2 3;2 3 4;3 4 5)
	 2'!6
	(0 1;1 2;2 3;3 4;4 5)
