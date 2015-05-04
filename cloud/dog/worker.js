#!/usr/bin/env node --harmony

"use strict";

/*
* DOG
* Receive messages from WOLF and reply to it with response.
* Also, publish received messages for subscriber RAVEN.
*/

const
    config  = require('./config'),
    Util    = require('../lib/util'),
	fs      = require('fs'),
	zmq     = require('zmq'),
	mysql   = require('mysql');

function start() {
	let
		// Create and bind to interprocess RESPONSE socket.
		responder = zmq.socket('rep').connect('ipc://filer-dealer.ipc'),

		// Bind to publish incoming messages to subscriber RAVEN.
		publisher = zmq.socket('pub').bind(config.pubTarget),

		// MySQL connection.
		dbh = mysql.createConnection(config.mysql);

	dbh.connect();

	// Handle incoming request from WOLF.
	responder.on('message', function(req) {
		let
			data      = JSON.parse(req), // Parse incoming request.
			system_id = Util.idFromToken(data.suid), // Get system_id from token.
			respCode  = 200;

		// Publish incoming message to subscriber RAVEN
		// with added system_id as message identity.
		publisher.send([system_id, JSON.stringify(data)]);

		console.log('%d REQ: %s', process.pid, JSON.stringify(data));

		switch (data.action) {
			case 'createMetric':
				// Select the system device.
				dbh.query('SELECT * FROM system_devices WHERE id = ? AND system_id = ?',
					[data.device_id, system_id], 
					function(err, rows, fields) {
						if (err) { 
							console.log(err); 
							respCode = 500;
							return;
						}

						if (rows.length < 1) {
							// Insert new record for it.
							dbh.query('INSERT INTO metrics (system_id, system_device_id, value) VALUES(?, ?, ?)',
								[system_id, data.device_id, data.value, Date.now()],
								function(err, rows, fields) {
									if (err) { 
										console.log(err);
										respCode = 500;										
									}
								}
							);
						}
					}
				);
				break;

			default:
				break;
		}

		// Send response.
		responder.send(JSON.stringify({
			code: respCode
		}));
	});

	process.on('SIGTERM', function(){
		console.log('%d SIGTERM', process.pid);
		dbh.end();
	});

	process.on('SIGINT', function(){
		console.log('%d SIGINT', process.pid);
		dbh.end();
	});

	console.log("✔ REQ/RES: %s, PUB: %s", config.target, config.pubTarget);
};

/*
* Invoke the server
* as stand alone, or as imported module.
*/

if (require.main === module) {
    start();

} else {
	module.exports = start;
}
