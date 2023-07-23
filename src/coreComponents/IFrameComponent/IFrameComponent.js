/**
 * @constructor IFrameComponent
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');

var createIFrameComponentHostDef = require('src/coreComponents/IFrameComponent/coreComponentDefs/IFrameComponentHostDef');
//var createIFrameComponentSlotsDef = require('src/coreComponents/IFrameComponent/coreComponentDefs/IFrameComponentSlotsDef');

/**
 * An IFrameComponent is responsible to instanciate a view
 * which holds an IFrame DOM node.
 * 
 * This IFrame DOM node has a property called "contentWindow"
 * which is a reference to the "window" object it holds.
 * When instanciating and rendering the view, this remote window object is null at first.
 * It's then populated by the browser with the real window object newly instanciated.
 * 
 * At instanciation, the IFrameComponent starts polling the existence of his own view
 * and waits until the browser has populated the contentWindow.
 * 
 * It then sends a "ping" message, via the postMessage API, to the global window where it resides.
 * (we could have simply used local events there, but this mechanism may be used cross-IFrames
 * => see below in the code)
 * 
 * In the global window, we suppose it exists an ISocketListener,
 * which is passed the instance of the IFrameComponent,
 * and is simply a wrapper abstracting the handling of the IFrameComponent's pinging,
 * and also abstracting the handling of RPC's.
 * 
 * The IFrameComponent shall instanciate a RPCStackComponent in its contentWindow
 * (remote window) on the property called window._recitalRPCStack
 * This stack is a holder to regroup the "locally scoped" functions in the remote scope.
 * And so, via its closure, this locally scoped function may call a method on a component
 * that only exists in what we see from here as the remote scope.
 * 
 * Nota: Every IFrameComponent must have a corresponding ISocketListener, 
 * as the IFrameComponent shall instanciate a
 * _RPCStackComponent with the status set to 'isInnerStack'.
 * So this component shall start an interval loop that will never end
 * unless the ISocketListener passes it a reference to its internal RPCStackComponent
 * 
 */
var IFrameComponent = function(definition, parentView, parent) {
	this._connectionEstablished = false;
	
	Components.ComponentWithView.call(this, definition, parentView, parent);
	this.objectType = 'IFrameComponent';
	
	this._globalWindow = window; 	// other way of getting to the global window : ask the IFrame where it resides => self.view.getMasterNode().ownerDocument.defaultView;
	this._globalWindowURL = window.location.href;
	
	this._innerWindow;		// In the component's ctor, we don't have yet a complete view with a node element
	this._innerWindowURL;
	
	// Very temporary system to identify ping requests : we look after something which is the name of a Spip page...
	// => it won't work for every app...
	this._pingIdentifier = definition.getHostDef().attributes.getObjectValueByKey('src').match(/\?page=([a-zA-Z]+)/)[1];
	
	// An ISocketComponent shall handle the communication between the two windows
	// Its role is to store a reference to the innerWindow, in order to be able to call remote procedures
	// So it should reside in the global window :
	// 	=> the global window calls the inner window through RPC
	// 	=> and the inner windows "triggers" callbacks on the global window which shall be listening on an "update"" event
	
	// Who should we ping ? From where is the ISocketListerner listening ?
	// From inside the global window ? From inside the IFrame's window ?
	// As seen upfront, preferably from the global window.
	// But let's imagine here another scenario, and also prepare the code for this hypothesis.
	// => we'll poll both, stop on the first response and log the name of the first responding window
	
	this.listenforISocketResponse();
	
	var self = this, node;
	var connect = setInterval(function() {
		node = self.view.getMasterNode();
		
		// Do we have a view with a node ? AND the node has loaded some content and instanciated an window object ?
		// FIXME : we should not call self.pollWindows() before having reveived the DomContentReady event from the remote window.document
		if (node && node.contentWindow && node.contentWindow.document.location.href && node.contentWindow.document.location.href !== 'about:blank') {
			self._innerWindow = node.contentWindow;
			self._innerWindowURL = node.contentWindow.document.location.href;
//			console.log('IFrameComponent', self._innerWindowURL);
		}
		else
			return;
		
//		if (!self._connectionEstablished) {
			self._innerWindow.document.addEventListener('DOMContentLoaded', function() {
				// RPC first
				self._innerWindow._recitalRPCStack = new Components.RPCStackComponent('isInnerStack');
				
				console.log('ping/' + self._pingIdentifier + ' sent');
				self.pollWindows();
			});	
//		}
//		else {
			clearInterval(connect);
//		}
	}, 512);
	

}
var proto_proto = Object.create(Components.ComponentWithHooks.prototype);
Object.assign(proto_proto, CoreTypes.Worker.prototype)
IFrameComponent.prototype = Object.create(proto_proto);
IFrameComponent.prototype.objectType = 'IFrameComponent';
IFrameComponent.prototype.constructor = IFrameComponent;

IFrameComponent.prototype.createDefaultDef = function() {
	return createIFrameComponentHostDef();
}

IFrameComponent.prototype.createEvents = function() {
	this.createEvent('ready');
}

IFrameComponent.prototype.listenforISocketResponse = function() {
	// we're listening in the global window, waiting for a response
	// which should come from the global window
	// but may either come from the inner window
	var self = this;
	window.addEventListener("message", function(e) {
		if (e.data === 'pong') {
			// There seem to be a latency, IFrameComponent pinging to fast, so the ISocketListener responds multiple times
			// => test if we already received a pong
			if (self._connectionEstablished === false) {
				self._connectionEstablished = true;
				console.log('Connection between windows established');
				self.trigger('ready');
			}
		}
	});
}

IFrameComponent.prototype.pollWindows = function() {
	console.log('pollWindows', this._pingIdentifier, this._innerWindowURL);
	this._globalWindow.postMessage('ping/' + this._pingIdentifier, this._globalWindowURL);	// the second parameter is received oas the "origin" property on the event object
																					// a usefull "source" property shall also be passed, because of the "postMessage" specification
	this._innerWindow.postMessage('ping/' + this._pingIdentifier, this._innerWindowURL);
}


module.exports = IFrameComponent;