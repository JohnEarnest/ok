/ Voronoi Diagrams

/ This example uses a euclidean distance measure.
/ Manhattan distance also produces interesting results:
/   c: *<+/{%x*x}p-

p:  2 0N#32?w         / 16 random 2d points
c:  *<%+/{x*x}p-      / index of closest point
v:  c''t,/:\:t:!160   / voronoi diagram
,(;arne;v)
