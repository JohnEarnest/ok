
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
(p:{[s]$[1=#s;s;,/{(s@x),/:p[(x#s),(x+1)_ s]}'!#s]})["xyz"]  / 11. permutations of a string
" "/|:'" "\"a few words";                                    / 12. reverse words in a sentence
{x~|x}"racecar"                                              / 13. is a string a palindrome?
?"bananas"                                                   / 14. unique characters in order
{[a;s]t:#:'a;t~0 0{x+y~'a@'x&t-1}/s}[("ab";"def");"dabef"]   / 15. is s an interleave of two others?
{[h;n]|/(n~)'{(#n)#x!h}'!#h}["hneay";"ne"]                   / 16. string contains a substring?
{x@**{x@>#:'x}=:x}"abdbbac"                                  / 17. most frequently occurring char
"peeled"^"e"                                                 / 18. remove instances of a character
{[w]s@*|&{x~|x}'s:,/i#'\:{x!w}'i:!#w}"issrawar"              / 19. longest palindrome substring
{x@<#:'x}("am";"i";"you";"they")                             / 20. sort list of strings by length

)
