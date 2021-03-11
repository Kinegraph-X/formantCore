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
	
	// TODO: condition this to the presence of the node...
	var connect = setInterval(function() {
		if (!self._connectionEstablished) {
			if (self.view.getMasterNode() && self.view.getMasterNode().contentWindow) {
//				console.log(self.view.getMasterNode().contentWindow);
				console.log('ping sent');
				self.view.getMasterNode().contentWindow.postMessage('ping', self.targetOrigin);
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
	return TypeManager.createComponentDef(
			createIFrameComponentHostDef(),
			'IFrameComponentDefaultDef'
		);
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

module.exports = IFrameComponent;