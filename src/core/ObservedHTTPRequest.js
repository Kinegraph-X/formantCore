/**
 * @constructor ObservedHTTPRequest
 */

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var Request = require('src/core/HTTPRequest');

var ObservedHTTPRequest = function(requestName, providerURL, pathToData, dataProcessingFunction, subscriber, prop) {
	if (providerURL !== null && typeof providerURL !== 'string') {
		console.error(ObservedHTTPRequest.prototype.objectType, 'providerURL is neither a string nor explicitly null.', providerURL, 'Returning...');
		return false;
	}
	
	this.name = requestName;
	this.pending = false;
	
	this.idxInCache = null;
	this.providerURL = providerURL.slice(-1) === '/' ? providerURL : providerURL + '/';
	this.pathToData = pathToData || '';
	
	Components.ComponentWithObservables.call(this, TypeManager.mockDef(), null, null);
	this.objectType = 'ObservedHTTPRequest';

	this.createEvent('response');
	
	this.dataProcessingFunction = typeof dataProcessingFunction === 'function' ? dataProcessingFunction : value => value;
	this.requestAsAStream = this.streams[this.name] = new CoreTypes.LazyResettableColdStream(this.name, this.dataProcessingFunction);
//	console.log(this.requestAsAStream);

	if (Object.prototype.toString.call(subscriber) === '[object Object]' || typeof subscriber === 'function') {
		this.subscribe(subscriber, prop || null, this.dataProcessingFunction);
	}
}

var proto_proto = Object.create(Components.ComponentWithObservables.prototype);
Object.assign(proto_proto, Request.prototype);
ObservedHTTPRequest.prototype = Object.create(proto_proto);
ObservedHTTPRequest.prototype.objectType = 'ObservedHTTPRequest';

ObservedHTTPRequest.prototype.subscribe = function(subscriber, prop, dataProcessingFunction) {
	if (!subscriber || (Object.prototype.toString.call(subscriber) !== '[object Object]' && typeof subscriber !== 'function')) {
		console.warn(this.objectType, 'subscriber is neither a function nor an object.', subscriber, 'Returning...');
		return;
	}
	
	var component = subscriber;
	prop = typeof subscriber === 'function' ? null : (prop || 'value');
	if (typeof subscriber.streams === 'object') {
		if (typeof subscriber.streams.serviceChannel !== 'object') {
			console.warn(subscriber.objectType, 'Missing "serviceChannel" stream on automatic subscription to ObservableHTTPRequest');
			if (!Object.keys(subscriber.streams))
				console.log('No Stream found...');
			for (let stream in subscriber.streams) {
				console.log('The following stream has been found:', stream.name);
			}
		}
		else
			subscriber = subscriber.streams.serviceChannel;
	}
	else
		subscriber = subscriber;
		
	if (typeof dataProcessingFunction === 'function')
		this.dataProcessingFunction = dataProcessingFunction;
		
	var subscription = this.requestAsAStream.subscribe(subscriber, prop, dataProcessingFunction);
	if (component._UID)
		subscription.unAnonymize(component._UID, component.objectType)
	if (component._parent)
		subscription.registerTransition(component._parent._UID);
	
	return subscription;
				
}

ObservedHTTPRequest.prototype.sendRequest = async function(type, path, payload) {
	this.pending = true;
	
	var self = this;
	type = type || 'GET';
	path = path || this.pathToData;
	payload = payload || null;
	var range = null;
	
	var response = await this.xhr(type, this.providerURL + path, payload, range, 'application/json', 'json')
		.catch(function(e) {
//			console.log(self);
			console.warn(self.objectType + ' : ' + self.requestAsAStream.name, 'HTTP async error caught');
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
	this.requestAsAStream.value = {
			endPointName : this.name,
			payload : response
		};
}

ObservedHTTPRequest.prototype.getResult = function() {
	return this.requestAsAStream.value;
}

ObservedHTTPRequest.prototype.refreshData = function() {
	return this.sendRequest(null, this.pathToData);
}

module.exports = ObservedHTTPRequest;