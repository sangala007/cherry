#!/usr/bin/env node --harmony

"use strict";

/* 
* DOG
* CLUSTER routes requests to pool of workers. 
* It creates a master and worker processes.
* As a master process it creates ROUTER and DEALER.
*/

const 
    config  = require('./config'),
    Util    = require('../lib/util'),
	cluster = require('cluster'),
	zmq     = require('zmq'),
	os      = require('os');

if (cluster.isMaster) {
	// Master process.
	console.log('Master: '+process.pid+' is up.');

	// Create ROUTER and DEALER.
	let
		// Listen for incoming connection from WOLF.
		router = zmq.socket('router').bind(config.target),

		// Bind to interprocess connection.
		dealer = zmq.socket('dealer').bind('ipc://filer-dealer.ipc');

	// Forward messages between router and dealer.
	router.on('message', function() {
		let frames = Array.prototype.slice.call(arguments);
		// console.log(Util.dumpFrames(frames));
		dealer.send(frames);
	});

	// Forward messages from DEALER to ROUTER.
	dealer.on('message', function() {
		let frames = Array.prototype.slice.call(arguments);
		router.send(frames);
	});

	// Listen for workers to come online.
	cluster.on('online', function(worker){
		console.log('Worker: %d is online', worker.process.pid);
	});

	// Log any worker that disconnect. 
	cluster.on('disconnect', function(worker) {
		console.log('Worker: %d disconnected from cluster', worker.id);
	});

	// When a worker dies, create a new one to replace it.
	cluster.on('exit', function(worker, code, signal) {
		console.log('Worker: %d died with exit code %d (%s)', worker.id, code, signal);		
		cluster.fork();
	});

	// os.cpus().forEach(function() {
	cluster.fork();
	// });

	// for (let i = 1; i < 4; i++) { cluster.fork(); }

} else {
	// Start worker process.
	require('./worker.js')();
}
