/**
 * @constructor IFrameComponent
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');

var createIFrameComponentHostDef = require('src/coreComponents/IFrameComponent/coreComponentDefs/IFrameComponentHostDef');
//var createIFrameComponentSlotsDef = require('src/coreComponents/IFrameComponent/coreComponentDefs/IFrameComponentSlotsDef');

var IFrameComponent = function(definition, parentView, parent) {
	var self = this;
	this._connectionEstablished = false;
	this.targetOrigin = window.location.href;
	
//	this._src = definition.getHostDef().src;
//	delete definition.getHostDef().src;
//	console.log(definition);

//	if (!definition.getHostDef().attributes.findObjectByKey('src'))
//		definition.getHostDef().attributes.push(new TypeManager.attributesModel({src : this._src}));
	
	Components.ComponentWithView.call(this, definition, parentView, parent);
	this.objectType = 'IFrameComponent';
	
	
	
	
	// DEBUG...
	if (!definition.getHostDef().attributes.getObjectValueByKey('src'))
		return;
	
	var pingIdentifier = definition.getHostDef().attributes.getObjectValueByKey('src').match(/\?page=([a-zA-Z]+)/)[1];
//	console.log(definition.getHostDef().attributes.getObjectValueByKey('src').match(/\?page=([a-zA-Z]+)/)[1]);
	
	
	
	
	// TODO: condition this to the presence of the node...
	// something like that...
	if (!definition.getHostDef().attributes.getObjectValueByKey('src'))
		return;
		
	
	var connect = setInterval(function() {
		// ...and that...
		if (!self.view.getMasterNode() || !self.view.getMasterNode().contentWindow || self.view.getMasterNode().contentWindow.location.href === 'about:blank')
			return;
		
//		console.log(self.view.getMasterNode().contentWindow.location.href.match(/([^\/]+)$/)[1], definition.getHostDef().attributes.getObjectValueByKey('src'));
		var linkedWindow = self.view.getMasterNode().contentWindow.location.href.match(/([^\/]+)$/)[1] === definition.getHostDef().attributes.getObjectValueByKey('src')
							? self.view.getMasterNode().ownerDocument.defaultView
							: self.view.getMasterNode().contentWindow;
		
//		console.log(linkedWindow, self.view.getMasterNode().ownerDocument.defaultView);
							
		if (!self._connectionEstablished) {
			if (self.view.getMasterNode() && self.view.getMasterNode().contentWindow) {
//				console.log(self.view.getMasterNode().contentWindow);
				console.log('ping/' + pingIdentifier + ' sent');
				linkedWindow.postMessage(
					'ping/' + pingIdentifier,
					self.targetOrigin);
			}
		}
		else {
			clearInterval(connect);
		}
	}, 512);
	
	window.addEventListener("message", function(e) {
		if (e.data === 'pong') {
			self._connectionEstablished = true;
			console.log('Connection between windows established');
			self.trigger('ready');
		}
		else {
			self.handleMessage(e);
		}
	});
}
var proto_proto = Object.create(Components.ComponentWithHooks.prototype);
Object.assign(proto_proto, CoreTypes.Worker.prototype)
IFrameComponent.prototype = Object.create(proto_proto);
IFrameComponent.prototype.objectType = 'IFrameComponent';
IFrameComponent.prototype.constructor = IFrameComponent;

//IFrameComponent.defaultDef = {
//	nodeName : 'iframe',
//	attributes : [],
//	states : [],
//	props : [],
//	reactOnParent : [],
//	reactOnSelf : []
//}

IFrameComponent.prototype.createDefaultDef = function() {
	return createIFrameComponentHostDef();
}

IFrameComponent.prototype.createEvents = function() {
	this.createEvent('ready');
}

IFrameComponent.prototype.handleMessage = function(e) {
	// Here we should ensure the authorized origin (an URL), and source (ref passed on first sent message) if possible
	//...
	
	// and maybe a bit of type checking... That may help...
	if (e.data && Object.prototype.toString.call(e.data) !== '[object Object]')
		return;
		
	if (e.data.method && typeof this[e.data.method] ==='function')
		this[e.data.method](e.data.payload);
}


IFrameComponent.prototype.callRemoteProcedure = function(procedureName, payload) {
	this.view.getMasterNode().contentWindow.postMessage(
		{
			method : procedureName,
			payload : payload
		},
		this.targetOrigin
	);
}

/**
 * Validate the existence (boolean) of a function on the prototype of the IFrame Component, 
 * 	this "dedicated" method, needed for a given App, should have been eventually added
 * 	in a "router" function:
 * 	=> when initializing RPC between two IFrames (note that RPC is ALWAYS handled
 * 		internally by the client & server "router" code inside each IFrame, and that
 * 		the IFrame obviously hosts a "complete" App in order for such an architecture
 * 		to work), we decorate the "_component" wrapping that IFrame with a number of methods
 * 		which we define as "proxies", and which shall be responsible for calling any needed
 * 		interface on an appr/opriate component in the component tree.
 * 		-> see also: Ignition.prototype.getWrappingComponentOutsideAppScope()
 */
IFrameComponent.prototype.isLocallyImplementedProcedure = function(procedureName) {
	return (procedureName && typeof this[procedureName] ==='function');
}

IFrameComponent.prototype.callAcquiredProcedure = function(procedureName, payload) {
	return (this.isLocallyImplementedProcedure(procedureName) && this[procedureName](payload));
}

module.exports = IFrameComponent;