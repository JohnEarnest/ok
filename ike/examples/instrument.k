/ musical keyboard
codes:  65 87 83 69 68 0 70 84 71 89 72 85 74 0 75 79 76 80 186 0 222
color:  0 1 0 1 0 2 0 1 0 1 0 1 0 2 0 1 0 1 0 2 0
colors: (cga 0 1;cga 0 2;cga 4 4)color
keyimg: text"awsed ftgyhuj kolp; '"
keypos: +(25+5*!#color;76-10*color=1)
held::  |/(0,keys)=\:codes
draw::  +(keypos+(0 1*)'held;colors;keyimg)

/ synthesizer
note:   {440*pow[2;x%12]}                         / freq. relative to a4
freq:   (~color=2)*(note'-9+!18)@-1+\~color=2     / c4-f5 with key gaps
gain:   0.25                                      / volume scale
mix:    {(+/x)%#x}                                / arithmetic average
osc:    {sin x*2*pi*y%srate}                      / (frequency;sample)
play:   {gain*mix@+osc[0,freq@&held]'x+!250}
