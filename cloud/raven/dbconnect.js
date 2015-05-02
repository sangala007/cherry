var Bookshelf = null;

module.exports = function(config) {
	"use strict";

	if (Bookshelf) {
		return Bookshelf;
	}

	var knex = require('knex')({
		client     : config.db.client,
		connection : config.db.connection,
		pool       : {
			min: 0,
			max: 5
		},
		debug: false
	});

	Bookshelf = require('bookshelf')(knex);

	// Patch for circular module dependency problem created by Bookshelf models.
	Bookshelf.plugin('registry')

	return Bookshelf;  
};
