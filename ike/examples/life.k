/ the game of life on a torus
rot:  {y@(#y)!x+!#y}
next: {(x&2=k)|3=k:+/adj x}
adj:  {(r'r@;r'l@;l'r@;l'l@;l';r';r:rot[-1];l:rot[1])@\:x}

/ render a tilemapped representation
tiles: ( 8 8#0
        (0 3 3 3 3 3 3 1
         1 2 2 2 2 2 2 3
         1 2 3 1 1 1 2 3
         1 2 3 3 2 1 2 3
         1 2 3 3 3 1 2 3
         1 2 2 3 3 3 2 3
         1 1 2 2 2 2 2 3
         0 1 1 1 1 1 1 0))

once: 20 20#400?2
tick: next
draw: {,(;lcd;,/'+,/'+tiles x)}
