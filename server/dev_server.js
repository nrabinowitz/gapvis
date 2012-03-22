var httpProxy = require('http-proxy'),
    httpServer = require('http-server'),
    argv = require('optimist')
        .default({
            p: 8080,
            s: 8181,
            a: '/api',
            r: '.'
        })
        .alias({
            t: 'proxy-target',
            p: 'proxy-port',
            s: 'static-port',
            a: 'api-root',
            r: 'static-root'
        })
        .demand('t')
        .argv;
    
var proxyPort = argv.p,
    staticPort = argv.s,
    staticRoot = argv.r,
    proxyHost = 'localhost' + argv.a,
    staticHost = 'localhost',
    router = {};

// proxy server
router[proxyHost] = argv.t;
router[staticHost] = 'localhost:' + staticPort;
httpProxy.createServer({
  router: router,
  changeOrigin: true
}).listen(proxyPort);

console.log('Proxy server started on port ' + proxyPort);

// static file server
httpServer.createServer({
    root: staticRoot
}).listen(staticPort);

console.log('Static server started on port ' + staticPort);