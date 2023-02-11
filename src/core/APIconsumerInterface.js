/**
 * @constructor APIConsumerInterface
 */


var TypeManager = require('src/core/TypeManager');
//var rDataset = require('src/core/ReactiveDataset');
//var Components = require('src/core/Component');

var APIConsumerInterface = function(host) {
	this.host = host;
	this.objectType = 'APIConsumerInterface';
}
APIConsumerInterface.prototype = Object.create(Object.prototype);
APIConsumerInterface.prototype.objectType = 'APIConsumerInterface';

APIConsumerInterface.prototype.subscribeToProvider = function(serverAPI, entryPoint) {
	var request;
	if (typeof serverAPI.registerEndPoint === 'function') {
//		console.log(entryPoint);
//		this.slotsAssociation[entryPoint] = 0;
		request = serverAPI.registerEndPoint(entryPoint);
		this.host._subscriptions.push(request.subscribe(this.host));
		return this.host._subscriptions[this.host._subscriptions.length - 1];
	}
}

APIConsumerInterface.prototype.subscribeToAllProviders = function(serverAPI) {
	var requests;
	if (serverAPI.sources.length) {
		return requests = serverAPI.subscribeToAllEndPoints(this.host);
	}
}

APIConsumerInterface.prototype.shouldInjectReactOnSelf = function(def) {
	if (def && !def.reactOnSelf.findObjectByValue('from', 'serviceChannel')) {
		return [{
				from : 'serviceChannel',
				cbOnly : true,
				subscribe : function(value) {
//					console.log(this.typedSlots);
//					console.log(this.slotsAssociation);
//					console.log(value);
//					console.log(this);
					
					// Immediatly break if we didn't receive an array from the API request
					if (!Array.isArray(value.payload)) {
						console.error(this.objectType, 'For consistancy reasons, clients are meant to instanciate lists, but value received was not an array. Returning...');
						return;
					}
					// Immediatly break if we're not able to handle the response
					// => another compnent MUST subscribe to this serviceChannel stream
					if (!this.slotsAssociation
						|| typeof this.slotsAssociation[endPointName] !== 'number'
						|| typeof this.typedSlots === 'undefined'
						|| !this.typedSlots.length)
						return;
					
					// Proceed
					var val, endPointName, endPointIndex;
					if (value.endPointName) {
						endPointName = value.endPointName;
						val = value.payload.slice(0); 
					}
					
					endPointIndex = (this.slotsAssociation && this.slotsAssociation[endPointName]) || 0;
					this.typedSlots[endPointIndex].resetLength();
					
					
					
					// DEBUG
//					if (this.slotsAssociation) {
//						console.log(endPointName, this.slotsAssociation[endPointName]);
////							if (typeof this.slotsAssociation[endPointName] !== 'number')
////								console.log(endPointName, this.slotsAssociation);
////							else 
//							if (this.typedSlots[endPointIndex])
//								console.log(endPointName, this.typedSlots[endPointIndex].defaultListDef.getHostDef().template.getGroupHostDef().type);
//							else
//								console.log(endPointName, this.typedSlots);
//					}
////					else
////						console.log(endPointName, 'no slotsAssociation');
					

					
					// we got at least a set, but maybe a group of sets
					if (Array.isArray(val[0])) {
						// it's a group
						if (val[0][0]._id) {
							// we found the effective obj
							var items = val.map(function(set) {
								return this.typedSlots[endPointIndex].newItem(set);
							}, this);
							this.typedSlots[endPointIndex].pushApply(items);
						}
					}
					else {
						// it's a doc without nested docs
						this.typedSlots[endPointIndex].push(
							this.typedSlots[endPointIndex].newItem(val)
						);
					}
				}
			}];
	}
	else
		return false;
}










module.exports = APIConsumerInterface;