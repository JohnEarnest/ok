What's New in K5?
=================
oK is an attempt to re-implement K5, a dialect of K which is still in active development, based on released example code, notes and extrapolation from previous versions of K. I am not affiliated with the K5/kOS team and my work is in no way authoritative.

My efforts began with the [Reference Manual for K2](http://web.archive.org/web/20050504070651/http://www.kx.com/technical/documents/kreflite.pdf), the latest complete manual for K I could get my hands on. I then worked from Arthur Whitney's [K5 Reference Card](http://kparc.com/k.txt) and filled in features with some help from the K4/KDB+ information which can be found on the [Kx Systems Wiki](http://code.kx.com/wiki/Reference). Geo Carncross, one of the K5 developers, graciously clarified a number of remaining points for me via email.

I will attempt to keep this list updated as additional information comes to light or K5 is changed.

Syntax
------
- Identifiers can no longer contain underscores. This avoids ambiguity with the drop/cut/floor operator `_`. May change.

- Function literals do not supply an argument list, instead relying entirely on the implicit argument names `x`, `y` and `z`. This is reportedly still up in the air. oK supports function argument lists for now.

- Boolean lists have a special literal syntax. A literal like `011b` is a three-element list.

- The conditional form `:[ ... ; ... ; ...]` is now `$[ ... ; ... ; ...]`.

- The imperative constructs `do`, `while` and `if` are gone. `do` and `while` can be replaced with some of the forms of `/` and `\`, while `if` is mostly redundant with `$[]`.

Verbs
-----
- Monadic `%` is now square root. In K2, this was the reciprocal operator.

- Monadic `!` supplied with a list containing a list of keys and a list of values constructs a dictionary. In K2, this was `.`. For example:

		  !((`a;`b);(1;2))
		[a:1;b:2]

- Monadic `!` supplied with a dictionary will produce a list of keys:

		  ![a:1;b:2]
		`a `b

- Dyadic `^` is the K4 function [except](http://code.kx.com/wiki/Reference/except). In K2 this was the exponentiation operator.

- Monadic `^` returns 1 if the right argument is null, otherwise 0. Compare with `@`. In K2 this was "shape", for determining the number and size of the rectangular dimensions of an array.

Adverbs
-------
Many of the adverbs have overloads when supplied with nouns and no verb as arguments, behaving like an additional set of verbs.

- `'` applied to a left vector and right number performs a binary search in the vector for the number. Right-atomic. Equivalent to the K4 [bin](http://code.kx.com/wiki/Reference/bin) builtin.

- `\` applied to a left atom and right list splits the list into sublists at instances of the given atom:

		  "&"\"foo=42&bar=69"
		("foo=42"
		 "bar=69")

- `/` joins a right list using a left atom. The inverse of split:

		  ","/$!5
		"0,1,2,3,4"

- `/` applied to a left list of bases and right list is "pack". Used for performing base conversions or in particular converting a collection of bits into an integer. Equivalent to the APL "Decode" operator.

		  (8#2)/1000101b
		69
		  64 64 64/7 63 63
		32767
		  64 64 64/8 0 0
		32768

- `\` applied to a left list of bases and a right number is "unpack". The inverse of "pack".

Intentional Deviations
----------------------
oK does a few small things differently from other K interpreters by design.

- oK does not internally discriminate or preserve unitype vectors. As a result, boolean lists are always printed as if they were integers, floating point vectors in which no values have a decimal part will be printed the same as an integer list, etc. This is done purely to simplify the interpreter and may change to be more precisely accurate to K semantics in the future.

- oK does not preserve the source text of expressions and instead prettyprints based on parsed ASTs which may have been desugared. This aids in debugging and simplifies the interpreter. For example:

		  {b[5]+:1}
		{b:.[b;5;+;1]}

- oK does not support date or time primitive types. This may be added in the future.

- oK does not provide the same numeric IO verbs as other K interpreters, largely because it is meant as a toy rather than for serious work. Currently `0:` is overloaded to write to stdout (dyadic) or read a line at a time as a string from stdin. In the future this functionality might be expanded to support files and ports as in a full K. Another possibility to explore is creating an interface to a subsystem similar to the kOS [Z](http://kparc.com/z.txt) UI system.
