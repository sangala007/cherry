"use strict";

const
	User     = require('../models/user'),
	passport = require('passport'),
	Auth     = require('../lib/auth'),
	_        = require('lodash');

module.exports = {

	/*
	* GET: /account/create
	*/
	create: function(req, res, next) {
		res.render('account/create');
	},

	/*
	* POST: /account/create
	*/
	postCreate: function(req, res, next) {
		req.assert('name', 'Name cannot be blank.').notEmpty();
		req.assert('email', 'Email is not valid.').isEmail();
		req.assert('password', 'Password must be at least 6 characters long.').len(6);
		req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);
		req.assert('secret', 'Secret cannot be blank.').notEmpty();
		req.assert('phone', 'Phone cannot be blank.').notEmpty();

		var errors = req.validationErrors();

		if (errors) {
			req.flash('errors', errors);
			res.render('account/create', {params: req.body});
			return;
		}

		var isFromCrow = Auth.isCrowHeader(req);

		// Save new user.
		User.forge({
			name     : req.body.name,
			email    : req.body.email,
			password : req.body.password,
			secret   : req.body.secret,
			phone    : req.body.phone

		}).save().then(function(model) {
			req.flash('success', {msg: 'Success!'});

			req.logIn(model, function(err) {
				if (err) { return next(err); }

				// Request proxied from CROW, redirect to next step.
				if (isFromCrow) {
					res.redirect('/system/create');
					return;
				}

				res.redirect('/account/create');
			});

		}).otherwise(function (error) {
			console.log(error);
			req.flash('errors', {'msg': error.message});
			res.render('account/create', {params: req.body});
		});
	},

	/*
	* GET: /login
	*/
	login: function(req, res, next) {
		res.render('account/login');
	},

	/*
	* POST: /login
	*/
	postLogin: function(req, res, next) {
		req.assert('email', 'Email is not valid').isEmail();
		req.assert('password', 'Password cannot be blank').notEmpty();

		var errors = req.validationErrors();

		if (errors) {
			req.flash('errors', {msg: errors});
			return res.redirect('/');
		}

		passport.authenticate('local', function(err, user, info) {
			if (err) { return next(err); }

			if (!user) {
				req.flash('errors', { msg: info.message });
				return res.redirect('/login');
			}

			req.logIn(user, function(err) {
				if (err) {
					req.flash('errors', { msg: err.message });
					res.redirect('/login');
				}

				req.flash('success', {msg: 'Welcome back!'});
				res.redirect(req.session.returnTo || '/');
			});
		})(req, res, next);
	},



	/*
	* GET: /forgot
	*/
	forgot: function(req, res, next) {
		res.render('/forgot', {
			fortune: fortune.getFortune()
		});
	},

	/*
	* POST: /forgot
	*/
	postForgot: function(req, res, next) {
		res.render('/forgot', {
			fortune: fortune.getFortune()
		});
	},

	/*
	* GET: /logout
	*/
	logout: function(req, res, next) {
	    req.logout();
		req.flash('success', {msg: 'You logged out!'});
	    res.redirect('/');
	}

};

