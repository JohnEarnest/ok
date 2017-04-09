/ recursive merge sort
/ merge[] can handle any number of sorted partitions.

rec:   {[p;f;d;c;x]$[p x;f x;c@rec[p;f;d;c]'d x]}
merge: {&/c@'+{y+t=&/t:x@'y}[c:x,\:0w]\[#1_,/x;&#x]}
msort: rec[2>#:;{x};2 0N#;merge]

msort 1 9 2 3 4 8 0
