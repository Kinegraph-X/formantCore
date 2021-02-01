/**
 * @constructor ClientComponentInterface
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');

var interfaces = {
	APIconsumerInterface : require('src/core/APIconsumerInterface'),
//	AbstractScaleTypeConsumerInterface : require('src/core/AbstractScaleTypeConsumerInterface'),
	APIscaleTypeConsumerInterface : require('src/core/APIscaleTypeConsumerInterface'),
	SingleEndPointScaleTypeConsumerInterface : require('src/core/_SingleEndPointScaleTypeConsumerInterface')
};

var ClientComponentInterface = function(concreteInterface, definition) {
	this.subscribeAtOriginOfTime = this.subscribeAtOriginOfTime || false;
	this.objectType = 'ClientComponentInterface';
	
//	console.log(concreteInterface);
	concreteInterface = concreteInterface || 'APIconsumerInterface';
	
	this.dataLink = new interfaces[concreteInterface](this);
	
	var def = definition.getGroupHostDef() || definition.getHostDef(),
		addStreamsToDefinition = false;
		
	if (addStreamsToDefinition = this.shouldInjectReactOnSelf(def)) {
//		console.log(addStreamToDefinition, concreteInterface);
		// CAUTION: not tested what happens when rendered: stream overridden ?
//		def.props.push(new TypeManager.propsModel(
//			{serviceChannel : undefined}
//		));
		this.streams.serviceChannel = new CoreTypes.Stream('serviceChannel');
		addStreamsToDefinition.forEach(function(reactOnSelfDef) {
			def.reactOnSelf.push(new TypeManager.reactOnSelfModel(reactOnSelfDef));
		}, this);
		
//		this.updateCaches(def);
	}
//	console.log(def);
}
ClientComponentInterface.prototype = Object.create(Object.prototype);
ClientComponentInterface.prototype.objectType = 'ClientComponentInterface';

ClientComponentInterface.prototype.subscribeToProvider = function(provider, entryPoint) {
	var subscription = this.dataLink.subscribeToProvider(provider, entryPoint);
	if (this.subscribeAtOriginOfTime)
		subscription.setPointerToStart();
}

ClientComponentInterface.prototype.subscribeToProviderAtOrigin = function(provider, entryPoint) {
	var subscription = this.dataLink.subscribeToProvider(provider, entryPoint);
	subscription.setPointerToStart();
}

ClientComponentInterface.prototype.subscribeToAllProviders = function(provider) {
	var subscriptions = this.dataLink.subscribeToAllProviders(provider);
}

ClientComponentInterface.prototype.shouldInjectReactOnSelf = function(def) {
	return this.dataLink.shouldInjectReactOnSelf(def);
}

ClientComponentInterface.prototype.updateCaches = function(def) {
//	console.log(def.reactOnSelf[def.reactOnSelf.length - 1]);
	if (!TypeManager.caches['reactOnSelf'].getItem(def.UID))
		TypeManager.caches['reactOnSelf'].setItem(def.UID, []);
	
	TypeManager.caches['reactOnSelf'].cache[def.UID].push(def.reactOnSelf[def.reactOnSelf.length - 1]);
}






module.exports = ClientComponentInterface;