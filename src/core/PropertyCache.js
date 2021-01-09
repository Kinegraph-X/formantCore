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
	this.currentlyBlockingPromises = [];
}
RequestCache.prototype = Object.create(ObjectCache.prototype);

RequestCache.prototype.setItem = function(UID, value, blocking) {
	var req;
	
	if (blocking && (typeof this.getItem(UID) === 'undefined' || req.idxInChache === null)) {
		req =  this.newItem(UID.toString(), value);
		req.idxInCache = this.currentlyBlockingPromises.length;
		this.currentlyBlockingPromises.push(
			this.getPromiseFromRequest(req)
		);
		return Promise.all(this.currentlyBlockingPromises);
	}
	else if (blocking && typeof this.getItem(UID) !== 'undefined') {
		req =  this.newItem(UID.toString(), value);
		this.currentlyBlockingPromises.splice(req.idxInChache, 1, this.getPromiseFromRequest(req));
		return Promise.all(this.currentlyBlockingPromises);
	}
	req =  this.newItem(UID.toString(), value);
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

RequestCache.prototype.getBlockingRequests = function() {
	return Promise.all(this.currentlyBlockingPromises);	
}














module.exports = {
	ObjectCache : ObjectCache,
	RequestCache : RequestCache
};