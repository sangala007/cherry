"use strict";

// Middleware to check if user is recognized.
var auth = require('../lib/auth');

module.exports = function(app) {
	var AccountController = app.controllers.account;

	app.get('/login', auth.isNotAuthenticated, AccountController.login);
	app.post('/login', auth.isNotAuthenticated, AccountController.postLogin);

	app.get('/account/create', AccountController.create);
	app.post('/account/create', AccountController.postCreate);

	app.get('/forgot', auth.isNotAuthenticated, AccountController.forgot);
	app.post('/forgot', auth.isNotAuthenticated, AccountController.postForgot);

	app.get('/logout', auth.isAuthenticated, AccountController.logout);
};