/**
 * @constructor SingleEndPointScaleTypeConsumerInterface
 */


var TypeManager = require('src/core/TypeManager');
//var rDataset = require('src/core/ReactiveDataset');
//var Components = require('src/core/Component');

var SingleEndPointScaleTypeConsumerInterface = function(host) {
	this.host = host;
	this.objectType = 'SingleEndPointScaleTypeConsumerInterface';
}
SingleEndPointScaleTypeConsumerInterface.prototype = Object.create(Object.prototype);
SingleEndPointScaleTypeConsumerInterface.prototype.objectType = 'SingleEndPointScaleTypeConsumerInterface';

SingleEndPointScaleTypeConsumerInterface.prototype.subscribeToProvider = function(serverAPI, entryPoint) {
	var request;
	if (typeof serverAPI.registerEndPoint === 'function') {
//		console.log(entryPoint);
		request = serverAPI.registerEndPoint(entryPoint);
		this.host._subscriptions.push(request.subscribe(this.host));
		return this.host._subscriptions[this.host._subscriptions.length - 1];
	}
}

SingleEndPointScaleTypeConsumerInterface.prototype.subscribeToAllProviders = function(serverAPI) {
	var requests;
	if (serverAPI.sources.length) {
		return requests = serverAPI.subscribeToAllEndPoints(this.host);
	}
}

SingleEndPointScaleTypeConsumerInterface.prototype.shouldInjectReactOnSelf = function(def) {
	if (def && !def.reactOnSelf.findObjectByValue('from', 'updateChannel')) {
//		console.log(def.reactOnSelf.findObjectByValue('from', 'serviceChannel'));
		return [{
				from : 'updateChannel',
				cbOnly : true,
				subscribe : function(value) {
//					console.log(value);
					
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
//							console.log(this.typedSlots[0]);
//							console.log('call to SingleEndPointScaleTypeConsumerInterface');
//							debugger;
							// it's a doc without nested docs (not suitable to build scales)
							this.typedSlots[0].push(
								this.typedSlots[0].newItem(value)
							);
							
						}
					}
					else
						console.warn(this.objectType, 'For consistancy reasons, clients are meant to instanciate lists, but value received was not an array');
				}
			}];
	}
	else
		return false;
}










module.exports = SingleEndPointScaleTypeConsumerInterface;