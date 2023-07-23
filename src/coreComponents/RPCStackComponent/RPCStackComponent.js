/**
 * @constructor RPCStackComponent
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');

/**
 * Extract from the documentation of the IFrameComponent :
 * 
 * "The contentWindow (remote window) is supposed to reference an instance of a RPCStackComponent
 * on the property called window._recitalRPCStack
 * This stack is a holder to regroup the "locally scoped" functions in the remote scope.
 * And so, via its closure, this locally scoped function may call a method on a component
 * that only exists in the remote scope."
 */
var RPCStackComponent = function(isInnerStack) {
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'RPCStackComponent';
	this._reverseScope;
	
	this.shallResolve;
	var self = this;
	this._asynchronousState = new Promise(function(resolve, reject) {
		self.shallResolve = resolve;
//		if (isInnerStack === 'isInnerStack') {
//			var interval = setInterval(function() {
//				if (self._reverseScope) {
//					resolve();
//					clearInterval(interval);
//				}
//			}, 512);
//		}
	});
	this.registeredCallbacks = {};
}
RPCStackComponent.prototype = Object.create(CoreTypes.EventEmitter.prototype);
RPCStackComponent.prototype.objectType = 'RPCStackComponent';

RPCStackComponent.prototype.acquireReverseScope = function(rpcStack) {
	this._reverseScope = rpcStack;
	this.shallResolve();
}

RPCStackComponent.prototype.registerProcedure = function(procedureName, closure, scope) {
	this.registeredCallbacks[procedureName] = {
		scope : scope || null,
		closure : closure
	};
}

RPCStackComponent.prototype.unRegisterProcedure = function(procedureName) {
	delete this.registeredCallbacks[procedureName];
}

RPCStackComponent.prototype.callProcedure = function(procedureName, ...args) {
	return this.registeredCallbacks[procedureName].closure.apply(
		this.registeredCallbacks[procedureName].scope,
		args
	);
}

/**
 * This is an alternative to acquiring the -wrapping- IFrameComponent
 * by traversing the DOM : it's much cleaner to access the external scope
 * through the reference we've acquired in acquireReverseScope().
 * this._reverseScope refers to an instance of a RPCStackComponent
 * hosted by the ISocketListener which resides in the external scope,
 * and which already handled the pinging between this inner scope and the outer scope.
 */
RPCStackComponent.prototype.callExternalProcedure = function(procedureName, ...args) {
	var self = this;
	return this._asynchronousState.then(function() {
		return self._reverseScope.callProcedure(procedureName, ...args);
	});
}

module.exports = RPCStackComponent;