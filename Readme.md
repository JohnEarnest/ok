oK
==

oK is a toy interpreter for a dialect of the [K programming language](http://en.wikipedia.org/wiki/K_(programming_language)) which aims to be an implementation of [K5](http://kparc.com), the still-evolving bleeding edge version of the language. Expect oK to be buggy, incomplete and occasionally flat-out wrong, but slowly improving over time. Read the [oK Manual](https://github.com/JohnEarnest/ok/blob/gh-pages/docs/Manual.md) for an overview of oK's operators and syntax.

If you are interested in learning more about K, consider downloading the free version of [kdb](http://kx.com/software-download.php) from Kx Systems, the fine makers of K. Alternatively, [Kona](https://github.com/kevinlawler/kona) is an open-source reimplementation of K3/K4.

oK does not intend to be particularly fast or suitable for any practical purpose beyond learning, instead emphasizing simplicity of implementation. JavaScript was chosen as an implementation language because it is familar to many programmers and has first-class functions.

Trying oK
---------
The easiest way to run oK is using the [Browser-based REPL](http://johnearnest.github.io/ok/index.html). This REPL features a few special commands which can be issued at the beginning of a line:

- `\\` (while entering a multiline expression) cancel this expression.
- `\e` toggle the scratchpad editor pane. This editor's content is persisted via localstorage (in case your browser crashes or is closed accidentally). 
- `\r` run the contents of the editor pane. Alternately, press shift+enter with the editor focused.
- `\c` clear the output log.
- `\t` time executing the remainder of the line.
- `\x` execute the remainder of the line and show a step-by-step trace.
- `\f` list all presently defined functions.
- `\v` list all presently defined variables.
- `\u` generates a code url from the remainder of the line, as described below.

oK provides several numbered IO verbs:

- dyadic `0:` takes a symbol or string as its left argument and writes the right argument to that destination as text. The right argument can be a symbol, a string, or a list of symbols or strings. In the browser-based REPL the symbol is ignored and output is always sent to the console. In the command-line REPL output is sent to a file as specified by the left argument, or to `stdout` if the left argument is empty.
- monadic `0:` reads the content of a file or a URL. In the browser-based REPL it takes a string as its right argument and performs a synchronous HTTP request to that URL. The result will be a tuple containing the HTTP status code followed by the response, if any. You can use this in conjunction with pastebins to load code from elsewhere or access RESTful web APIs. Note that most web browsers restrict cross-site HTTP requests from javascript under the [same-origin policy](http://en.wikipedia.org/wiki/Same-origin_policy)- you'll need a server which responds with an Access-Control-Allow-Origin header. GitHub gists will do:

		  url: "https://gist.githubusercontent.com/anonymous/cc0ef05c00940044eb0a/raw/"
		"https://gist.githubusercontent.com/anonymous/cc0ef05c00940044eb0a/raw/"
		  0:url
		(200
		 "/ generate a times table\nt*/:t:!10\n")
		  .*|0:url
		(0 0 0 0 0 0 0 0 0 0
		 0 1 2 3 4 5 6 7 8 9
		 0 2 4 6 8 10 12 14 16 18
		 0 3 6 9 12 15 18 21 24 27
		 0 4 8 12 16 20 24 28 32 36
		 0 5 10 15 20 25 30 35 40 45
		 0 6 12 18 24 30 36 42 48 54
		 0 7 14 21 28 35 42 49 56 63
		 0 8 16 24 32 40 48 56 64 72
		 0 9 18 27 36 45 54 63 72 81)
In the command-line REPL `0:` reads a file as text. The right argument can be a symbol or a string specifying the file path. If the path is to a directory, `0:` returns its listing. If the path is empty and oK is not running interactively, `0:` tries to read text from `stdin` until it encounters a `'\n'`.

- monadic `1:` works just like monadic 0: except it expects the response to be JSON rather than arbitrary text, and it attempts to parse it into a K data structure you can then manipulate:

		  url:"http://api.openweathermap.org/data/2.5/weather?q=London,uk"
		"http://api.openweathermap.org/data/2.5/weather?q=London,uk"
		  t:1:url
		(200;[coord:[lon:-0.13;lat:51.51];sys:[type:1;id:5091;message:0.0224;country:"GB";sunrise:1425709902;sunset:1425750674];weather:,[id:800;main:"Clear";description:"Sky is Clear";icon:"01d"];base:"cmc stations";main:[temp:288.11;pressure:1024;humidity:44;temp_min:286.85;temp_max:289.82];wind:[speed:6.2;deg:230];clouds:[all:0];dt:1425736003;id:2643743;name:"London";cod:200])
		  t[1;`weather;0;`description]
		"Sky is Clear"

- monadic `5:` returns a printable string representation of the right argument, as in K3. Sometimes this can be useful for debugging:

		  5: 1 2 3
		"1 2 3"
		  5:"foo"
		"\"foo\""
		  5: {x+2*y}
		"{[x;y]x+2*y}"

If you visit the page with a `?run=` URL parameter, the remainder of the URL will be URI decoded and executed. The `\u` command can create a link for you based on an expression. You can combine this feature with monadic `0:` to run larger programs:

	  \u 1+2
	oK code url:
	http://johnearnest.github.io/ok/index.html?run=%201%2B2
	
	  \u .*|0:"https://gist.githubusercontent.com/anonymous/cc0ef05c00940044eb0a/raw/"
	oK code url:
	http://johnearnest.github.io/ok/index.html?run=%20.*%7C0%3A%22https%3A%2F%2Fgist.githubusercontent.com%2Fanonymous%2Fcc0ef05c00940044eb0a%2Fraw%2F%22

Command Line Mode
-----------------
Alternatively, you can run oK via the command line with  [Node.js](http://nodejs.org). `test.js` runs a series of automated tests:

	je@indigo$ node test.js

You can also try out oK from the included REPL. Note that at the time of writing, the release version of Node.js does not portably support blocking reads from stdin- the REPL has been tested with Node v0.11.14 on OSX.

	je@indigo$ node repl.js 
	oK v0.1
	
	  +/4 5 6
	15

	  1 2 3+2 5
	length error.
	
	  a:"some text"
	"some text"
	
	  "t"=a
	0 0 0 0 0 1 0 0 1

This REPL is very simplistic compared to the CLI provided in a complete K interpreter and lacks interactive debugging facilities. When you're done, type `\\` or press Ctrl+D to exit. If you supply a filename as an argument to the REPL, it will instead execute that file:

	je@indigo$ node repl.js examples/hangman.k
	_____ > p
	_pp__ > e
	_pp_e > a
	app_e > l
	apple

Mobile
------
On mobile devices like cell phones, try [oK Mobile](http://johnearnest.github.io/ok/mobile.html)!

Tilting your device horizontally will provide a QWERTY touch-keyboard, and a vertical orientation will provide a calculator-like keypad which provides access to all K verbs and adverbs with a single keypress. Tapping on items from the output history copies them to your edit buffer.

oK mobile provides graphing functionality in the form of the built-in `pl` (plot line) and `ps` (plot scatter) functions. Both will automatically rescale to suit the data you provide. The first argument to each function specifies the domain (x axis) and can be a list of numbers or a single number n (interpreted as `!n`). The second argument specifies the range (y axis) and can be a list of numbers or a monadic function f (interpreted as `f'x`).

oK mobile supports the `0:` verb for reading from (monadically) or writing to (dyadically) browser-local storage. If the left argument is an empty symbol, output will be printed to the console, as with most K interpreters. Symbols and strings are interchangeable as `0:` sources/destinations. Monadic `5:` produces a printable string representation of its right argument.

The dyadic `6:` verb permits creating custom user menus. The left argument must be a string, which will be used as a title for the menu. The right argument may be either a list or a dictionary of monadic/niladic functions. If the right argument is a list, the menu will contain a button for each list item, and clicking the button will append that button's contents to the edit line. If the right argument is a dictionary, buttons will be created for each key and clicking the button will execute the associated monad/nilad. If the nilad returns a string, it will be appended to the edit line. Consider a few examples:

	"simple"  6: ("foo";`bar;`baz);
	"my menu" 6: `a`b!({`0:"pressed A";0};{`0:"pressed ",x;0});
	"another" 6: `a`b!({`0:"pressed A";0};{"append this"});

If you store a K string in a local storage variable named `boot`, it will be executed when oK mobile starts up. Similarly, if you store a dictionary in a local storage variable named `env` it will replace the default environment at startup. Either of these mechanisms may be used to stash your favorite utility functions or frequently used data. Recall that `.{}` can be used at the base level to retrieve a reference to the root environment, so `"env" 0: .{}` is one way to back up your entire workspace. Setting either `boot` or `env` to the empty list `()` will stub it out and prevent it from being used at startup.

Finally, oK mobile supports a basic set of backslash commands:

- `\c` clear the output log.
- `\t` time executing the remainder of the line.
- `\x` list all presently defined functions.
- `\y` list all presently defined variables.

How Does It Work?
-----------------
oK's interpreter centers around trees of objects (called k-values) which represent K datatypes. Every k-value has a field `t` which indicates the object type and a `v` field containing JavaScript value(s) such as arrays or numbers. Some k-values do not correspond to K types but instead represent nodes of an abstract syntax tree (AST) comprising a program, and may contain additional fields.

The section titled _Primitive Verbs_ contains implementations of the wide range of primitive operators in K which operate on and return k-values. In these implementations the overloaded variations of K primitives which operate on different datatypes have often been split into several distinct functions.

The section titled _Primitive Adverbs_ is similar, providing implementations of K adverbs which manipulate k-values. One way that oK deviates from other K interpreters is that it does not internally discriminate between lists and unitype vectors, which forces adverbs to perform dynamic dispatch of the verb they apply every time they iterate. This simplifies the implementation but comes with substantial overhead.

The _Interpreter_ provides a verb dispatch table (organized between monadic/dyadic forms and variations between verb forms applied to combinations of list and non-list (atomic) datatypes) and mechanisms for walking k-value trees to evaluate expressions. The functions `am`, `ad`, `ar` and `al` generalize the process of "conforming" datatypes to feed into primitive functions. This section also contains the functions which implement the `.`, `@` and `amend`/`dmend` primitives as they are more tightly connected to and used by the interpreter than most others. This section also contains a class called Environment which represents a linked-dictionary structure used for variable lookup and scope management. To execute a k-value tree, use the `run()` function and provide a reference to a global Environment to reference.

The _Tokenizer_ uses regular expressions to identify and consume lexical tokens from K source text. Presently the tokenizer maintains some global state so that it is not necessary to thread tokenizer state throughout the parser.

The _Parser_ uses an ad-hoc left-to-right recursive-descent approach. This gets a bit hairy and is likely to change substantially over time. As it breaks a program into tokens and assembles a k-value AST, it also desugars some special syntactic forms to avoid complexity in the interpreter. For example, a compound assignment of the form

	t[x]+:y

Is rewritten into an application of the form `dmend`:

	..[`t;x;+:;y]

To convert a JavaScript string into a k-value tree, use the `parse()` function.

The _Prettyprinter_ reverses the work of the Parser, turning a k-value back into a human-comprehensible, properly indented form. oK's prettyprinter output of a function or verb chain represents the desugared form of expressions and thus during debugging can help clarify whether a problem occurs at the parser or interpreter level. Formatting is very similar to that used by other K interpreters but may differ in small ways, generally erring on the side of longer, more explicit output. Invoke the prettyprinter by using the `format()` function on a k-value or JavaScript array of k-values.
