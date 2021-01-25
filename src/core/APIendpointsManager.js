/**
 * @constructor APIendpointsManager
 */


var TypeManager = require('src/core/TypeManager');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');

var ObservedHTTPRequest = require('src/core/ObservedHTTPRequest');

var APIendpointsManager = function(name, APIurl, APIpath, transformFunc, endPointsArray) {
	
	this.name = name;
	this.sources = [];
	this.objectType = 'APIendpointsManager';
	
	this.APIurl = APIurl; 
	this.APIpath = APIpath;
	this.transformFunc = transformFunc;
	
	this.knownEndPoints = [];
	this.endPointsRegister = {};
	
	if (Array.isArray(endPointsArray) && endPointsArray.length) {
		this.iterateOnEndPoints(
			endPointsArray,
			APIurl,
			APIpath,
			transformFunc
		);
	}
}
APIendpointsManager.prototype = Object.create(Object.prototype);
APIendpointsManager.prototype.objectType = 'APIendpointsManager';

APIendpointsManager.prototype.iterateOnEndPoints = function(endPointsArray, APIurl, APIpath, transformFunc) {
	endPointsArray.forEach(function(endPoint, key) {
		this.registerEndPoint(endPoint);
	}, this);
}

/**
 * @param {string} endPoint
 */
APIendpointsManager.prototype.newEndPoint = function(endPoint) {
	this.knownEndPoints.push(endPoint);
	return new ObservedHTTPRequest(this.name, this.APIurl, endPoint + this.APIpath, this.transformFunc);
}

/**
 * @param {string} endPoint
 */
APIendpointsManager.prototype.registerEndPoint = function(endPoint) {
	var request;
	if (this.knownEndPoints.indexOf(endPoint) === -1) {
		request = this.newEndPoint(endPoint);
		this.endPointsRegister[endPoint] = this.sources.length;
		this.sources.push(
			request
		);
	}
	else {
		request = this.sources[this.endPointsRegister[endPoint]];
	}
	return request;
}

/**
 * Subscribe through the present APIendpointsManager: the "client" (a component instance)
 * 		MUST implement the ClientComponent Interface (a "core" interface: there's a 
 * 		"core" decorator to assist implementing that interface)
 * @param {string} endPoint
 */
APIendpointsManager.prototype.subscribeToEndPoint = function(endPoint, client) {
	var request = this.sources[this.endPointsRegister[endPoint]];
	client.subscribeToProvider(request);
}

/**
 * Subscribe through the present APIendpointsManager: the "client" (a component instance)
 * 		MUST implement the ClientComponent Interface (a "core" interface: there's a 
 * 		"core" decorator to assist implementing that interface)
 * @param {string} endPoint
 */
APIendpointsManager.prototype.subscribeToAllEndPoints = function(client) {
	var requests = [];
	this.sources.forEach(function(source, key) {
		client._subscriptions.push(requests[key] = source.subscribe(client));
	});
	return requests;
}

/**
 * Subscribe through the present APIendpointsManager: accepts any component instance
 * 		upper than or equal to ComponentWithView
 * @param {string} endPoint
 */
APIendpointsManager.prototype.agnosticSubscribeToEndPoint = function(endPoint, client) {
	var request = this.sources[this.endPointsRegister[endPoint]];
	client._subscriptions.push(request.subscribe(client));
}

/**
 * functions suffixed "Async" returns the result of the request:
 * 		- result is empty, and we have no way to chain a callback
 * 			=> suitable when we just need to initiate a reactivity cascade
 * function suffixed with "AsPromise" returns a Promise:
 * 		- that Promise may be the "live" promise.All residing in the cache
 * 			=> returns an array containing ? TODO: explicit the content of that array
 * 		- that promise may be the "automatic" Promise we get from the "async" function
 * 			=> returns explicitly the result of the request after transformation
 */ 
APIendpointsManager.prototype.acquireAsync = function() {
	var results = [];
	this.sources.forEach(this.getResultsLazy.bind(null, results));
	return results;
}

APIendpointsManager.prototype.acquireAsPromise = function() {
	this.acquireAsync();
	return TypeManager.permanentProvidersRegistry.getLiveRequests(this.name);
}

APIendpointsManager.prototype.getResultsLazy = async function(results, source, key) {
	var uniqueName = source.name + '_' + source.pathToData;
	TypeManager.permanentProvidersRegistry.setItem(uniqueName, source, 'addToLiveSet');
	await source.sendRequest();
	results.push(source.requestAsAStream.value);
}

/**
 * @param {string} groupID : this.name has been set to allow retrievel on the registry
 */
APIendpointsManager.prototype.refreshEndPointAsync = function(groupID) {
	var result = {
		response : null
	};
	var source = this.sources.findObjectByValue('name', groupID);
	TypeManager.permanentProvidersRegistry.setItem(source.name + '-' + source.pathToData, source, 'addToLiveSet');
	source.sendRequest().then(function(res) {
		result.response = source.requestAsAStream.value;
	});
	
	return result;
}

APIendpointsManager.prototype.refreshEndPointAsPromise = async function(groupID) {
	var source = this.sources.findObjectByValue('name', groupID);
	await source.sendRequest();
	return source.requestAsAStream.value;
}










module.exports = APIendpointsManager;