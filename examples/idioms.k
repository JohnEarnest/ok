
/ K idioms.
/ derived from http://www.softwarepreservation.org/projects/apl/Papers/THEAPLIDIOMLIST
/ many idioms described already have K primitives or simple juxtapositions.
/ these are a few which caught my eye as non-obvious and useful and translate nicely to K.

(

{x>\:!|/x}[0 2 3 7 5 1]              / (5.3)  histogram
{x@&|\~" "=x}  "  some whitespace "  / (5.5a) strip leading spaces
{x@&||\~" "=|x}"  some whitespace "  / (5.5b) strip trailing spaces
{x@&a|1_1!1,a:~" "=x}" a  b c   d  " / (5.5c) compress repeated spaces
{&//x=+x}(1 2 3;2 3 2;3 2 1)         / (6.6)  is x a symmetric matrix?
|\0 1 1 0 1 0 0                      / (7.5)  right smear
+/&\1 1 1 0 1 0 0 1 0                / (14.1) index of leftmost 0

)
