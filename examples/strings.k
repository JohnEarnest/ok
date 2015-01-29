
/ 20 string algorithm questions
/ based on the list at http://javarevisited.blogspot.co.uk
/ some are trivial, some demonstrate interesting k5 features.

(

{x@&{1<#x}'=:x}"applause"                                    /  1. find duplicated characters
{(x@<x)~(y@<y)}["teapot";"toptea"]                           /  2. are two strings anagrams?
{x@*t@&{2>#x}'t:=x}"oorning"                                 /  3. first unique character
|"backwards"                                                 /  4. reverse a string
&/10>{"0123456789"?x}'"697"                                  /  5. string contains only digits?
{(w@*x;#x)}'t@&{1<#x}'t:=:w:"Programming"                    /  6. find duplicates and their count
{(t;(#x)-t:+/x)}@{6>"aeiouy"?x}'"verbage"                    /  7. count vowels and consonants
{+/x=y}["skimmed";"m"]                                       /  8. count occurrences of a character
."231"                                                       /  9. convert numeric string to int
{(#z)_,/(z,)'y\x}["x y  z";" ";"%20"]                        / 10. replace character with a string
(p:{$[2>#x;x;,/{x,/:p[y]}.'(0 1_)'{1!x}\x]})["xyz"]          / 11. permutations of a string
" "/|:'" "\"a few words";                                    / 12. reverse words in a sentence
{x~|x}"racecar"                                              / 13. is a string a palindrome?
?"bananas"                                                   / 14. unique characters in order
{[a;s]t:#:'a;t~0 0{x+y~'a@'x&t-1}/s}[("ab";"def");"dabef"]   / 15. is s an interleave of two others?
{|/(y~(#y)#)'{1!x}\x}["hneay";"ne"]                          / 16. string contains a substring?
{x@**{x@>#:'x}=:x}"abdbbac"                                  / 17. most frequently occurring char
"peeled"^"e"                                                 / 18. remove instances of a character
{[w]s@*|&{x~|x}'s:,/i#'\:{x!w}'i:!#w}"issrawar"              / 19. longest palindrome substring
{x@<#:'x}("am";"i";"you";"they")                             / 20. sort list of strings by length

)
