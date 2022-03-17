/**
 * @store propertyCache
 * 
 */

var unkownTypesCount = 0;

var ObjectCache = function(name) {
	this.name = name;
	this.cache = {};
	this.firstID = null;
}

ObjectCache.prototype.getItem = function(mainID, composedWithID) {
	if (!composedWithID)
		return this.cache[mainID.toString()];
	else
		return this.cache[mainID.toString() + '-' + composedWithID.toString()];
}

ObjectCache.prototype.setItem = function(mainID, mainValue, composedWithID) {
	if (!composedWithID)
		return this.newItem(mainID.toString(), mainValue);
	else
		return this.newItem(mainID.toString() + '-' + composedWithID.toString(), mainValue);
}

ObjectCache.prototype.deleteItem = function(mainID, composedWithID) {
	if (!composedWithID)
		delete this.cache[mainID.toString()];
	else
		delete this.cache[mainID.toString() + '-' + composedWithID.toString()];
}

ObjectCache.prototype.newItem = function(UID, value) {
	this.cache[UID] = value;
	if (this.firstID === null)
		this.firstID = UID;
	return value;
}

ObjectCache.prototype.reset = function() {
	for (let UID in this.cache) {
		if (Array.isArray(this.cache[UID]))
			this.cache[UID].length = 0;
	}
}












var RequestCache = function(name) {
	
	ObjectCache.call(this, name);
	this.currentlyLiveRequests = [];
}
RequestCache.prototype = Object.create(ObjectCache.prototype);

RequestCache.prototype.setItem = function(UID, requestObj, addToLiveSet) {
	var req;
	
	if (addToLiveSet && (typeof this.getItem(UID) === 'undefined' || req.idxInChache === null)) {
		req =  this.newItem(UID.toString(), requestObj);
		req.idxInCache = this.currentlyLiveRequests.length;
		this.currentlyLiveRequests.push(this.getPromiseFromRequest(req));
		return Promise.all(this.currentlyLiveRequests.map(function(liveRequest) {
				return liveRequest.promise;
			}, this));
	}
	else if (addToLiveSet && typeof this.getItem(UID) !== 'undefined') {
		req =  this.newItem(UID.toString(), requestObj);
		this.currentlyLiveRequests.splice(req.idxInChache, 1, this.getPromiseFromRequest(req));
		return Promise.all(this.currentlyLiveRequests.map(function(liveRequest) {
				return liveRequest.promise;
			}, this));
	}
	req =  this.newItem(UID.toString(), requestObj);
	return req;
}

RequestCache.prototype.getPromiseFromRequest = function(req) {
//	var self = this;
	return {
				request : req,
				promise : new Promise(function(resolve, reject) {
					req.subscribe(function cachedSubDeletedAfterCachedPromiseResolve() {
						console.log('subscription executed');
						resolve();	// req.getResult()
						
						// TODO: Find a way to unsubscribe
//						this.subscriptions[this.subscriptions.length - 1].unsubscribe();
					});
				})
			};
}

RequestCache.prototype.getLiveRequests = function(endPointNamesArray) {
	return Promise.all(
		this.currentlyLiveRequests
			.filter(function(liveRequest) {
				return endPointNamesArray.indexOf(liveRequest.request.name) !== -1;
			}).map(function(liveRequest) {
				return this.getPromiseFromRequest(liveRequest.request).promise
			}, this)
	);	
}

RequestCache.prototype.filterLiveRequests = function(endPointNamesArray) {
//	return Promise.all(this.currentlyLiveRequests);	
}













var StateMachineCache = function(name) {
	
	ObjectCache.call(this, name);
	this.objectType = 'StateMachineCache';
	
	this.cache = [];
	this._orthogonalRegistry = {};
}
StateMachineCache.prototype = Object.create(ObjectCache.prototype);

StateMachineCache.prototype.stateDefExists = function(UID) {
	return this._orthogonalRegistry[UID];
}

StateMachineCache.prototype.newStateDef = function(UID, componentType, bindingDef, parentUID) {
	return [
		{
			sourceEvent : (bindingDef.from || bindingDef.to),
			onSelf : ((!bindingDef.from 
						|| !bindingDef.to 
						|| bindingDef.from === bindingDef.to) && true),
			componentType : componentType || ('undeclaredType_' + unkownTypesCount++),
			componentUID : UID,
			targetState : (bindingDef.to || bindingDef.from),
			hasConstraints : ('[' + (bindingDef.map && 'map') + ',' + (bindingDef.filter && 'filter') + ']'),
			hasSideEffects : (bindingDef.subscribe === null && true),
			bindingsCount : 0,
			bindingIsInError : false,
			parentUID : parentUID
		},
		[]
	]
}

StateMachineCache.prototype.newItem = function(UID, value, parentUID) {
	if (value[0].onSelf) {
		if (!this._orthogonalRegistry[value[0].componentUID]) {
			this.cache.push(value);
			this._orthogonalRegistry[value[0].componentUID] = value;	
		}
		else {
			this._orthogonalRegistry[value[0].componentUID][1].push(value);
			this._orthogonalRegistry[value[0].componentUID][0].bindingsCount++;
		}
	}
	else {
		if (!this._orthogonalRegistry[parentUID]) {
			var parentStateCache = this.newStateDef(
				parentUID,
				'_InitialStateSource',
				{
					from : '',
					to : '',
					map : null,
					filter : null,
					subscribe : null
				},
				null
			);
			this.cache.push(parentStateCache);
			this._orthogonalRegistry[parentUID] = parentStateCache;
		}
		
		if  (!this._orthogonalRegistry[value[0].componentUID])
			this._orthogonalRegistry[value[0].componentUID] = value;	
		
		this._orthogonalRegistry[parentUID][1].push(value);
		this._orthogonalRegistry[value[0].componentUID][0].bindingsCount++;
	}
	
	

//		this._orthogonalRegistry[value[0].componentUID] = value;
//		console.warn(this.objectType, 'Property binding for component [', value[0].componentUID, '] happened twice. Binding State toggled to "Error"');

		
//		this._orthogonalRegistry[value[0].componentUID].bindingIsInError = true;
		
	if (this.firstID === null)
		this.firstID = UID;
	return value;
}

StateMachineCache.prototype.registerTransition = function(UID, componentType, bindingDef, parentUID) {
	return this.newItem(UID, this.newStateDef(UID, componentType, bindingDef, parentUID), parentUID);
}


























module.exports = {
	ObjectCache : ObjectCache,
	RequestCache : RequestCache,
	StateMachineCache : StateMachineCache
};