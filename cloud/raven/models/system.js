"use strict";

const
	Base         = require('./base'),
	SystemUser   = require('./system_user'),
	SystemDevice = require('./system_device');

var System = Base.Model.extend({

	tableName: 'systems',

	users: function() {
	    return this.hasMany(SystemUser);
	},

	devices: function() {
	    return this.hasMany(SystemDevice);
	}

});

module.exports = Base.model('System', System);
