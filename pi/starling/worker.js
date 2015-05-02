#!/usr/bin/env node --harmony

"use strict";

/*
* STARLING 
* Gathers data from each sensor and publishes them to subscriber WOLF.
*/

const
    config    = require('./config'),
	fs        = require('fs'),
	zmq       = require('zmq'),
	publisher = zmq.socket('pub');

	// Create device metric.
	let	message = JSON.stringify({
			action    : 'createMetric',
			suid      : 'NWJjODVhYThkZTM1OWNlYzM1NWU3Y2YwMTRiMzlk',
			device_id : 1,
			value     : 3
		});

	setInterval(function() {
		console.log('PUB: %s', message);

		publisher.send(message);
	}, 1000);

// Publish to bind socket.
publisher.bind(config.target, function(err) {
	console.log("✔ PUB on port: %s", config.target);
});

