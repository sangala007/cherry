"use strict";

var config = {
	production: {
		mode : 'production',
		port : 3001,
		db   : {
			client     : 'mysql',
			connection : {
				host     : 'localhost',
				user     : 'node', 
				password : 'no1de2', 
				port     : 3306, 
				database : 'cherry',
				charset  : 'utf8'
			}
		},
		subTarget    : 'tcp://localhost:9002',
		cookieSecret : '123456ASDFGH',
		mongodbUrl   : 'http://localhost:27017'
	},

	development: {
		mode : 'development',
		port : 3001,
		db   : {
			client     : 'mysql',
			connection : {
				host     : 'localhost',
				user     : 'node', 
				password : 'no1de2', 
				port     : 3306, 
				database : 'cherry',
				charset  : 'utf8'
			}
		},
		subTarget    : 'tcp://localhost:9002',
		cookieSecret : '123456ASDFGH',
		mongodbUrl   : 'http://localhost:27017'
	}
};

module.exports = config[process.env.NODE_ENV || 'development'];
