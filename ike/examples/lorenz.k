/ Lorenz Attractor

s: 0.008        / step size
c: 10 28 2.666  / constants
p: 0 10 10      / start position
i: 5000         / iteration count

iter: {x+s*(c[0]*x[1]-x[0]
            (x[0]*(c[1]-x[2]))-x[1]
            (x[0]*x[1])-c[2]*x[2])}

,((80+3*i iter\0 10 10)[;0 1];;1)
