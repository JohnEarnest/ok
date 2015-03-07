oK
==

oK is a toy interpreter for a dialect of the [K programming language](http://en.wikipedia.org/wiki/K_(programming_language)) which aims to be an implementation of [K5](http://kparc.com), the still-evolving bleeding edge version of the language. Expect oK to be buggy, incomplete and occasionally flat-out wrong, but slowly improving over time. Read the [Differences](https://github.com/JohnEarnest/ok/blob/master/Differences.md) page for details about how K5 differs from previous versions of the language.

If you are interested in learning more about K, consider downloading the free version of [kdb](http://kx.com/software-download.php) from Kx Systems, the fine makers of K. Alternatively, [Kona](https://github.com/kevinlawler/kona) is an open-source reimplementation of K3/K4.

Trying oK
---------
oK does not intend to be particularly fast or suitable for any practical purpose beyond learning, instead emphasizing simplicity of implementation. JavaScript was chosen as an implementation language because it is familar to many programmers and has first-class functions.

The easiest way to run oK is using the [Browser-based REPL](http://johnearnest.github.io/ok/index.html). This REPL features a few special commands which can be issued at the beginning of a line:

- `\\` (while entering a multiline expression) cancel this expression.
- `\e` toggle the scratchpad editor pane. This editor's content is persisted via localstorage (in case your browser crashes or is closed accidentally). 
- `\r` run the contents of the editor pane. Alternately, press shift+enter with the editor focused.
- `\c` clear the output log.
- `\t` time executing the remainder of the line.
- `\x` execute the remainder of the line and show a step-by-step trace.

oK provides several numbered IO verbs:

- dyadic `0:` takes a symbol as its left argument and writes the right argument to that destination as text. Currently the symbol is ignored and output is always sent to the console. Use the empty symbol as a left argument.
- monadic `0:` takes a string as its right argument and performs a synchronous HTTP request to that URL. The result will be a tuple containing the HTTP status code followed by the response (if any). You can use this in conjunction with pastebins to load code from elsewhere or access RESTful web APIs:

	(200
	 "/ generate a times table→\nt*/:t:!10")
	  .*|0:"http://pastebin.com/raw.php?i=MQkT5mAc"
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

This REPL is very simplistic compared to the CLI provided in a complete K interpreter and lacks interactive debugging facilities. When you're done, type `\\` to exit. If you supply a filename as an argument to the REPL, it will instead execute that file:

	je@indigo$ node repl.js examples/hangman.k
	_____ > p
	_pp__ > e
	_pp_e > a
	app_e > l
	apple

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
