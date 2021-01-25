/**
 * @store propertyCache
 * 
 */

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
		this.currentlyLiveRequests.push(
			this.getPromiseFromRequest(req)
		);
		return Promise.all(this.currentlyLiveRequests);
	}
	else if (addToLiveSet && typeof this.getItem(UID) !== 'undefined') {
		req =  this.newItem(UID.toString(), requestObj);
		this.currentlyLiveRequests.splice(req.idxInChache, 1, this.getPromiseFromRequest(req));
		return Promise.all(this.currentlyLiveRequests);
	}
	req =  this.newItem(UID.toString(), requestObj);
	return req;
}

RequestCache.prototype.getPromiseFromRequest = function(req) {
	var self = this;
	return new Promise(function(resolve, reject) {
		var subscription = req.subscribe(function() {
//		console.log('subscription executed');
			resolve();	// req.getResult()
			subscription.unsubscribe();
		});
	});
}

RequestCache.prototype.getLiveRequests = function(groupID) {
	return Promise.all(
		this.currentlyLiveRequests
			.filter(function(req) {
				return req.name === groupID;
			})
	);	
}

RequestCache.prototype.filterLiveRequests = function(groupID) {
	return Promise.all(this.currentlyLiveRequests);	
}













module.exports = {
	ObjectCache : ObjectCache,
	RequestCache : RequestCache
};