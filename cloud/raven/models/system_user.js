"use strict";

const
	Base = require('./base'),
	User = require('./user');

var SystemUser = Base.Model.extend({

	tableName: 'system_users',

	user: function() {
		return this.belongsTo(User);
	}
});

module.exports = Base.model('SystemUser', SystemUser);