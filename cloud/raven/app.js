#!/usr/bin/env node --harmony

'use strict';

const
	EventEmitter = require('events').EventEmitter,
	config       = require('./config'),
	bookshelf    = require('./dbconnect')(config),
	errorHandler = require('errorhandler'),
	express      = require('./server'),
	load         = require('express-load');

var emitter     = new EventEmitter();

// Flag to check if app is already running.
var appIsRunning = false;

var App = {

	bookshelf: bookshelf,

	/*
	* Application events handler.
	*/
	on: function() {
		emitter.on.apply(this, _.toArray(arguments));
	},

	/*
	* Application event dispatcher.
	*/
	emit: function() {
		emitter.emit.apply(this, _.toArray(arguments));
	},

	/*
	* Initialize the application
	*/
	init: function (port) {
		// prevent re-initialization of the app
		if (appIsRunning) {
			return false;
		}

		var self = this;

		// Create express server.
		var server = self.server = express(config);

		// Make current user accessible from applicaction object.
		server.use(function(req, res, next) {
			if (req.user) self.user = req.user;

			next();
		});

		// Load modules.
		load('controllers').then('routes').into(server);

		// Custom 404 page.
		server.use(function(req, res) {
			res.status(404);
			res.render('404');
		});

		// Error handling.
		switch(server.get('env')) {
			case 'production':
				server.use(function(err, req, res, next) {
					res.status(500);
					res.render('500');
				});
				break;

			default:
				// Use only in development environment.
				server.use(errorHandler());
				break;
		}

		// Start server.
		server.listen(port || server.get('port'), server.get('ipAddress'), function() {
			console.log("✔ Server listening on port %d in %s mode", port || server.get('port'), server.get('env'));

			appIsRunning = true;
		});
	}
};

module.exports = App;
