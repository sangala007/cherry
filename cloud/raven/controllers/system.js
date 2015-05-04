"use strict";

const
	App          = require('../app'),
	Bookshelf    = App.bookshelf,
	User         = require('../models/user'),
	System       = require('../models/system'),
	SystemUser   = require('../models/system_user'),
	SystemDevice = require('../models/system_device'),
	DeviceType   = require('../models/device_type'),
	Util         = require('../../lib/util'),
	passport     = require('passport'),
	_            = require('lodash'),
	timezones    = require("../lib/timezones");

function render_404(res) {
	res.status(404);
	res.render('404');
};

module.exports = {

	/*
	* GET: /system/create
	* Only from PI device.
	*/
	create: function(req, res, next) {
		res.render('system/create',{
			timezones: timezones
		});
	},

	/*
	* POST: /system/create
	* Only from PI device.
	*/
	postCreate: function(req, res, next) {
		req.assert('name', 'Name cannot be blank.').notEmpty();
		req.assert('timezone', 'Timezone cannot be blank.').notEmpty();

		var errors = req.validationErrors();

		if (errors) {
			req.flash('errors', errors);
			res.render('system/create', {
				params: req.body
			});
			return;
		}

		Bookshelf.transaction(function(t) {
			// 1. Create new system.
			System.forge({
				name     : req.body.name,
				timezone : req.body.timezone

			}).save(null, {transacting: t}).then(function(systemModel) {
				// 2. Create new system user.
				SystemUser.forge({
					user_id   : req.user.id,
					system_id : systemModel.get('id')

				}).save(null, {transacting: t}).then(function(systemUserModel) {
					t.commit(systemUserModel);

				}).catch(function(e){
					t.rollback(e);
					throw e;
				});

			}).catch(function(e){
				t.rollback(e);
				throw e;
			});

		}).then(function(systemUserModel) {
			req.flash('success', {msg: 'Success!'});

			var suid = Util.idToToken(systemUserModel.get('system_id'));

			// Add encrypted system_id as token to response HEADERS.
			res.setHeader('x-special-suid-header', suid);

			// Continue on flow to include devices.
			res.redirect('/system/'+suid+'/devices');

		}).catch(function(e) {
			console.log('ERROR saving system:' + e);
			req.flash('errors', {'msg': e.message});
			res.redirect('/system/create');
		});
	},

	/*
	* GET: /system/:suid/devices
	*/
	devices: function(req, res, next) {
		var system_id = Util.idFromToken(req.params.suid);
		if (!system_id) { return render_404(res); }

		var deviceTypes;
		new DeviceType().fetchAll().then(function(collection) {
			 deviceTypes = collection;
		});

		new System({
			id: system_id

		}).fetch({
			require     : true,
			debug       : true,
			withRelated : ['devices']

		}).then(function(system) {
// console.log(deviceTypes.toJSON());
			res.render('system/devices', {
				suid        : req.params.suid,
				system      : system.toJSON(),
				deviceTypes : deviceTypes.toJSON()
			});

		}).otherwise(function() {
			render_404(res);
		});
	}

};










