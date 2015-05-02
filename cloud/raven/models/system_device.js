"use strict";

const
	Base       = require('./base'),
	System     = require('./system'),
	DeviceType = require('./device_type'),
	Metric     = require('./metric');

var SystemDevice = Base.Model.extend({

	tableName: 'system_devices',

	system: function() {
		return this.belongsTo(System);
	},

	type: function() {
		return this.belongsTo(DeviceType);
	},

	metrics: function() {
	    return this.hasMany(Metric);		
	}

});

module.exports = Base.model('SystemDevice', SystemDevice);
