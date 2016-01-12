/ note transcription
/ C-3 C#3 D-3 D#3 E-3 F-3 F#3 G-3 G#3 A-3 A#3 B-3
/ 1   2   3   4   5   6   7   8   9   10  11  12
/ C-4 C#4 D-4 D#4 E-4 F-4 F#4 G-4 G#4 A-4 A#4 B-4
/ 13  14  15  16  17  18  19  20  21  22  23  24

m1:    4 0 9 0 4 0 9 0   3 0 9 0 3 0 9 0   4 0 4 0 1 0 9 0
m2:    1 0 9 0 1 0 2 3
m3:    12 0 11 0 9 0 0 0
h1:    21 21 0 21 21 0 0 0   21 21 0 21 21 0 0 0   21 21 0 21 21 0 19 21
h2:    21 19 1 1 21 21 21 0
song:  +(m1,m2,m1,m3; h1,h2,h1,h2)

/ synthesizer
note:  {440*pow[2;x%12]}                         / freq. relative to a4 
freq:  0,note'-21+!24                            / two octaves starting at c3
gain:  0.25                                      / volume scale
tempo: 1500                                      / samples per note
mix:   {wave::(+/x)%#x}                          / blend waveforms and stash a copy
osi:   {    sin x*2*pi*y%srate}                  / sine oscillator
osq:   {_.5+sin x*2*pi*y%srate}                  / square oscillator
ost:   {     1! x*     y%srate}                  / sawtooth oscillator
step:  {freq@song@(#song)!_x%tempo}              / frequencies of a step in the song
play:  {gain*mix@((ost;osi)@'step x)@\:x+!500}   / generate blended waveform

/ simple waveform viewer
wave:  h#0
draw:  {+((_(w%2)*1+h#wave),'!h;,cga;,w#1)}
