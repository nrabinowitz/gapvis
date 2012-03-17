var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    httpProxy = require('http-proxy');
    
var serverPort = process.argv[2] || 8000;
    
var proxy = new httpProxy.RoutingProxy();

http.createServer(function (req, res) {
    // proxy API
    if (req.url.indexOf('/api') === 0) {
        req.url = req.url.substr(4);
        console.log(('Proxy: ' + req.url).green);
        proxy.proxyRequest(req, res, {
            target: {
                host: 'gap.alexandriaarchive.org',
                port: 80
            },
            changeOrigin: true
        });
    } else {
        // simplest file server ever
        var file = '.' + req.url;
        console.log('Serve: ' + file);
        if (path.existsSync(file)) {
            fs.readFile(file, function(error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                }
                else {
                    res.writeHead(200);
                    res.end(content, 'utf-8');
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    }
}).listen(serverPort);

console.log(('Server started on port ' + serverPort).magenta);