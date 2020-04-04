/ tile engine demo

grid: (0 0 0 0 0 0 0 0 0 0
       0 1 0 1 1 1 1 1 0 0
       0 1 1 1 0 1 0 1 0 0
       0 1 0 0 0 1 0 1 1 1
       0 1 1 0 0 1 0 0 0 1
       0 0 1 0 0 0 0 0 0 1
       0 0 1 1 1 1 1 1 0 1
       0 0 0 0 1 0 0 1 0 1
       0 0 1 1 1 1 1 1 0 1
       0 0 0 0 0 0 0 1 1 1)
grid: {x,|x}'{x,|x} grid
back: 2*,/'+,/'+(text@3 2)@grid
guy:  2*text@6

pos:   1 1
tick:  {pos+::dir*grid.|pos+dir}
draw:: ((;solarized;back);(8*pos;hot;guy))
