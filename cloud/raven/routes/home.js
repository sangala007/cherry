"use strict";

// Middleware to check if user is recognized.
var auth = require('../lib/auth');

module.exports = function(app) {
	var HomeController = app.controllers.home;

	app.get('/', HomeController.index);
	app.get('/home', HomeController.index);
	app.get('/fail', auth.isAuthenticated, HomeController.fail);
};