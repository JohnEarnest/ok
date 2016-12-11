/ mandelbrot set renderer
xr: -2 .5                    / horizontal interval
yr: -1.2 1.2                 / vertical interval

r: {(&/x)+((-/|x)%w)*!w}     / sample range
m: {x+(-/y*y;2**/y)}         / mandelbrot iteration
i: {+/{4>+/x*x}'15 m[x]\0}   / iterate to convergence
c: (r xr),/:\:r yr           / screen point coordinates

,(;|arne;i''c)
