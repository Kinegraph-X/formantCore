/**
 * @constructor APIconsumerInterface
 */


var TypeManager = require('src/core/TypeManager');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');

var APIconsumerInterface = function(host) {
	this.host = host;
	this.objectType = 'APIconsumerInterface';
}
APIconsumerInterface.prototype = Object.create(Object.prototype);
APIconsumerInterface.prototype.objectType = 'APIconsumerInterface';

APIconsumerInterface.prototype.subscribeToProvider = function(serverAPI, entryPoint) {
	var request;
	if (typeof serverAPI.registerEndPoint === 'function') {
//		console.log(entryPoint);
		request = serverAPI.registerEndPoint(entryPoint);
		this.host._subscriptions.push(request.subscribe(this.host));
		return this.host._subscriptions[this.host._subscriptions.length - 1];
	}
}

APIconsumerInterface.prototype.subscribeToAllProviders = function(serverAPI) {
	var requests;
	if (serverAPI.sources.length) {
		return requests = serverAPI.subscribeToAllProviders(this.host);
	}
}

APIconsumerInterface.prototype.reactOnSelfInject = function(def) {
	if (def && !def.reactOnSelf.findObjectByValue('from', 'serviceChannel')) {
		return {
				from : 'serviceChannel',
				cbOnly : true,
				subscribe : function(value) {
					this.typedSlots[0].resetLength();
					
					if (Array.isArray(value)) {
						// we got at least a set, but maybe a group of sets
						if (Array.isArray(value[0])) {
							// it's a group
							if (value[0][0]._id) {
								// we found the effective obj
								var items = value.map(function(set) {
									return this.typedSlots[0].newItem(set);
								}, this);
								this.typedSlots[0].pushApply(items);
							}
						}
						else {
							// it's a single set
							this.typedSlots[0].push(
								this.typedSlots[0].newItem(value)
							);
						}
					}
					else
						console.warn(this.objectType, 'set-viewers are meant to instanciate lists, but value received was not an array');
				}
			};
	}
	else
		return false;
}










module.exports = APIconsumerInterface;