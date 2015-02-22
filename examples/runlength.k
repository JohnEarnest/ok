
/ Simple run-length encoder and decoder

rle: {r:(&~0,=':x)_x;+(#:'r;*:'r)}
rld: ,/#/'

/ Examples:
(rle "AAABBCCDAABB"
 rld ((5;"A");(3;"C");(1;"B")))
