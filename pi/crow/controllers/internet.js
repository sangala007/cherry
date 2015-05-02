"use strict";

var Util = require('../lib/util');

module.exports = {

	// Display available access points.
	index: function(req, res, next) {
		res.render('internet/networks');
	},

	// Connect to network.
	postConnect: function(req, res, next) {
		// 1. Do the connection magic.

		// 2. Check the connection.
		Util.checkInternet(function(isConnected) {
			if (isConnected) {
				res.redirect('/account/create');

			} else {
				res.render('internet/connect', {
					connected: false
				});
			}
		});
	}
};
