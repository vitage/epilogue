var Endpoint = require('../lib/Endpoint');
var Controllers = require('./Controllers');

var Resource = function(args) {
	
	args = args || {};

	this.app = args.app;

	if (!args.model) throw new Error("resource needs a model");
	
	this.model = args.model;

	this.actions = args.actions || ['create', 'read', 'update', 'delete', 'list'];
		
	this.accept_criteries = args.accept_criteries || []

	this.endpoints = {
		plural: args.endpoints.shift(),
		singular: args.endpoints.shift()
	};

	this.controllers = {};

	this.actions.forEach(function(action) {

		var Controller = Controllers[action];
		var endpoint = this.endpoints[Controller.prototype.plurality];

		this.controllers[action] = new Controller({
			endpoint: endpoint,
			app: this.app,
			model: this.model,
			resource: this
		});

	}.bind(this));

	var hooks = Controllers.base.hooks;

	this.actions.forEach(function(action) {
		this[action] = this[action] || {}; 
		hooks.forEach(function(hook) {
			this[action][hook] = function(f) {
				this.controllers[action][hook] = f;
			}.bind(this);
			this[action][hook].before = function(f) {
				this.controllers[action][hook + '_before'] = f;
			}.bind(this);
			this[action][hook].after = function(f) {
				this.controllers[action][hook + '_after'] = f;
			}.bind(this);
		}.bind(this));
	}.bind(this));

	this.all = {};

	hooks.forEach(function(hook) {
		this.all[hook] = function(f) {
			this.actions.forEach(function(action) {
				this.controllers[action][hook] = f;
			}.bind(this));
		}.bind(this);
		this.all[hook].before = function(f) {
			this.actions.forEach(function(action) {
				this.controllers[action][hook + "_before"] = f;
			}.bind(this));
		}.bind(this);
		this.all[hook].after = function(f) {
			this.actions.forEach(function(action) {
				this.controllers[action][hook + "_after"] = f;
			}.bind(this));
		}.bind(this);

	}.bind(this));
};

module.exports = Resource;

