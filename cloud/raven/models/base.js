"use strict";

const
	App       = require('../app'),
	Bookshelf = App.bookshelf;

Bookshelf.Model = Bookshelf.Model.extend({

	initialize: function () {
		var self = this;

		self.on('saving', function (model, attributes, options) {
			return self.saving(model, attributes, options);
		});

		self.on('destroying', function (model, attributes, options) {
			self.destroying(model, attributes, options);
		});
	},

	getTableName: function () {
		return this.tableName;
	},

	getJSON: function (props) {
		var self = this;
		var json = {};

		props.forEach(function (prop) {
			json[prop] = self.get(prop);
		});

		return json;
	},

	saving: function (newObj, attr, options) {
		let 
			self  = this,
			table = self.getTableName(),
			now   = new Date();

		if (self.isNew()) {
			self.set('created_on', now);
			self.set('updated_on', now);

		} else {
			self.set('updated_on', now);
		}
	},

	destroying: function () {
		var ownerId       = this.get('id');
		var currentUserId = App.user.get('id');
		var role          = App.user.related('role').get('name');

		// Super user cannot destroy own account
		if (!this.hasPermission() || (this.tableName === 'users' && ownerId === currentUserId && role === 'Super Administrator')) {
			throw new Error('You do not have permission to perform that action');
		}
	}
});

module.exports = Bookshelf;

