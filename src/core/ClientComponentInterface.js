/**
 * @constructor ClientComponentInterface
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');
var APIconsumerInterface = require('src/core/APIconsumerInterface');


var interfaces = {
	APIconsumerInterface : APIconsumerInterface
};

var ClientComponentInterface = function(concreteInterface, definition) {
	this.subscribeAtOriginOfTime = this.subscribeAtOriginOfTime || false;
	this.objectType = 'ClientComponentInterface';
	
	concreteInterface = concreteInterface || 'APIconsumerInterface';
	
	this.dataLink = new interfaces[concreteInterface](this);
	
	var def = definition.getGroupHostDef() || definition.getHostDef(),
		addStreamToDefinition = false;
		
	if (addStreamToDefinition = this.reactOnSelfInject(def)) {
		def.props.push(new TypeManager.propsModel(
			{serviceChannel : undefined}
		));
		this.streams.serviceChannel = new CoreTypes.LazyResettableColdStream('serviceChannel');
		def.reactOnSelf.push(new TypeManager.reactOnSelfModel(addStreamToDefinition));
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

ClientComponentInterface.prototype.reactOnSelfInject = function(def) {
	return this.dataLink.reactOnSelfInject(def);
}






module.exports = ClientComponentInterface;