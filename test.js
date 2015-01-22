"use strict";

////////////////////////////////////
//
//   Tests
//
////////////////////////////////////

var ok = require("./oK");

var fails = 0; var tests = 0;
function test(input, output) {
	var got = ok.format(ok.run(ok.parse(input), new ok.Environment(null)));
	console.log(got + (!output || got == output ? "" : "<------- FAILED, EXPECTED:\n"+output));
	if (output && got != output) { fails++; }
	tests++;
}

function fail(input, errmsg) {
	var caught = false;
	try { ok.run(ok.parse(input), new ok.Environment(null)); }
	catch(err) {
		caught = true;
		if (err.message != errmsg) {
			fails++;
			console.log(input, "<------- BAD ERROR, EXPECTED:\n"+errmsg);
			console.log(err.stack);
		}
		else { console.log(errmsg); }
	}
	if (!caught) { console.log(input, "<------- NO ERROR, EXPECTED:\n"+errmsg); }
	tests++;
}

function show(input) {
	console.log(ok.parse(input));
}

console.log("tests...");

test("3 .2 4 53.9 -8"                 , "3 0.2 4 53.9 -8"                     );
test('"foo bar quux"'                 , '"foo bar quux"'                      );
test('"K"'                            , '"K"'                                 );
test("(1 2 3;(4 5;6))"                , "(1 2 3\n (4 5\n  6))"                );
test("5#99"                           , "99 99 99 99 99"                      );
test("&1 4 2"                         , "0 1 1 1 1 2 2"                       );
test("?5 3 3 5 2 3 2"                 , "5 3 2"                               );
test("+(1 2 3;4 5 6)"                 , "(1 4\n 2 5\n 3 6)"                   );
test("|5 8 12 47"                     , "47 12 8 5"                           );
test("-!5"                            , "0 -1 -2 -3 -4"                       );
test("-(1 2;3;4 5)"                   , "(-1 -2\n -3\n -4 -5)"                );
test("(1;(2 3 4))+(5;(6 7 8))"        , "(6\n 8 10 12)"                       );
test("4+1 2 3"                        , "5 6 7"                               );
test("2 3 4>3"                        , "0 0 1"                               );
test("2*!7"                           , "0 2 4 6 8 10 12"                     );
test("+\\!3"                          , "0 1 3"                               );
test(",':!5"                          , "(1 0\n 2 1\n 3 2\n 4 3)"             );
test("4#+/1+!3"                       , "6 6 6 6"                             );
test("-:'1 2 3"                       , "-1 -2 -3"                            );
test("{[a;b] 2+2}"                    , "{[a;b]2+2}"                          );
test("{[x] +/1 2}"                    , "{[x]+/1 2}"                          );
test("{3;4;18+4}"                     , "{3;4;18+4}"                          );
test("x: 5; 2*x"                      , "10"                                  );
test("{$[1;2;3]}"                     , "{$[1;2;3]}"                          );
test("$[0;`a;1;`b;`c]"                , "`b"                                  );
test("$[1>2;555;97]"                  , "97"                                  );
test("28 9 4@1"                       , "9"                                   );
test("28 9 4@0 1 1 0 2"               , "28 9 9 28 4"                         );
test("{x+y}"                          , "{[x;y]x+y}"                          );
test("{y; {z}}"                       , "{[x;y]y;{[x;y;z]z}}"                 );
test("a:5;b:3;a*b"                    , "15"                                  );
test("[a:3;b:4]"                      , "[a:3;b:4]"                           );
test("{x*x}3"                         , "9"                                   );
test("sq:{x*x};sq 25"                 , "625"                                 );
test("(1;(2 3))=2"                    , "(0\n 1 0)"                           );
test("(1;(2 3))~2"                    , "0"                                   );
test("1 2 4~1 3 4"                    , "0"                                   );
test("3*5+1"                          , "18"                                  );
test("(3*5)+1"                        , "16"                                  );
test("{x+y}[3;5]"                     , "8"                                   );
test("{z+x*y}[3;2;1]"                 , "7"                                   );
test("prod:{x*y};prod[3;20]"          , "60"                                  );
test("{+/x}[9 10]"                    , "19"                                  );
test(",4"                             , ",4"                                  );
test("{x,9,y}/1 2 3"                  , "1 9 2 9 3"                           );
test("(1;2;;3)"                       , "(1;2;;3)"                            );
test("2+"                             , "(2+)"                                );
test("(3+)'5 3 1"                     , "8 6 4"                               );
test("(*|:)'(1 2;3 4)"                , "2 4"                                 );
test(",/"                             , ",/"                                  );
test("(,/)/(1 2;3;(4;5 6))"           , "1 2 3 4 5 6"                         );
test(",//(`a;2;3;(`b;5 6))"           , "(`a;2;3;`b;5;6)"                     );
test("{$[3=x;3;x-1]}\\6"              , "6 5 4 3"                             );
test("5{1+x}\\9"                      , "9 10 11 12 13 14"                    );
test("(5){1+x}/9"                     , "14"                                  );
test("{x- 1}"                         , "{[x]x-1}"                            );
test("{x-1}"                          , "{[x]x-1}"                            );
test("{3.5- 1}"                       , "{3.5-1}"                             );
test("{3.5-1}"                        , "{3.5-1}"                             );
test("{3.5 -1}"                       , "{3.5 -1}"                            );
test("-1+1"                           , "0"                                   );
test("1-1"                            , "0"                                   );
test("{x:5;x-1}"                      , "{[x]x:5;x-1}"                        );
test("3-0.45"                         , "2.55"                                );
test("(1,1+1,1+2)"                    , "1 2 4"                               );
test("(1;1+1;1+2)"                    , "1 2 3"                               );
test("1 2 3 4"                        , "1 2 3 4"                             );
test("(1 2 3;4 5 6;7 8 9)"            , "(1 2 3\n 4 5 6\n 7 8 9)"             );
test("(0 1;(1;(1 0)))"                , "(0 1\n (1\n  1 0))"                  );
test("(`a;`b;3;4)"                    , "(`a;`b;3;4)"                         );
test("(`a;`b;(3 4))"                  , "(`a\n `b\n 3 4)"                     );
test("(1;(2;`b);(3;`c))"              , "(1\n (2;`b)\n (3;`c))"               );
test("(1 1;(2 2;(3 3;(4 4))))"        , "(1 1\n (2 2\n  (3 3\n   4 4)))"      );
test("(1;(2;(3;3;5;,4)))"             , "(1\n (2\n  (3\n   3\n   5\n   ,4)))" );
test("(3;,4)"                         , "(3\n ,4)"                            );
test("4(|+\\)\\1 1"                   , "(1 1\n 2 1\n 3 2\n 5 3\n 8 5)"       );
test("-10#1 2 3"                      , "3 1 2 3 1 2 3 1 2 3"                 );
test("8#1 2 3"                        , "1 2 3 1 2 3 1 2"                     );
test("-2#4 7 18 12"                   , "18 12"                               );
test("5{x,+/-2#x}/1"                  , "1 2 3 5 8 13"                        );
test('@ "Z"'                          , "1"                                   );
test("@ (+;-)"                        , "0"                                   );
test("@ {x+y}"                        , "1"                                   );
test('#"A"'                           , "1"                                   );
test("#3 1 4 2"                       , "4"                                   );
test("#9"                             , "1"                                   );
test('1_"stares"'                     , '"tares"'                             );
test('-2_"stares"'                    , '"star"'                              );
test("0_7"                            , "7"                                   );
test("2_1 2 3 4 5"                    , "3 4 5"                               );
test("0 3 7_0 1 2 3 4 5 6 7"          , "(0 1 2\n 3 4 5 6\n ,7)"              );
test("0 4 _ 0 1 2 3 4 5"              , "(0 1 2 3\n 4 5)"                     );
test('m:"cut it";(0,&m=" ")_m'        , '("cut"\n " it")'                     );
test(",1 2 3"                         , ",1 2 3"                              );
test("![a:5;d:7]"                     , "`a `d"                               );
test("23 4 9 18?9"                    , "2"                                   );
test("9 8 7 6 5 4 3?1"                , "7"                                   );
test('("abe";"i";"cat")?"i"'          , "1"                                   );
test("*1 2 3"                         , "1"                                   );
test("*5"                             , "5"                                   );
test("_-4.6"                          , "-5"                                  );
test("_12.3 9.8 19.992"               , "12 9 19"                             );
test('+ /"comment, not over."'        , "(+)"                                 );
test("`a`b`c[1]"                      , "`b"                                  );
test('"foobar"[2 3 4]'                , '"oba"'                               );
test("9 8 7 6[2]"                     , "7"                                   );
test("28 9 4[0 1 1 0 2]"              , "28 9 9 28 4"                         );
test("t:5 8 7;t[1]"                   , "8"                                   );
test('t:"foobar";t[2 3 4]'            , '"oba"'                               );
test("(`f;99 98;`d)[1]"               , "99 98"                               );
test("{(1+)'3 4 5}"                   , "{(1+)'3 4 5}"                        );
test("(+)"                            , "(+)"                                 );
test("{(a+b)-1}"                      , "{(a+b)-1}"                           );
test("{:767;x}[4]"                    , "767"                                 );
test("{:3+x;x}[3]"                    , "6"                                   );
test("{$[x;2;:99];x}[1]"              , "1"                                   );
test("{$[x;2;:99];x}[0]"              , "99"                                  );
test('{(1; "a"; 3.5; `xyz) 2}'        , '{(1;"a";3.5;`xyz)@2}'                );
test('(1; "a"; 3.5; `xyz) 2'          , "3.5"                                 );
test("{t:3;t+:2;t}"                   , "{t:3;t:t+2;t}"                       );
test("t:3;t+:2;t"                     , "5"                                   );
test("<1 2 2 1"                       , "0 3 1 2"                             );
test('"dozen"[> "dozen"]'             , '"zoned"'                             );
test('= "weekend"'                    , "(,0\n 1 2 4\n ,3\n ,5\n ,6)"         );
test("=1 1 2 3 3 1 2 1"               , "(0 1 5 7\n 2 6\n 3 4)"               );
test('"abcdef"@(5 0;(3;,4 3))'        , '("fa"\n ("d"\n  ,"ed"))'             );
test('[a:2 3 4;b:"abcd"]@`a'          , "2 3 4"                               );
test("()"                             , "()"                                  );
test("#()"                            , "0"                                   );
test("^45"                            , "0"                                   );
test("^`"                             , "1"                                   );
test("a:5;{a+x}[1]"                   , "6"                                   );
test("a:5;{a:x}[3];a"                 , "5"                                   );
test("a:5;b:{a:x;a}[3];a+b"           , "8"                                   );
test("sum:+;sum\\1 2 3"               , "1 3 6"                               );
test("5!3"                            , "2"                                   );
test("5!-3"                           , "-1"                                  );
test("1.8 -2.7 ! 0.2"                 , "0 0.1"                               );
test("-3 4 -17 ! -4"                  , "-3 0 -1"                             );
test('5 !"abcdefgh"'                  ,'"fghabcde"'                           );
test('21! "abcdefgh"'                 ,'"fghabcde"'                           );
test('-21 ! "abcdefgh"'               ,'"defghabc"'                           );
test("{{5}[]}"                        , "{{5}.,`}"                            );
test("{5}[]"                          , "5"                                   );
test("a:5;b:{a}[]"                    , "5"                                   );
test("{a:{99};a[]}"                   , "{a:{99};a.,`}"                       );
test("a:{99};a[]"                     , "99"                                  );
test("a:1;{a:2;{a}[]}[],a"            , "2 1"                                 );
test("a:1;b:{a:2;{a}}[];{a:3;x[]}[b]" , "2"                                   );
test("r:{$[x;x,r[x-1];0]}; r[4]"      , "4 3 2 1 0"                           );
test("{x+3}@2"                        , "5"                                   );
test("$0 9 7 6"                       , '(,"0"\n ,"9"\n ,"7"\n ,"6")'         );
test("$29 30"                         , '("29"\n "30")'                       );
test("$(`a;45;+)"                     , '("`a"\n "45"\n "(+)")'               );
test("2$2.345"                        , '"45"'                                );
test("7$`abcd"                        , '"  `abcd"'                           );
test("-3$2.345"                       , '"2.3"'                               );
test("-7$`abcd"                       , '"`abcd  "'                           );
test('."1+2"'                         , "3"                                   );
test('a:5; ."1+a"'                    , "6"                                   );
test('"f\\noo\\"b\\tar"'              , '"f\\noo\\"b\\tar"'                   );
test('"foo\\nbar"'                    , '"foo\\nbar"'                         );
test('"abcdefg" @ (5 0;(3;,4 3))'     , '("fa"\n ("d"\n  ,"ed"))'             );
test("{x+y+z}[1]"                     , "{[x;y;z]x+y+z}[1;;]"                 );
test("{x+y+z}[1;2]"                   , "{[x;y;z]x+y+z}[1;2;]"                );
test("fa:{x+y+z}[3];fb:fa[4]"         , "{[x;y;z]x+y+z}[3;4;]"                );
test("f:{x+y}[3];f[2]"                , "5"                                   );
test("a:{x,y,z}[;1;]"                 , "{[x;y;z]x,y,z}[;1;]"                 );
test("a:{x,y,z}[;1;];b:a[;2]"         , "{[x;y;z]x,y,z}[;1;2]"                );
test("a:{x,y,z}[;1;];b:a[;2];b[3]"    , "3 1 2"                               );
test("a:{x,y,z}[;1+2;];a[3+4]"        , "{[x;y;z]x,y,z}[7;3;]"                );
test("a:((1 2;3 4);5 6);a[0;1]"       , "3 4"                                 );
test("a:((1 2;3 4);5 6);a[0;1;0]"     , "3"                                   );
test("a:((1 2;3 4);5 6);a[0;0 1;1]"   , "2 4"                                 );
test("a:((1 2;3 4);5 6);a[0 1;1]"     , "(3 4\n 6)"                           );
test('a:("abc";"def";"ghi");a[0 2]'   , '("abc"\n "ghi")'                     );
test('a:("abc";"def");a[0;2 1 1]'     , '"cbb"'                               );
test("a:((1 2;3 4);5 6);a[0;;1]"      , "2 4"                                 );
test('("abc";"def";"ghi")[1;]'        , '"def"'                               );
test('("abc";"def";"ghi")[;1]'        , '"beh"'                               );
test("{(1;2;3;{5})}[][3][]"           , "5"                                   );
test("{x,y,z}[;1;][;2][3]"            , "3 1 2"                               );
test("(1 2 3;4 5 6)[1][2]"            , "6"                                   );
test("a:(1 2 3;4 5 9);a[1][2]"        , "9"                                   );
test("{x+y}.(1;2)"                    , "3"                                   );
test("sq:{x*x};sq.(5)"                , "25"                                  );
test("4.()"                           , "4"                                   );
test("1 3.()"                         , "1 3"                                 );
test("sq:{x*x};sq 25"                 , "625"                                 );
test("{x -1}"                         , "{[x]x@-1}"                           );
test("{d:{x+1};d(1 2)}"               , "{d:{[x]x+1};d@1 2}"                  );
test("{x+1}(2;3 4)"                   , "(3\n 4 5)"                           );
test("{2+x}'(1 2 3)"                  , "3 4 5"                               );
test("d:{3+x};d'(1;2 3)"              , "(4\n 5 6)"                           );
test("d:{0,x};d(1;2 3)"               , "(0\n 1\n 2 3)"                       );
test("d:{$[@x;0;1+|/d'x]};d(1;2 3)"   , "2"                                   );
test("a:1;cache::4+a;cache"           , "5"                                   );
test("a:1;c::4+a;b:c;a:2;b,c"         , "5 6"                                 );
test("a::b;b::c;c:4,3;a"              , "4 3"                                 );
test('a::b,c+:1;b:3;c:0;a;a;b:4;a;c'  , "3"                                   );
test("a::b+5;b:4;a;a;a;b:2;a"         , "7"                                   );
test("@[1 2 3;0;{2+x}]"               , "3 2 3"                               );
test("@[1 2 3;0;{y};8]"               , "8 2 3"                               );
test("a:1 2 3;@[`a;2;{1+x}]"          , "`a"                                  );
test("a:1 2 3;@[`a;2;{1+x}];a"        , "1 2 4"                               );
test("a:1 0 1;@[`a;1;{x,y};4];a"      , "(1\n 0 4\n 1)"                       );
test("@[1 2 3;1 0;{1,x}]"             , "(1 1\n 1 2\n 3)"                     );
test("@[1 2 3;1 0;{x,y};8 9]"         , "(1 9\n 2 8\n 3)"                     );
test("@[1 2 3;0;{x+2*y};8 9]"         , "(17 19\n 2\n 3)"                     );
test("a:5;.`a"                        , "5"                                   );
test("f:{x+y};.`f"                    , "{[x;y]x+y}"                          );
test("{t:3 5;t[0]:9;t}"               , "{t:3 5;t:.[t;0;{[x;y]y};9];t}"       );
test("t:3 5;t[0]:9;t"                 , "9 5"                                 );
test("{t:0 1 2;t[1],:9;t}"            , "{t:0 1 2;t:.[t;1;,;9];t}"            );
test("t:0 1 2;t[1],:9;t"              , "(0\n 1 9\n 2)"                       );
fail("1 2 3+4 5"                      , "length error."                       );
fail("`a+2"                           , "number expected, found symbol."      );
fail("[a:1]<3"                        , "domain error."                       );
fail("&-30"                           , "positive int expected."              );
fail("+(1 2;3)"                       , "matrix expected."                    );
fail("2 -3 4_1 3 4"                   , "positive int expected."              );
fail("+1"                             , "invalid arguments to +"              );
fail("a:b"                            , "the name 'b' has not been defined."  );
fail("[a:5] @ `b"                     , "index error: `b"                     );
fail("a:1 2;a[45]"                    , "index error: 45"                     );
fail("a:1;a[2]"                       , "function or list expected."          );
fail("f:{x+y};f[1;2;3]"               , "valence error."                      );
fail("@[1;2]"                         , "valence error."                      );
fail("{5;"                            , "parse error. '}' expected."          );
fail("(5"                             , "parse error. ')' expected."          );
fail("a[3"                            , "parse error. ']' expected."          );
test("a:1 2 3;`a[1]"                  , "2"                                   );
test("a:1 4 3;`a @ 1"                 , "4"                                   );
test("a:1 6 3;`a . 1"                 , "6"                                   );
test("a:(1 2;3 4)[;1]"                , "2 4"                                 );
test("(1+)'(1 2 3)"                   , "2 3 4"                               );
test("{e:{(0,)'x};+e@+e@x}(1 2;3 4)"  , "(0 0 0\n 0 1 2\n 0 3 4)"             );
test("(1_)'1_(0 0 0;0 1 2;0 3 4)"     , "(1 2\n 3 4)"                         );
test("5,/:1 2 3"                      , "(5 1\n 5 2\n 5 3)"                   );
test("(!3)+/:!3"                      , "(0 1 2\n 1 2 3\n 2 3 4)"             );
test("(!3),/:!3"                      , "(0 1 2 0\n 0 1 2 1\n 0 1 2 2)"       );
test("a:,\\;a 1 2 3"                  , "(1\n 1 2\n 1 2 3)"                   );
test("a:+/;a 1 2 3"                   , "6"                                   );
test("a:!:;a 5"                       , "0 1 2 3 4"                           );
test("|t=/:t:!3"                      , "(0 0 1\n 0 1 0\n 1 0 0)"             );
test("{t[0;2]:99}"                    , "{t:.[t;0 2;{[x;y]y};99]}"            );
test("t:(1 2 3;4 5 6);t[0;2]:99;t"    , "(1 2 99\n 4 5 6)"                    );
test("t:(1 2 3;4 5 6);t[;1]:88;t"     , "(1 88 3\n 4 88 6)"                   );
test(".[(1 2;3 4 5);1;,;999]"         , "(1 2\n 3 4 5 999)"                   );
test(".[(1 2;3 4 5);1 2;,;999]"       , "(1 2\n (3\n  4\n  5 999))"           );
test(".[(1 2;3 4 5);(0 1;1);,;999]"   , "((1\n  2 999)\n (3\n  4 999\n  5))"  );
test(".[(1 2;3 4 5);(;0);,;555]"      , "((1 555\n  2)\n (3 555\n  4\n  5))"  );
test(".[(1 2;3 4 5);1 2;,;96 69]"     , "(1 2\n (3\n  4\n  5 96 69))"         );
test("(,5)#!5"                        , "0 1 2 3 4"                           );
test("2 3#!5"                         , "(0 1 2\n 3 4 0)"                     );
test("2 2 3#!5"                       , "((0 1 2\n  3 4 0)\n (1 2 3\n  4 0 1))");
test("3 3#1"                          , "(1 1 1\n 1 1 1\n 1 1 1)"             );
test(".[3 3#0;1;+;1 2 3]"             , "(0 0 0\n 1 2 3\n 0 0 0)"             );
test(".[(1 2 3;4 5 6);1;(0,)]"        , "(1 2 3\n 0 4 5 6)"                   );
test(".[(1 2 3;4 5 6);1 2;(0,)]"      , "(1 2 3\n (4\n  5\n  0 6))"           );
test(".[(1 2 3;4 5 6);(0 1;1);(0,)]"  , "((1\n  0 2\n  3)\n (4\n  0 5\n  6))" );
test(".[(1 2 3;4 5 6);(;0);(0,)]"     , "((0 1\n  2\n  3)\n (0 4\n  5\n  6))" );
test("1 2 3 4 1 3^1"                  , "2 3 4 3"                             );
test("1 2 3 4 1 3^2 3"                , "1 4 1"                               );
fail("1 2 3 @ 1.7"                    , "index error: 1.7"                    );
fail("1 2 3[0.9]"                     , "index error: 0.9"                    );
fail("a:1 2 3;a[1.4]:5;a"             , "positive int expected."              );
test("$!5"                            , '(,"0"\n ,"1"\n ,"2"\n ,"3"\n ,"4")'  );
test('","/$!5'                        , '"0,1,2,3,4"'                         );
test("5/1 2 3"                        , "1 5 2 5 3"                           );
test('"&"\\"foo=42&bar=69"'           , '("foo=42"\n "bar=69")'               );
test("1\\3 1 2 2 4 1 5 1"             , "(,3\n 2 2 4\n ,5\n ())"              );
test("0 2 4 6 8 10'5"                 , "2"                                   );
test("0 2 4 6 8 10'-10 0 4 5 6 20"    , "-1 0 2 2 3 5"                        );
test("1 2 3 3 4'2 3"                  , "1 3"                                 );
test("4 5 6'1"                        , "-1"                                  );
test('+"="\\\'"&"\\"foo=42&bar=69"'   , '(("foo"\n  "bar")\n ("42"\n  "69"))' );
test('!+"="\\\'"&"\\"foo=42&bar=69"'  , '[foo:"42";bar:"69"]'                 );
fail("!(1 2 3;4 5)"                   , "matrix expected."                    );
fail("!(1 2 3;4 5 6)"                 , "map keys must be strings or symbols.");
test("{a::99}"                        , "{a::99}"                             );
test("a:5; {a::3}[]; a"               , "3"                                   );
test("b:1 2 3;{b[1]::4}[]; b"         , "1 4 3"                               );
test("c:99;{c+::5}[]; c"              , "104"                                 );
test("{b[1]:4}"                       , "{b:.[b;1;{[x;y]y};4]}"               );
test("{b[1]::4}"                      , "{..[`b;1;{[x;y]y};4]}"               );
test("b:1 2 3;{b:4 3 2;b[1]:4}[]; b"  , "1 2 3"                               );
test("b:1 2 3;{b:4 3 2;b[1]::4}[]; b" , "1 4 3"                               );
test("c:1 2 3;{c:4 3 2;c[1]+:5}[];c"  , "1 2 3"                               );
test("c:1 2 3;{c:4 3 2;c[1]+::5}[];c" , "1 7 3"                               );
test("c:8; {c:1; .`c}[]"              , "8"                                   );
test("c:8;{c:2;c+:1}[]; c"            , "8"                                   );
test("c:8;{c:2;c::1+(.`c)}[]; c"      , "9"                                   );
test("c:8;{c:2;c+::1}[]; c"           , "9"                                   );
test("?[1 2 3;1;4]"                   , "1 4 2 3"                             );
test("?[1 2 3;1;4 5]"                 , "1 4 5 2 3"                           );
test('?["test";1 3;"u"]'              , '"tut"'                               );
test('?["hello world";0 5;"goodbye"]' , '"goodbye world"'                     );
test("[a:2;b::a]"                     , "[a:2;b:2]"                           );
test("[a:1 9 5;b::a]"                 , "[a:1 9 5;b:1 9 5]"                   );
test("011b"                           , "0 1 1"                               );
test("11010b"                         , "1 1 0 1 0"                           );
test("~1"                             , "0"                                   );
test("~1 0 5"                         , "0 1 0"                               );
test("{~'(c.,x;y)}"                   , "{[x;y]~'(c.,x;y)}"                   );
test("-1,'1 2 3"                      , "(-1 1\n -1 2\n -1 3)"                );
test("-1 0 1,'1 2 3"                  , "(-1 1\n 0 2\n 1 3)"                  );
test("{1 2,\\:/:3 4}"                 , "{1 2 ,\\:/:3 4}"                     );
test("1 2,\\:/:3 4"                   , "((1 3\n  2 3)\n (1 4\n  2 4))"       );
test("1 2,/:\\:3 4"                   , "((1 3\n  1 4)\n (2 3\n  2 4))"       );
test("-1 1!'\\:(1 2 3;4 5 6)"         , "((3 1 2\n  6 4 5)\n (2 3 1\n  5 6 4))");
test("l:(9 8 9 7);g:=l;l[g]:!#g;l"    , "0 1 0 2"                             );
test("5+/1 2 3"                       , "11"                                  );
test("5+\\1 2 3"                      , "5 6 8 11"                            );
test("5+/,4"                          , "9"                                   );
test("5+\\,4"                         , "5 9"                                 );
test("5+/()"                          , "5"                                   );
test("5+\\()"                         , "5"                                   );
test("(8#2)\\69"                      , "1 0 0 0 1 0 1"                       );
test("64 64 64\\32767"                , "7 63 63"                             );
test("64 64 64\\32768"                , "8 0 0"                               );
test("(8#2)/1 0 0 0 1 0 1"            , "69"                                  );
test("64 64 64/7 63 63"               , "32767"                               );
test("64 64 64/8 0 0"                 , "32768"                               );
test(",':,1"                          , "()"                                  );
fail(",':()"                          , "length error."                       );
test("-': 1 4 9 14 25 36"             , "3 5 5 11 11"                         );
test("1,/:,2"                         , ",1 2"                                );
test("1,/:2"                          , "1 2"                                 );
test("1,/:()"                         , "()"                                  );
test("1,\\:,2"                        , "1 2"                                 );
test("1,\\:2"                         , "1 2"                                 );
test("1,\\:()"                        , ",1"                                  );
test("+/,5"                           , "5"                                   );
test("+/5"                            , "5"                                   );
test("+/()"                           , "()"                                  );
test("+\\,5"                          , "5"                                   );
test("+\\5"                           , "5"                                   );
test("+\\()"                          , "()"                                  );
test("-:',5"                          , "-5"                                  );
test("-:'()"                          , "()"                                  );
test("{x<5}{1+x}\\2"                  , "2 3 4 5"                             );
test("{x<5}{1+x}/2"                   , "5"                                   );
test("a:{x<5};b:{1+x};a b\\2"         , "2 3 4 5"                             );
test("f:*:;r:{y!x};f(|r\\)\\24 40"    , "(24 40\n 16 24\n 8 16\n 0 8)"        );
test("{a b/c}"                        , "{a b/c}"                             );
test("{a (b/c)}"                      , "{a@b/c}"                             );
test("{a.b/c}"                        , "{a.b/c}"                             );
test("{a.(b/c)}"                      , "{a.b/c}"                             );
test('"\\n"'                          , '"\\n"'                               );
test('"\\n\\n"'                       , '"\\n\\n"'                            );
test("+[;2]"                          , "(+[;2])"                             );
test("+[2]"                           , "(+[2;])"                             );
test("-[2;3]"                         , "-1"                                  );
test("{-[2]3}"                        , "{-[2;]3}"                            );
test("-[2]3"                          , "-1"                                  );
test("-[;100]"                        , "(-[;100])"                           );
test("-[;100]5"                       , "-95"                                 );
test("a:-[5;];a 2"                    , "3"                                   );
test("a:-[5;];a[1+1]"                 , "3"                                   );
test("a:-[;8];a 12"                   , "4"                                   );
test("a:-;a[7;1]"                     , "6"                                   );
test("#'1 2"                          , "(#[1;];#[2;])"                       );
fail("8)"                             , "unexpected character ')'"            );
test("{.[%; (3;4); :]}"               , "{.[(%);3 4;:]}"                      );
test(".[%; (3;4); :]"                 , "0 0.75"                              );
test(".[=; 0; :]"                     , '(1\n "invalid arguments to =")'      );
test("{(x*x)+(-x)+(-1)} ? 0"          , "1.618"                               );
test("f:{(x*x)-(5*x)+2};f f?23.7"     , "23.7"                                );
test("f:{(x*x)+(-x)+(-1)};?[f;0;.25]" , "-0.618"                              );

//test("#:[1 2 3]", "3");

// NOTES/TODO:

// `a`b!2 3 should construct a dictionary?

// ?[t;c;b;a] query is the K4/Q "select"
// - t is a 'table'
// - c is 'constraints'
// - b is a dict of grouping specifications ('by')
// - a is a dict of select specifications ('aggregate')

// I need to unify the two definitions of nil floating around currently

// verb-func unification?
//   This would simplify a great deal of dispatch logic and remove the need for
//   amend/dmend/query to be special syntactic cases.

if (fails) { console.log(fails + " TEST(S) DID NOT COMPLETE SUCCESSFULLY."); }
else       { console.log("passed "+tests+" tests!"); }
