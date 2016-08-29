/ retrieve the current 'value' of Bitcoin
/ via an AJAX/JSON web API provided by CoinDesk.com

url: "https://api.coindesk.com/v1/bpi/currentprice.json"
ajax[url;"GET";{time:: -12#x[`time][`updated]
                price:: x[`bpi][`GBP][`rate]}]

time:  "--:--:-- UTC"
price: "---.---"
pr: ~,/'+text@
draw:: ((10 10;cga;pr "Bitcoin Price At")
        (10 20;cga;pr time)
        (10 30;cga;pr "$",price))
