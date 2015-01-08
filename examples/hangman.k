
/ An interactive text-based game of Hangman

d: ("aardvark";"apple";"peanut";"etc");     / dictionary
w: d[*1?#d];                                / pick a word
c: {|/w=/:x};                               / correctly guessed
b: {{$[x 0;x 1;"_"]}'+(c[x];w)};            / word with blanks
p: {`0:" > ";*0:`};                         / prompt for a letter
{~&/c[x]}{`0:b[x]; x,p[]}/"__"; `0:w,"\n";
