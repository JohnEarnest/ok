/ UPC-A barcode generator

s: 111111111010b                   / start/end sentinel with quiet zone
m: 10101b                          / middle separator
l: (7#2)\'0x72666c425c4e50444874   / left-half encoding (right is inverted)
c: {x,10!10-10!+/x*11#3 1}         / calculate and append checksum
b: {,/s,(l 6#x),m,(~l 6_x),|s}c@   / QS-6L-M-6R-SQ bit pattern

draw: {,(;;60#,1,b 11?!10)}
