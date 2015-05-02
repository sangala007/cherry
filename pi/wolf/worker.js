#!/usr/bin/env node --harmony

"use strict";

/*
* WOLF
* Subscribe to messages published by STARLING. Once message is received
* issue a request to remote daemon DOG and await for its response.
*/

const
    config     = require('./config'),
	fs         = require('fs'),
	zmq        = require('zmq'),
	subscriber = zmq.socket('sub'),
	requester  = zmq.socket('req');

/*
* PUB/SUB
*/

// Subscribe to all messages from STARLING.
subscriber.subscribe('');

// Update DOG with published message from STARLING.
subscriber.on('message', function(data) {
	var message = JSON.stringify( JSON.parse(data) );
	console.log('REQ: %s', message);
	requester.send(message);
});

// Connect to publisher STARLING.
subscriber.connect(config.subTarget);


/*
* REQ/REP
*/

// Supply identity of this client.
requester.identity = "WOLF";

// Handle replies from DOG.
requester.on('message', function(data) {
	let response = JSON.parse(data);

	console.log('RES: '+JSON.stringify(response));
});

// Connect to Req/Rep remote service DOG.
requester.connect(config.reqTarget);

console.log("✔ SUB: %s, REQ/REP: %s", config.subTarget, config.reqTarget);

























