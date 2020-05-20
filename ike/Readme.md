iKe
===
iKe is an experimental programming environment built on oK. It allows you to rapidly write event-driven graphical programs in K. Try it [In your browser](http://johnearnest.github.io/ok/ike/ike.html)!

![Livecoding Demo](https://raw.githubusercontent.com/JohnEarnest/ok/gh-pages/ike/img/livecoding.gif)

The interface consists of an editor pane on the left with a status bar and display on the right. Pressing shift+enter in the editor will compile and run the K program. Escape will halt a running program. Pressing shift+enter with a section of text selected will execute just that snippet and display the results, allowing quick experimentation and sanity checking.

Read about iKe in *Vector*: [A graphical sandbox for K](http://archive.vector.org.uk/art10501610).

Output
------
To draw to the display, you must provide a definition of a monadic function, view or variable named `draw`. This will be invoked 30 times per second (see `tr`) and should return/consist of a list of tuples. Each tuple must contain a vector indicating an (x;y) position on screen, a palette and a bitmap. The palette consists of a list of strings representing any valid DOM color code such as "black" or "#FAC". The bitmap is a matrix of indices into the palette. By default, the display is 160x160 pixels.

For example, the following definition of `draw` will draw a small blue on red box at a random position:

	draw: {,(2?w;("#00F";"#F00");(1111b;1001b;1001b;1111b))}

Tuples will be drawn in the order they appear. For improved flexibility, any field of the tuple can be replaced with a symbol. Symbols will be looked up as variables when drawing. The above example could be rewritten as follows:

	p: 2?w
	c: ("#00F";"#F00")
	b: (1111b
	    1001b
	    1001b
	    1111b)
	draw: {,`p`c`b}

Observe how in the first example the box is drawn at a different position every time, but in the second example it is drawn in a consistent position as `2?w` is only evaluated once and then stored.

If the "position" element of any drawing tuple is a matrix instead of a vector, the bitmap will be drawn several times at each (x;y) pair. This makes it very easy to draw many identical objects simulatenously:

	draw: {,((5 5;30 5;18 20);`lcd;text@6)}

If the "position" element is null, the bitmap will be drawn centered on the screen:

	draw: ,(;cga;50 30#2)

If the "palette" element is null, the bitmap will be drawn using the built-in palette `cga`:

	draw: ,(;;t+\:t:3!-20!!160)

If the "bitmap" element of any drawing tuple is a number or a vector, it will be drawn as a single pixel or a horizontal strip of pixels, respectively. Drawing single pixels in this way is generally quite inefficient, but drawing horizontal strips in combination with a vector of positions can produce some interesting "rasterbar" effects.

If the tuple does not contain a bitmap, it represents drawing a filled polygon. The 0th palette color will be used for drawing the edges of the polygon (stroke) and the 1st palette color will be used to fill the polygon:

	draw: ,((10 10;20 10;15 20);cga@3 2)

If you try to draw a polygon without specifying any coordinates, it represents clearing the screen. The following example will fill the screen with a red background:

	draw: ,(;("blue";"red"))

Ticks
-----
If you define a monadic function `tick`, it will be called periodically based on `tr`. Often this function will mutate surrounding state to be drawn by `draw`. The input to `tick` will, on the first frame of a program, be the contents of a variable named `once`, and the result of executing `tick` will then be stored in `once`. When `draw` is called, the value of `once` is likewise fed in. For convenience, if `once` is not explicitly initialized it will be treated as an empty list. Consider the following example:

	once: 10 15
	tick: {1 2+x}
	draw: {,(x;;5 5#3)}

![Tick Lifecycle](https://raw.githubusercontent.com/JohnEarnest/ok/gh-pages/ike/img/tick.png)

By using this approach it is possible to write programs with evolving state using only _pure_ (side-effect free) definitions of `draw` and `tick`.

Sound
-----
To add sound to your programs, define a monadic function or variable named `play`. Sound playback further requires a definition of `draw`. iKe plays waveforms at a sample rate given by the variable `srate` with samples in the range [-1.0, 1.0]. If `play` is a list or scalar it will be repeated as necessary to supply continuous audio:

	draw: ,(;;)
	play: .2*?500 / a short noise sample

If `play` is a function, it will be called with a single argument indicating the number of samples which have been produced since the program started. This function will be called periodically whenever the audio subsystem requires more samples. For best performance, it is a good idea to produce a number of samples on each call and return them as a list, rather than one at a time. Here's an example which plays a sine wave:

	draw: ,(;;)
	play: {.2*sin .2*x+!1000}

Input Events
------------
For dynamic behavior, iKe will call a number of K functions (provided they have been defined) whenever certain events occur:

- `kd`: key down. provides a DOM keyCode as an argument.
- `ku`: key up. provides a DOM keyCode as an argument.
- `kx`: key typed. provides a DOM charCode as an argument.
- `kr`: return/enter pressed. Provides 10 as an argument (to match `kx`).
- `kb`: backspace pressed. Provides 8 as an argument (to match `kx`).
- `lx`: left/right. provides -1/1 when left/right cursor keys are pressed.
- `ux`: up/down. provides -1/1 when up/down cursor keys are pressed.
- `md`: mouse down. provides mouse x and y in pixels as arguments.
- `mu`: mouse up. provides mouse x and y in pixels as arguments.
- `mm`: mouse moved. provides mouse x and y in pixels as arguments.
- `mg`: mouse dragged. provides mouse x and y in pixels as arguments.

Built-in Functions
------------------
iKe extends the basic k5 intrinsics `sin` `cos` `log` and `exp` with a broader range of math and utility functions:

- `abs`: monadic. absolute value.
- `tan`: monadic. tangent.
- `acos`: monadic. inverse cosine.
- `asin`: monadic. inverse sine.
- `atan`: monadic. inverse tangent.
- `cosh`: monadic. hyperbolic cosine.
- `sinh`: monadic. hyperbolic sine.
- `tanh`: monadic. hyperbolic tangent.
- `pow`: dyadic. raise x to the y power.
- `atan2`: dyadic. version of arctangent which disambiguates quadrants.
- `pn`: triadic. 3d Perlin Noise generator.

Variables
---------
iKe pre-defines and updates several K variables for your convenience:

- `w`: the width of the screen in pixels (read and write)
- `h`: the height of the screen in pixels (read and write)
- `f`: counts up once for each drawn frame (read only)
- `dir`: a 2d vector with the (x;y) offset of the cursor keys currently held (read only)
- `keys`: a vector of the keycodes currently held (read only)
- `mx`: the horizontal position of the mouse in pixels (read only)
- `my`: the vertical position of the mouse in pixels (read only)
- `pi`: the mathematical constant Pi (read only)
- `tr`: tick rate; how many times per second `tick` and `draw` are fired (read and write)
- `fc`: when recording an animated GIF, the number of frames to render. (read and write)

iKe provides a number of pre-defined palettes. Since transparency is useful, the last color of most palettes is fully transparent:

- `cga`: CGA palette 1 (4 colors + transparency)
- `hot`: hot dog stand (4 colors + transparency)
- `lcd`: Similar to the pea-soup LCD display of the GameBoy (4 colors + transparency)
- `solarized`: The [solarized](http://ethanschoonover.com/solarized) palette. (16 colors + transparency)
- `dawnbringer`: [dawnbringer's](http://pixeljoint.com/forum/forum_posts.asp?TID=12795) pixel art palette. (16 colors + transparency)
- `windows`: Windows 3.1 palette (16 colors + transparency)
- `arne`: [Arne's](http://androidarts.com/palette/16pal.htm) Generic 16 color game palette. (16 colors + transparency)
- `pico`: The [PICO-8](http://www.lexaloffle.com/pico-8.php) fantasy game console's 16 color palette. (16 colors + transparency)
- `gray`: Grayscale, black to white. (256 colors)

![palettes](https://raw.githubusercontent.com/JohnEarnest/ok/gh-pages/ike/img/swatches.png)

iKe also provides a built-in 8x8 character set called `text`:

	,(;cga;~,/'+text"Hello, World!")

The character set is aligned with 7-bit ASCII and control characters are replaced with some useful graphic characters including symbols and box drawing characters:

![font](https://raw.githubusercontent.com/JohnEarnest/ok/gh-pages/ike/img/font.png)

External Resources
------------------
Sometimes you may wish to include large resources in a sketch without creating a bulky matrix literal. iKe has a facility for loading images from a specified URL. Create a comment at the beginning of a line which starts with "/i" to load an image. After "/i", specify the name you wish to give the image, a semicolon, the name of a built-in palette, a semicolon and then the URL where the image may be found.

When your program is run, these special comments will be processed and the resources will be unpacked into K's environment. iKe makes a best-effort (least sum-of-squares per-channel difference) attempt at converting colors in the image into the specified palette when it is loaded.

    /i blu;solarized;http://i.imgur.com/IVfDjMj.png
    draw: ,(0 0;`solarized;`blu)

Note that image loading _only_ works with built-in palettes- image loading happens before any of your K code has a chance to execute!

Ajax
----
Your programs can perform asynchronous HTTP requests to remote servers which return appropriate CORS headers. The `ajax` function takes three arguments: a URL, an HTTP verb and some K monad which will be called with the result of the request when it becomes available. Server response bodies will be parsed as JSON and then converted into convenient K data structures.

	ajax["http://www.com/api.json";"GET";{ dosomething x }]

Animated GIFs
-------------
The "record" button asks iKe to render an animated GIF of the program's output. The result will have `fc` frames, which will each have an interframe delay which respects `tr`. Note that the resulting GIFs may be very large- consider running them through an optimizer like [Gifsicle](https://www.lcdf.org/gifsicle/).
