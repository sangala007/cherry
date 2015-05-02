#!/usr/bin/env node --harmony

'use strict';

/*
* STARLING 
* Gathers data points from each sensor and publishes it to its subscriber (WOLF).
* Cluster process, keeps at least one worker always alive.
*/

const	
	path    = require("path"),
	cluster = require('cluster');

cluster.setupMaster({
    exec : path.join(__dirname, 'worker.js')
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

// Master process.
console.log('Master: '+process.pid+' is up.');

cluster.fork();