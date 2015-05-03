#!/usr/bin/env node --harmony

"use strict";

/*
* STARLING 
* Gather data from each sensor and publish them to subscriber WOLF.
*/

const
    config    = require('./config'),
	fs        = require('fs'),
	zmq       = require('zmq'),
	publisher = zmq.socket('pub');

	setInterval(function() {
		// Create device metric.
		let
			message = JSON.stringify({
				action    : 'createMetric',
				suid      : 'NWJjODVhYThkZTM1OWNlYzM1NWU3Y2YwMTRiMjlh',
				device_id : (Math.floor(Math.random() * 4)+1),
				value     : Math.random()
			});

		console.log('PUB: %s', message);

		// Publish message with suid identity.
		publisher.send(message);
	}, 1000);

// Publish to bind socket.
publisher.bind(config.target, function(err) {
	console.log("✔ PUB on port: %s", config.target);
});

