
/ Simple run-length encoder and decoder

rle: {{(#x;*x)}'(&~=':x)_x}
rld: ,/#/'

/ Examples:
(rle "AAABBCCDAABB"
 rld ((5;"A");(3;"C");(1;"B")))
