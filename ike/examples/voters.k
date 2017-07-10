/ Peer Pressure

/ Voters in a multi-party system randomly
/ take on the party affiliation of one of their
/ toroidal neighbors.

/ Based on an example in A.K. Dewdney's
/ "The Armchair Universe"

s: 80             / size
p: 2              / parties
v: (s,s)#(s*s)?p  / voters
c: (!s),/:\:!s    / grid coords
n: {v.s!x+-1+2?3} / neighbor party

tick: {v::n''c}
draw: {,(;;2+v)}
