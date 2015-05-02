
const
	config = require('../config'),
	fs     = require('fs');

module.exports = {

	// Check for internet connection.
	checkInternet: function(cb) {
	            // cb(true);
	    require('dns').lookup('google.com', function(err) {
	        if (err && err.code == "ENOTFOUND") {
	            cb(false);
	        } else {
	            cb(true);
	        }
	    });
	},

	// Return id assigned to this system.
	getSystemMeta: function() {
		try {
			return JSON.parse( fs.readFileSync(config.dataDirPath+'/_system') );
		} catch(e) {
			return {};
		}
	},

	// Modify outgoing proxy request headers by adding system token.
	appendProxyReqHeaders: function(proxyReq) {
		var systemMeta = this.getSystemMeta();
		proxyReq.setHeader('x-special-proxy-header', systemMeta.suid || '');
	},

	// Save system token into disk when present in response headers.
	processProxyResHeaders: function(proxyRes) {
		var suid = proxyRes.headers['x-special-suid-header'];
		if (!suid) { return; }

		var filePath = config.dataDirPath+'/_system';

		// Write the system token into the file.
		fs.writeFileSync(filePath, JSON.stringify({suid:suid}), 'utf8');
	}

};

