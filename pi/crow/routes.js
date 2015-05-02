"use strict";

const
	home     = require('./controllers/home'),
	internet = require('./controllers/internet');

module.exports = function(app, proxy) {

 	/*
	* Requests to this app.
	*/
	app.get('/', home.index);
	app.get('/internet*', home.index);

	// Access all our pages only via POST request.
	app.post('/internet', internet.index);
	app.post('/internet/connect', internet.postConnect);

	/*
	* Proxy all other requests.
	*/
	app.get('*', function(req, res, next) {
		proxy.web(req, res);
	});

	app.post('*', function(req, res, next) {
		proxy.web(req, res);
	});

	// Custom 404 page.
	app.use(function(req, res) {
		res.status(404);
		res.render('404');
	});

	// Custom 500 page.
	if (app.get('env') === 'production') {
		app.use(function(err, req, res, next) {
			res.status(500);
			res.render('500');
		});
	}
};