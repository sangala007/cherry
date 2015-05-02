"use strict";

var config = {
	development: {
		mode         : 'development',
		port         : 3000,
		proxyHost    : 'http://localhost',
		proxyPort    : 3001,
		cookieSecret : '123456ASDFGH',
		dataDirPath  : '../data'
	}
};

module.exports = config[process.env.NODE_ENV || 'development'];
