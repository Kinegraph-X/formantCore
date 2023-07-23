/**
 * @constructor ISocketComponent
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');

//var createISocketComponentHostDef = require('src/coreComponents/ISocketComponent/coreComponentDefs/ISocketComponentHostDef');
//var createISocketComponentSlotsDef = require('src/coreComponents/ISocketComponent/coreComponentDefs/ISocketComponentSlotsDef');

/**
 * Extract from the documentation of the IFrameComponent :
 * 
 * "In the global window, we suppose it exists an ISocketListener,
 * which is passed the instance of the IFrameComponent,
 * and is simply a wrapper abstracting the handling of the IFrameComponent's pinging,
 * and also abstracting the handling of RPC's."
 */
var ISocketComponent = function(boundIFrameComponent) {
	if (!(boundIFrameComponent instanceof Components.IFrameComponent))
		console.warn('ISocketComponent', 'boundIFrameComponent isn\'t an instanceof Components.IFrameComponent');
	
	this._boundIFrameComponent = boundIFrameComponent;
	
	this._remoteLocation;
	this._remoteWindow;
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'ISocketComponent';
	
	this.rpcStack = new Components.RPCStackComponent();
	
	window.addEventListener("message", this.handleMessage.bind(this));
}
ISocketComponent.prototype = Object.create(CoreTypes.EventEmitter.prototype);
ISocketComponent.prototype.objectType = 'ISocketComponent';

ISocketComponent.prototype.createEvents = function() {
	this.createEvent('ready');
}

ISocketComponent.prototype.handleMessage = function(e) {
//	console.log(e.data, 'ping/' + this._originLocation.match(/\?page=([a-zA-Z]+)/)[1]);
	
	if (!this._boundIFrameComponent._innerWindowURL)
		console.log(this._boundIFrameComponent.view.getMasterNode().contentWindow.document.location.href, this._boundIFrameComponent);
	
	if (e.data === 'ping/' + this._boundIFrameComponent._pingIdentifier) {
		this._remoteWindow = this._boundIFrameComponent._innerWindow;
		this._remoteLocation = this._boundIFrameComponent._innerWindowURL;
		e.source.postMessage('pong', this._remoteLocation);
		
		// If we find an instance of a RPCStackComponent in the remote scope,
		// we should pass it a ref to the _boundIFrameComponent.
		// This shall avoid the remote scope ascending the DOM tree
		// to find a ref to its -wrapping- IFrameComponent
		if (this._remoteWindow._recitalRPCStack) {
			this._remoteWindow._recitalRPCStack.acquireReverseScope(this.rpcStack);
		}
		
		this.trigger('ready');
		return;
	}
	
	// This method may be further designed to handle reverse RPC (from remote scope to global scope)
	
	// Here we should maybe do a bit of type checking... That may help...
	if (e.data && Object.prototype.toString.call(e.data) !== '[object Object]')
		return;
	
	// And be able to recognize a method name 
	// (through a RPCStackComponent ?
	//  passing it to the ctor as a ref ? avoiding so to declare it in the global namespace ?)
	// => see ISocketComponent.prototype.callLocalProcedure
	if (e.data.method && typeof this[e.data.method] ==='function')
		this[e.data.method](e.data.payload);
}

ISocketComponent.prototype.registerProcedure = function(procedureName, closure, scope) {
	return this.rpcStack.registerProcedure(procedureName, closure, scope);
}

ISocketComponent.prototype.callRemoteProcedure = function(procedureName, ...args) {
	if (!this._remoteWindow) {
		console.warn(this.objectType, 'A call to a remote procedure has been aborted due to the remote scope not yet being instanciated.');
		return;
	}
		
	this._remoteWindow._recitalRPCStack.callProcedure(procedureName, ...args);
}

ISocketComponent.prototype.callLocalProcedure = function(procedureName, ...args) {
	
}


module.exports = ISocketComponent;