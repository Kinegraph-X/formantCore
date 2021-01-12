/**
 * @constructor ObservedHTTPRequest
 */

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var Request = require('src/core/HTTPRequest');

var ObservedHTTPRequest = function(name, subscriber, providerURL, pathToData, dataProcessingFunction) {
	if (providerURL !== null && typeof providerURL !== 'string') {
		console.warn(ObservedHTTPRequest.prototype.objectType, 'providerURL is neither a string nor explicitly null. Returning.');
		return false;
	}
	
	this.idxInCache = null;
	this.providerURL = providerURL.slice(-1) === '/' ? providerURL : providerURL + '/';
	this.pathToData = pathToData || '';
	
	Components.ComponentWithObservables.call(this, TypeManager.mockDef(), null, null);
	this.objectType = 'ObservedHTTPRequest';
	
	dataProcessingFunction = typeof dataProcessingFunction === 'function' ? dataProcessingFunction : value => value;
	this.streams[name] = new CoreTypes.Stream(name, null, null, dataProcessingFunction, true);
	this.requestAsAStream = this.streams[name];
	
	if (Object.prototype.toString.call(subscriber) === '[object Object]' &&  subscriber.streams && subscriber.streams.updateChannel) {
		this.requestAsAStream.subscribe(subscriber.streams.updateChannel, 'value', dataProcessingFunction);
	}
}

var proto_proto = Object.create(Components.ComponentWithObservables.prototype);
Object.assign(proto_proto, Request.prototype);
ObservedHTTPRequest.prototype = Object.create(proto_proto);
ObservedHTTPRequest.prototype.objectType = 'ObservedHTTPRequest';

ObservedHTTPRequest.prototype.subscribe = function(subscriber, prop, providerURL, pathToData, dataProcessingFunction) {
	if (!subscriber || (Object.prototype.toString.call(subscriber) !== '[object Object]' && typeof subscriber !== 'function')) {
		console.warn(this.objectType, 'subscriber is neither a function nor an object. Returning.');
		return;
	}
		
	this.providerURL = (typeof providerURL === 'string' && (providerURL.slice(-1) === '/' ? providerURL : providerURL + '/')) || this.providerURL;
	this.pathToData = typeof pathToData === 'string' ? pathToData : this.pathToData;
	
	prop = typeof subscriber === 'function' ? null : (prop || 'value');
	subscriber = typeof subscriber.streams === 'object' ? subscriber.streams.updateChannel : subscriber;
	dataProcessingFunction = typeof dataProcessingFunction === 'function' ? dataProcessingFunction : null;
	
	return this.requestAsAStream.subscribe(subscriber, prop, dataProcessingFunction);
}

ObservedHTTPRequest.prototype.sendRequest = async function(type, path, payload) {
	var self = this;
	type = type || 'GET';
	path = path || this.pathToData;
	payload = payload || null;
	var range = null;
	
	var response = await this.xhr(type, this.providerURL + path, payload, range, 'application/json', 'json')
		.catch(function(e) {
			console.warn(this.objectType + ' : ' + this.requestAsAStream.name, 'HTTP async error caught');
		})
//		.then(function(response) {
////			console.trace(response);
//			return response;
//		});
		
	if (!response || (!Array.isArray(response) && Object.prototype.toString.call(response) !== '[object Object]')) {
		// prettyArrayLogger(e);
		console.log('ObjectSetViewer didn\'t received any data: ', response, 'Or wrong data-type: ', Object.prototype.toString.call(response));
		return;
	}
//	console.log(response);
	this.requestAsAStream.value = response;
}

ObservedHTTPRequest.prototype.getResult = function() {
	return this.requestAsAStream.value;
}

ObservedHTTPRequest.prototype.refreshData = function() {
	return this.sendRequest(null, this.pathToData);
}

module.exports = ObservedHTTPRequest;