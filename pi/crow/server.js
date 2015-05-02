'use strict';

const
	config       = require('./config'),
	express      = require('express'),
	http         = require('http'),
    httpProxy    = require('http-proxy'),
	socket       = require('socket.io'),
	domain       = require('domain'),
	logger       = require('morgan'),
	bodyParser   = require('body-parser'),
	cookieParser = require('cookie-parser'),
  	hbs          = require('hbs'),
    path         = require('path'),
	fs           = require('fs'),
    Util         = require('./lib/util');

// App.
var	app = express();

// Server
var server = http.Server(app);

// Proxy Server.
var proxyServer = httpProxy.createProxyServer({
	target : config.proxyHost+':'+config.proxyPort,
	ws     : true
});

// Modify outgoing proxy request by adding our headers.
proxyServer.on('proxyReq', function(proxyReq, req, res, options) {
	Util.appendProxyReqHeaders(proxyReq);
});

// Listent to proxied response.
proxyServer.on('proxyRes', function (proxyRes, req, res) {
	Util.processProxyResHeaders(proxyRes);
});

// Log proxy error.
proxyServer.on( 'error', function(err, req, res) {
	console.log('PROXY_SERVER_ERROR:', err);
	res.status(500);
	res.render('500', {proxyError: err});
});

// Handlebars
app.engine('hbs', hbs.__express);
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layouts/default' });
app.set('views', path.join(__dirname, 'views'));
app.disable('view cache');

hbs.localsAsTemplateData(app);
hbs.registerPartials(path.join(__dirname,'views', 'partials'));

// Process each request in this DOMAIN so we can rescue any uncaught errors.
app.use(function(req, res, next) {
	// Create domain for this request.
	var reqDomain = domain.create();

	// On error 
	reqDomain.on('error', function(err){
		console.log('DOMAIN_ERROR', err);
		try {
			process.exit(1);

			// Disconnect from cluster.
			var worker = require('cluster').worker;
			if (worker) { worker.diconnet(); }

			// Stop taking new request.
			server.close();

			try {
				// Try to use our error route.
				next(err);

			} catch(err) {
				// Send plain node error response.
				res.statusCode = 500;
				res.setHeader('content-type', 'text/plain');
				res.end('Server Error');
			}

		} catch(err) {
			console.log(err);
		}
	});

	// Add objets to our domain.
	reqDomain.add(req);
	reqDomain.add(res);
	reqDomain.run(next);
});

// Parse cookies
app.use(cookieParser(config.cookieSecret));

// Forms
app.use(bodyParser.json());
app.use(bodyParser.text());

// NOTE: This middleware throws error when submitting POST to our proxy server.
// { [Error: socket hang up] code: 'ECONNRESET' }
// app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static( path.join(__dirname, 'public') ));

// Logging
app.use(logger('dev'));

// Routing.
require('./routes.js')(app, proxyServer);

// Websocket connection negotiation.
server.on('upgrade', function (req, socket, head) {
	proxyServer.ws(req, socket, head);
});

// Start server.
server.listen(config.port, function() {
	console.log("✔ Server listening on port %d in %s mode", config.port, app.get('env'));
});

// Catch an exception so we do not kill this process.
process.on('uncaughtException', function (err) {
    console.log(err);
});

// console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
// console.log('RAW Response from the target', proxyRes.statusCode);
// console.log('RAW Response from the target:', proxyRes.headers);



