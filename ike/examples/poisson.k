/ Poisson Disk Sampling
/ This algorithm is intended for generating sets of
/ randomly but semi-uniformly distributed points.

spread:   10 / minimum distance between points
density:   1 / how many points per round (>1 produces clumps)
rounds:  200 / how many times do we expand the set

annulus: {(spread;2*pi)*1 0+?2}                      / ring around origin
p2c:     {x*(cos y;sin y)}                           / (radius;angle)
around:  {(x+p2c.)'annulus'!density}                 / nearby points
dist:    {%+/'{x*x}x-/:y}                            / (center;points)
more:    {x,({spread<&/dist[y;x]}[x])#around[*1?x]}  / expand point set
poisson: rounds more/,80 80

,(poisson;cga;1)
