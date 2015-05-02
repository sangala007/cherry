"use strict";

const
	Base         = require('./base'),
	System       = require('./system'),
	SystemDevice = require('./system_device');

var Metric = Base.Model.extend({

	tableName: 'metrics',

	system: function() {
		return this.belongsTo(System);
	},

	device: function() {
		return this.belongsTo(SystemDevice);		
	}
});

module.exports = Base.model('Metric', Metric);