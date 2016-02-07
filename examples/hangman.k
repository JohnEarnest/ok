
/ An interactive text-based game of Hangman

w: *1?("aardvark";"apple";"peanut";"etc")  / pick a word
c: {|/w=/:x}                               / correctly guessed
b: {("_",'w)@'c x}                         / word with blanks
p: {`0:" > ";*0:`}                         / prompt for a letter
{~&/c x}{`0:b x; x,p[]}/"__"; `0:w,"\n";
