"use strict";

const
	Base = require('./base');

var DeviceType = Base.Model.extend({

	tableName: 'device_types'

});

module.exports = Base.model('DeviceType', DeviceType);