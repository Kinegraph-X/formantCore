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
//					console.log(value);
//					console.log(this);
					
					var endPointName, endPointIndex;
					if (value.endPointName) {
						endPointName = value.endPointName;
						value = value.payload; 
					}
					
					if (this.slotsAssociation && typeof this.slotsAssociation[endPointName] !== 'number')
						return;
						
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
					

					
					
//					console.log(endPointName, this, endPointIndex);
					
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
								
//								console.log(this.typedSlots[endPointIndex]);
//								debugger;
							}
						}
						else {
							// it's a doc without nested docs
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










module.exports = APIConsumerInterface;