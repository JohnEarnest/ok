
/ render an ANSI-art rotating torus
/ an adaptation of https://www.a1k0n.net/2011/07/20/donut-math.html
/ which just renders the Z-buffer directly and uses a lower point density.

rotate: { cx:2.3+cos y 0; cy: sin y 0 / [(A;B);(theta;phi)]
          cp:    cos y 1; sp: sin y 1
          ca:    cos x 0; sa: sin x 0
          cb:    cos x 1; sb: sin x 1
          xp: (cx*((cb*cp)+(sa*sb*sp)))-cy*ca*sb
          yp: (cx*((sb*cp)-(sa*cb*sp)))+cy*ca*cb
          zp: 1%5+(ca*cx*sp)+cy*sa
          (_40-30*xp*zp;_20-20*yp*zp;zp) }

render: {b::40 80#0; {b[y;x]|:z}.'+rotate[x;grid]; b}
grid:   +,/t,/:\:t:0.8*!80
disp:   `0:0x1B5B48,"\n"/" .,-~:;=!*#$@"@_15*
main:   {1}{disp render x; .07 .03+x}/0 0
