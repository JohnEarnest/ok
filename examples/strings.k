
/ 20 string algorithm questions
/ based on the list at http://javarevisited.blogspot.co.uk
/ some are trivial, some demonstrate interesting k5 features.

r: {y@(#y)!x+!#y}; / rotate list y by x

(

{?x^?x}"applause"                                            /  1. find duplicated characters
{(x@<x)~y@<y}["teapot";"toptea"]                             /  2. are two strings anagrams?
{*t^x^t:?x}"oorning"                                         /  3. first unique character
|"backwards"                                                 /  4. reverse a string
&/~^(48+!10)?"697"                                           /  5. string contains only digits?
{1+#:'=x^?x}"Programmming"                                   /  6. find duplicates and their count
{+/'(x;~x)}@^"aeiouy"?"verbage"                              /  7. count vowels and consonants
+/=["skimmed";"m"]                                           /  8. count occurrences of a character
."231"                                                       /  9. convert numeric string to int
{(#z)_,/(z,)'y\x}["x y  z";" ";"%20"]                        / 10. replace character with a string
(p:{$[2>#x;x;,/x{x,'y}'p'(x^)'x]})["xyz"]                    / 11. permutations of a string
" "/|:'" "\"a few words";                                    / 12. reverse words in a sentence
{x~|x}"racecar"                                              / 13. is a string a palindrome?
?"bananas"                                                   / 14. unique characters in order
{[a;s]t:#:'a;t~0 0{x+y~'a@'x&t-1}/s}[("ab";"def");"dabef"]   / 15. is s an interleave of two others?
{|/(y~(#y)#)'r[1]\x}["hneay";"ne"]                           / 16. string contains a substring?
*>#:'="abdbbac"                                              / 17. most frequently occurring char
{x@&~x=y}["peeled";"e"]                                      / 18. remove instances of a character
t@*&{x~|x}'t@:>#:'t:,/(-1_)\'(1_)\"issrawar"                 / 19. longest palindrome substring
{x@<#:'x}("am";"i";"you";"they")                             / 20. sort list of strings by length

)
