var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    httpProxy = require('http-proxy'),
    httpServer = require('http-server');
    
var proxyPort = process.argv[2] || 8000,
    staticPort = 8181,
    proxyHost = 'localhost/api',
    staticHost = 'localhost',
    router = {};

// proxy server
router[proxyHost] = 'gap.alexandriaarchive.org';
router[staticHost] = 'localhost:' + staticPort;
httpProxy.createServer({
  router: router,
  changeOrigin: true
}).listen(proxyPort);

// static file server
httpServer.createServer({
    root: '.'
}).listen(staticPort);

console.log('Server started on port ' + proxyPort);