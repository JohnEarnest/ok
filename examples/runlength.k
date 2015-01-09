
/ Simple run-length encoder and decoder

rle: {r:(&~0,=':x)_x;+(*:'r;#:'r)};
rld: {,/{y#x}.'x};

/ Examples:
rle "AAABBCCDAABB"
/ rld (("A";5);("C";3);("B";1))
