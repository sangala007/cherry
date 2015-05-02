"use strict";

const
	Base   = require('./base'),
	when   = require('when'),
	bcrypt = require('bcrypt-nodejs'),
	_      = require('lodash');

var User = Base.Model.extend({

	tableName: 'users',

	comparePassword: function(candidatePassword) {
		var deferred = when.defer();

		bcrypt.compare(candidatePassword, this.get('password'), function(err, isMatch) {
			if (err) {	deferred.reject(err); }
			deferred.resolve(isMatch);
		});

		return deferred.promise;
	},

	generatePasswordHash: function (password) {
		var deferred = when.defer();

		bcrypt.genSalt(5, function(err, salt) {
			if (err) { deferred.reject(err); }

			bcrypt.hash(password, salt, null, function(err, hash) {
				if (err) { deferred.reject(err); }

				deferred.resolve(hash);
			});
		});

		return deferred.promise;
	},

	saving: function (newObj, attr, options) {
		var self = this;

		if (self.isNew() || self.hasChanged('password')) {
			return self.generatePasswordHash(self.get('password'))
				.then(function (hash) {
					self.set({password: hash});
					return Base.Model.prototype.saving.apply(self, _.toArray(arguments));
				});
		}

		return Base.Model.prototype.saving.apply(self, _.toArray(arguments));      
	}

});

module.exports = Base.model('User', User);