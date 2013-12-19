var _ = require('underscore');
var util = require('util');

var Base = require('./base');

var Update = function(args) {
	Update.super_.call(this, args);
};

util.inherits(Update, Base);

Update.prototype.action = 'update';
Update.prototype.method = 'post';
Update.prototype.plurality = 'singular';

Update.prototype.fetch = function(req, res, context) {

	var model = this.model;
	var endpoint = this.endpoint;

	criteria = context.criteria;

	endpoint.attributes.forEach(function(attribute) {
		criteria[attribute] = req.params[attribute];
	});

	model.find({ where: criteria })
		.success(function(instance) {
			context.instance = instance;
			context.continue();
		})
		.error(function(err) {
			res.json(500, { error: err });
			context.stop();
		});
};

Update.prototype.write = function(req, res, context) {

	var endpoint = this.endpoint;
	var instance = context.instance;

	_(context.attributes).extend(_(req.body).clone());

	this.endpoint.attributes.forEach(function(a) {
		context.attributes[a] = req.params[a];
	});

	instance.setAttributes(context.attributes);
	
	var err = instance.validate();
	if (err) {
		res.json(400, { error: err });
		return context.stop();
	}

	instance.save()
		.success(function(instance) {
			context.instance = instance;
			return context.continue();
		})
		.error(function(err) {
			res.json(500, { error: err });
			return context.stop();
		});
};

module.exports = Update;

