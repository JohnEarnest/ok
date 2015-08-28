/ monte carlo sierpinski triangle

p:     ()
i:     {*1?(0 0;.5 .5;1 0)+\:x%2}
tick:  {p:: p,,_80*20i/1 1}
draw:: ,(p;cga;3)
