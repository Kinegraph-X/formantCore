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
	
	concreteInterface = concreteInterface || 'APIconsumerInterface';
	
	this.dataLink = new interfaces[concreteInterface](this);
	
	var def = definition.getGroupHostDef() || definition.getHostDef(),
		addStreamsToDefinition = false;
		
	if ((addStreamsToDefinition = this.shouldInjectReactOnSelf(def))) {
		// CAUTION: not tested what happens when rendered: stream overridden ?
		
		//  Keep following commented lines : Can't add the definition of the stream to the def,
		// as it's needed in the subscription phase to the APIendpointManager
		// (and the DOM rendering may not have happened yet)
//		def.props.push(new TypeManager.propsModel(
//			{serviceChannel : undefined}
//		));
		
		// We have to explicitly define the stream on the component
		this.streams.serviceChannel = new CoreTypes.Stream('serviceChannel');
		addStreamsToDefinition.forEach(function(reactOnSelfDef) {
			def.reactOnSelf.push(new TypeManager.reactOnSelfModel(reactOnSelfDef));
		}, this);
		
//		this.updateCaches(def);
	}
}
ClientComponentInterface.prototype = Object.create(Object.prototype);
ClientComponentInterface.prototype.objectType = 'ClientComponentInterface';

/**
 * We assume for now that, although a ClientComponent may host an infinite number of typedSlots, 
 * the typeSlot dedicated to handliing the response to the request through the "serviceChannel" 
 * is the first one created (supposingly in the constructor of the ClientComponent).
 * (see LazySlottedCompoundComponent, or TypedListComponent, which inherits from it)
 */
ClientComponentInterface.prototype.declareSotsAssociation = function(entryPoint, typedSlotIdx) {
	this.slotsAssociation[entryPoint] = typedSlotIdx || 0;
}

ClientComponentInterface.prototype.subscribeToProvider = function(provider, entryPoint) {
	var subscription = this.dataLink.subscribeToProvider(provider, entryPoint);
	if (this.subscribeAtOriginOfTime)
		subscription.setPointerToStart();
	
	if (!this.slotsAssociation[entryPoint])
		this.declareSotsAssociation(entryPoint);
	
	return subscription;
}

ClientComponentInterface.prototype.subscribeToProviderAtOrigin = function(provider, entryPoint) {
	var subscription = this.dataLink.subscribeToProvider(provider, entryPoint);
	subscription.setPointerToStart();
	return subscription;
}

ClientComponentInterface.prototype.subscribeToAllProviders = function(provider) {
	var subscriptions = this.dataLink.subscribeToAllProviders(provider);
	return subscriptions;
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