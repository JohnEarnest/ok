/ Parser Combinators, K-style

/ A parser is a monad which accepts a string (s)
/ and returns a pair (c;v). If the parser matches
/ on the head of s, c will contain the number of characters
/ consumed and v contains a result value, which can be anything.
/ If the parser fails to match, it will indicate failure
/ by reporting c as -1.

/ Parser combinators are meant to be projected with arguments
/ to result in a parser. prod[] can be used to post-process
/ the result value of successful parses. choose[] and seq[]
/ combine parsers to take the first of several options which match
/ or require several parsers to match in sequence, respectively.

/ eof[]      matches the end of a string/file and returns ().
/ anychar[]  matches any character and returns it.
/ oneof[]    matches any character in t and returns it.
/ lit[]      matches the entire string t and returns it.
/ not[]      succeeds and consumes 0 characters if a parser fails.
/ has[]      succeeds and consumes 0 characters if a parser succeeds.
/ times[]    matches a parser exactly n times.
/ star[]     matches a parser zero or more times.
/ option[]   matches a parser zero or one time(s).
/ plus[]     matches a parser one or more time(s).
/ nof[] consumes a prefix which yields a numeric value,
/ and then matches a parser g that many times in a row.

fail:    (-1;"")
none:    (0;())
err:     0>*:
starts:  {(,/,x)~((#x)&#y)#y}
eof:     {[s]     $[#s;fail;none]}
anychar: {[s]     $[#s;(1;*s);fail]}
oneof:   {[t;s]   $[(*s) in t;(1;*s);fail]}
lit:     {[t;s]   $[starts[t;s];(#t;t);fail]}
not:     {[g;s]   $[err g s;none;fail]}
has:     {[g;s]   $[err r:g s;fail;(0;r 1)]}
prod:    {[g;f;s] $[err r:g s;r;(*r;f@*|r)]}
choose:  {[a;s]   fail{$[err x;y s;x]}/a}
seq:     {[a;s]   none{$[err x;x;err r:y(*x)_s;r;(+;{x,,y}).'+(x;r)]}/a}
times:   {[n;g;s]    n{$[err x;x;err r:g(*x)_s;r;(+;{x,,y}).'+(x;r)]}/none}
star:    {[g;s]   *1_|{~err x}{$[err r:g(*x)_s;r;(+;{x,,y}).'+(x;r)]}\none}
option:  {choose(x;lit "")}
plus:    {[g;s]prod[seq(g;star g);{(,x),y}/;s]}
nof:     {[a;g;s]$[err n:a s;n;((*n)+*v;*|v:times[*|n;g;(*n)_ s])]}

/ Example: bencode parser

/ Note the use of symbols for self-reference or use-before-definition
/ among the parsing rules comprising a complete parser:

digits:  plus oneof "0123456789"
number:  prod[seq(option lit "-";digits);.,/]
bstr:    nof[prod[seq(digits;lit ":");.*:];anychar]
bint:    prod[seq(lit "i";number              ;lit "e");{x 1}]
blst:    prod[seq(lit "l";plus`atom           ;lit "e");{x 1}]
bdict:   prod[seq(lit "d";plus seq(bstr;`atom);lit "e");{!/+x 1}]
atom:    choose(bdict;bint;blst;bstr)
bencode: prod[seq(atom;eof);*:]

test: {*|bencode x}
(test "i47e"
 test "i-3992e"
 test "li10ei20ee"
 test "4:spamE"
 test "l3:foo3:bare"
 test "l3:fooi99e4:barfi88ee"
 test "d3:fooi99e4:barfi88ee"
 test "i23etrailinggarbage")
