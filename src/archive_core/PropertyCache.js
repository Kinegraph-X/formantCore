/**
 * @module ObjectCache
 */
/**
 * @typedef {import('src/coreTest/TemplateFactory.js').ComponentTemplate} ComponentTemplate
 * @typedef {import('src/coreTest/TemplateFactory.js').ViewTemplate} ViewTemplate
 * @typedef {import('src/coreTest/TemplateFactory.js').ReactivityQueryArray} ReactivityQueryArray
 * @typedef {import('src/coreTest/TemplateFactory.js').AbstractPropArray} AbstractPropArray
 * @typedef {import('src/coreTest/TemplateFactory.js').EventSubscriptionArray} EventSubscriptionArray
 */

/** @typedef {ComponentTemplate|ViewTemplate|ReactivityQueryArray|AbstractPropArray|EventSubscriptionArray} TemplatePart */
class ObjectCache {
	/** @type {Map<string, TemplatePart>} */
	cache = new Map();
	/** @type {string|null} */
	firstID = null;
	
	/** @param {string} name */
	constructor(name) {
		this.name = name;
	}
	/** @param {string} uid */
	hasItem(uid) {
		return this.cache.has(uid);
	}
	/** @param {string} uid */
	getItem(uid) {
		return this.cache.get(uid);
	}
	/** @param {string} uid */
	deleteItem(uid) {
		return this.cache.delete(uid);
	}
	/** @param {string} uid @param {TemplatePart} value */
	newItem(uid, value) {
		if (this.firstID === null)
			this.firstID = uid;
		return this.cache.set(uid, value);
	}
	reset() {
		this.cache.clear();
	}
} 












// var RequestCache = function(name) {
	
// 	ObjectCache.call(this, name);
// 	this.currentlyLiveRequests = [];
// }
// RequestCache.prototype = Object.create(ObjectCache.prototype);

// RequestCache.prototype.setItem = function(UID, requestObj, addToLiveSet) {
// 	var req;
	
// 	if (addToLiveSet && (typeof this.getItem(UID) === 'undefined' || req.idxInChache === null)) {
// 		req =  this.newItem(UID.toString(), requestObj);
// 		req.idxInCache = this.currentlyLiveRequests.length;
// 		this.currentlyLiveRequests.push(this.getPromiseFromRequest(req));
// 		return Promise.all(this.currentlyLiveRequests.map(function(liveRequest) {
// 				return liveRequest.promise;
// 			}, this));
// 	}
// 	else if (addToLiveSet && typeof this.getItem(UID) !== 'undefined') {
// 		req =  this.newItem(UID.toString(), requestObj);
// 		this.currentlyLiveRequests.splice(req.idxInChache, 1, this.getPromiseFromRequest(req));
// 		return Promise.all(this.currentlyLiveRequests.map(function(liveRequest) {
// 				return liveRequest.promise;
// 			}, this));
// 	}
// 	req =  this.newItem(UID.toString(), requestObj);
// 	return req;
// }

// RequestCache.prototype.getPromiseFromRequest = function(req) {
// //	var self = this;
// 	return {
// 				request : req,
// 				promise : new Promise(function(resolve, reject) {
// 					req.subscribe(function cachedSubDeletedAfterCachedPromiseResolve() {
// //						console.log('subscription executed');
// 						resolve();	// req.getResult()
						
// 						// TODO: Find a way to unsubscribe
// //						this.subscriptions[this.subscriptions.length - 1].unsubscribe();
// 					});
// 				})
// 			};
// }

// RequestCache.prototype.getLiveRequests = function(endPointNamesArray) {
// 	return Promise.all(
// 		this.currentlyLiveRequests
// 			.filter(function(liveRequest) {
// 				return endPointNamesArray.indexOf(liveRequest.request.name) !== -1;
// 			}).map(function(liveRequest) {
// 				return this.getPromiseFromRequest(liveRequest.request).promise
// 			}, this)
// 	);	
// }

// RequestCache.prototype.filterLiveRequests = function(endPointNamesArray) {
// //	return Promise.all(this.currentlyLiveRequests);	
// }









module.exports = {
	ObjectCache
	// RequestCache : RequestCache,
};