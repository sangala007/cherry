'use strict';

const
	config           = require('./config'),
	express          = require('express'),
	http             = require('http'),
	socket           = require('socket.io'),
	cluster          = require('cluster'),
	bookshelf        = require('./dbconnect')(config),
	bodyParser       = require('body-parser'),
	cookieParser     = require('cookie-parser'),
  	flash            = require('express-flash'),
	session          = require('express-session'),
	expressValidator = require('express-validator'),
	domain           = require('domain'),
	logger           = require('morgan'),
	load             = require('express-load'),
	csrf             = require('lusca').csrf(),
  	hbs              = require('hbs'),
    path             = require('path'),
    passport         = require('passport'),
	_                = require('lodash'),
	hbsHelpers       = require('./lib/helpers'),
	MongoStore       = require('connect-mongo')(session);

// App.
var app = express();

// Server
var server = http.Server(app);

// Socket
var io = socket(server);

// Handlebars settings
app.engine('hbs', hbs.__express);
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layouts/default' });
app.set('views', path.join(__dirname, 'views'));
app.disable('view cache');

hbs.localsAsTemplateData(app);
hbs.registerPartials(path.join(__dirname,'views', 'partials'));

// Setup and register handlebars helpers
hbsHelpers.setup(hbs);

// Process each request in this DOMAIN 
// so we can rescue any uncaught errors.
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

// Session management.
app.use(session({
	secret : config.cookieSecret,
	store  : new MongoStore({
    	host          : 'localhost', 
    	port          : 27017, 
    	db            : 'mydb',
		autoReconnect : true
	}),
	resave            : true,
	saveUninitialized : true
}));

// Login management
app.use(passport.initialize());
app.use(passport.session());

// Forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Input validation
app.use(expressValidator());

// Message display
app.use(flash());

// Serve static files
app.use(express.static( path.join(__dirname, 'public') ));

// Logging
app.use(logger('dev'));

// Log worker id with each request.
app.use(function(req, res, next) {
	if (cluster.isWorker) {
		console.log('Worker %d received request', cluster.worker.id);
	}
	next();
});

// CSRF protection.
var csrfWhitelist = []; //config.site.csrfWhitelist;

app.use(function(req, res, next) {
	if (_.contains(csrfWhitelist, req.path)) {
		return next();
	}
	csrf(req, res, next);
});

// Make user object available in templates.
app.use(function(req, res, next) {
	if (req.user) {
	  res.locals.user    = req.user.toJSON();
	  req.session.userid = req.user.get('id');
	}

	next();
});

// Load modules.
load('controllers').then('routes').into(app);

// Custom 404 page.
app.use(function(req, res) {
	res.status(404);
	res.render('404');
});

// Custom 500 page.
app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.render('500');
});

// Start server.
server.listen(config.port, function() {
	console.log("✔ Server listening on port %d in %s mode", config.port, app.get('env'));
});

/*
* Socket from web client.
*/
io.on('connection', function (socket) {
	console.log('Client connected.');

	setInterval(function(){ 
		// To client.
		socket.emit('message', fakeDevicesData());
	}, 2000);

	// From client.
	socket.on('rodgerThat', function (data) {
		// console.log('From client:', data);
	});
});

function fakeDevicesData() {
	return {
		devices : [
			{ id: 1, value: Math.random()},
			{ id: 2, value: Math.random()},
			{ id: 3, value: Math.random()}
		]
	}
}
