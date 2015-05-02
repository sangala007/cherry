"use strict";

const
	_             = require('lodash'),
	passport      = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User          = require('../models/user');

passport.serializeUser(function(user, done) {
	done(null, user.get('id'));
});

passport.deserializeUser(function(id, done) {
	User.forge({id: id}).fetch().then(function(user) {
		done(false, user);

	}).otherwise(function (error) {
		done(error);
	});
});

// Sign in using Email and Password.
passport.use(new LocalStrategy({ usernameField: 'email' }, 
	function(email, password, done) {
		User.forge({email: email})
		.fetch()
		.then(function(user) {
			if (!user) {
				return done(null, false, {message: 'Email ' + email + ' not found'});
			}

			user.comparePassword(password)
			.then(function(isMatch) {
				if (isMatch) {
					done(null, user);

				} else {
					done(null, false, { message: 'Invalid password.' });
				}

			}).otherwise(function () {
				done(null, false, { message: 'Invalid password.' });
			});

		}).otherwise(function (err) {
			console.log(err);
			done(null, false, {message: 'Database error!'});
		});
	}
));

function isCrowHeader(req) {
	req = req || {};
	return (req.headers.hasOwnProperty('x-special-proxy-header')) ? true : false;
};

module.exports = {
	// Login Required middleware.
	isAuthenticated: function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	},

	isNotAuthenticated: function(req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		}
		res.redirect('/');
	},

	// Check request header if it's from our proxied service.
	isCrowHeader: function(req) {
		return isCrowHeader(req);
	},

	// Is request from our proxied service?
	isFromCrow: function(req, res, next) {
		if (isCrowHeader(req)) {
			return next();
		}
		res.redirect('/')
	}
}








