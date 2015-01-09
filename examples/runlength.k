
/ Simple run-length encoder and decoder

rle: {r:(&~=':0,x)_x;+(*:'r;#:'r)};
rld: {,/{x[1]#x[0]}'x};

/ Examples:
rle "AAABBCCDAABB"
/ rld (("A";5);("C";3);("B";1))
