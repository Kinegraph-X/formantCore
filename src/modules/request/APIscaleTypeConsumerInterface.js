/**
 * @constructor APIscaleTypeConsumerInterface
 */


var TypeManager = require('src/core/TypeManager');
//var rDataset = require('src/core/ReactiveDataset');
//var Components = require('src/core/Component');

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
		return this.host._subscriptions[this.host._subscriptions.length - 1];
	}
}

APIscaleTypeConsumerInterface.prototype.subscribeToAllProviders = function(serverAPI) {
	var requests;
	if (serverAPI.sources.length) {
		return requests = serverAPI.subscribeToAllEndPoints(this.host);
	}
}

APIscaleTypeConsumerInterface.prototype.shouldInjectReactOnSelf = function(def) {
	if (def && !def.reactOnSelf.findObjectByValue('from', 'serviceChannel')) {
//		console.log(def.reactOnSelf.findObjectByValue('from', 'serviceChannel'));
		return [{
				from : 'serviceChannel',
				cbOnly : true,
				subscribe : function(value) {
//					console.log(value);
					
					var endPointName, endPointIndex;
					if (value.endPointName) {
						endPointName = value.endPointName;
						value = value.payload; 
					}
					
					endPointIndex = (this.slotsAssociation && this.slotsAssociation[endPointName]) || 0;
					
					this.typedSlots[endPointIndex].resetLength();
					var scalesAsStreams = this.getCustomStreams();
					
					if (Array.isArray(value)) {
						// we got at least a set, but maybe a group of sets
						if (Array.isArray(value[0])) {
							// it's a group
							if (value[0][0]._id) {
								// we found the effective obj
								var items = value.map(function(set) {
									return this.typedSlots[endPointIndex].newItem(set);
								}, this);
								this.typedSlots[endPointIndex].pushApply(items);
								
								this.typedSlots[endPointIndex].forEach(function(item, idx) {
									this._children[idx]._children.forEach(function(child, key) {
										child.streams.colorGetter = scalesAsStreams[key];
									}, this);
								}, this);
							}
						}
						else {
							// it's a doc without nested docs (not suitable to build scales)
							this.typedSlots[endPointIndex].push(
								this.typedSlots[endPointIndex].newItem(value)
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










module.exports = APIscaleTypeConsumerInterface;