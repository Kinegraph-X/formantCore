/**
 * @constructor APIscaleTypeConsumerInterface
 */


var TypeManager = require('src/core/TypeManager');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');

var APIscaleTypeConsumerInterface = function(host) {
	this.host = host;
	this.objectType = 'APIscaleTypeConsumerInterface';
}
APIscaleTypeConsumerInterface.prototype = Object.create(Object.prototype);
APIscaleTypeConsumerInterface.prototype.objectType = 'APIscaleTypeConsumerInterface';

APIscaleTypeConsumerInterface.prototype.subscribeToProvider = function(serverAPI, entryPoint) {
	var request;
	if (typeof serverAPI.registerEndPoint === 'function') {
//		console.log(entryPoint);
		request = serverAPI.registerEndPoint(entryPoint);
		this.host._subscriptions.push(request.subscribe(this.host));
	}
}

APIscaleTypeConsumerInterface.prototype.reactOnSelfInject = function(def) {
	if (def && !def.reactOnSelf.findObjectByValue('from', 'serviceChannel')) {
		return {
				from : 'serviceChannel',
				cbOnly : true,
				subscribe : function(value) {
					this.typedSlots[0].resetLength();
					var scalesAsStreams = this.getCustomStreams();
					
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
								
								this.typedSlots[0].forEach(function(item, idx) {
									this._children[idx]._children.forEach(function(child, key) {
										child.streams.colorGetter = scalesAsStreams[key];
									}, this);
								}, this);
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










module.exports = APIscaleTypeConsumerInterface;