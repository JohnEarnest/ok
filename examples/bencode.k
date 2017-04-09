/ BitTorrent 'bencode' format encoder
/ this serialization format is useful because it is bijective,
/ endian-independent, regular and recursively nestable.
/ see http://www.bittorrent.org/beps/bep_0003.html

str: &/-10=@:'                                 / is string?
ndi: {(k p)!(.x)p:<k:!x}                       / normalize dict
bes: {($#x),":",x}                             / bencode string
bei: {"i",($x),"e"}                            / bencode int
bel: {"l",(,/be'x),"e"}                        / bencode list
bed: {"d",(,/be',/+(!:;.:)@\:ndi x),"e"}       / bencode dict
be:  {$[99~@x;bed;-9~@x;bei;str x;bes;bel]x}   / bencode

be ("baz";"auf")!(1 2 3;"foobar")
