"use strict";

var Util = require('../lib/util');

module.exports = {

	index: function(req, res, next) {
		// Check for existing system id.
		var suid = Util.getSystemMeta().suid;

		// Test internet connection.
		Util.checkInternet(function(isConnected) {
			res.render('home/index', {
				connected : isConnected,
				suid      : suid
			});
		});
	}
};
