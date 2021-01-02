/**
 * @constructor ISocketComponent
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');

//var createISocketComponentHostDef = require('src/coreComponents/ISocketComponent/coreComponentDefs/ISocketComponentHostDef');
//var createISocketComponentSlotsDef = require('src/coreComponents/ISocketComponent/coreComponentDefs/ISocketComponentSlotsDef');

var ISocketComponent = function(localLocation, originLocation) {
	this._localLocation = localLocation;
	this._originLocation = originLocation;
	this._sourceWindow;
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'ISocketComponent';
}
ISocketComponent.prototype = Object.create(CoreTypes.EventEmitter.prototype);
ISocketComponent.prototype.objectType = 'ISocketComponent';

ISocketComponent.prototype.handleMessage = function(e) {
	if (e.data === 'ping') {
		this._originLocation = this._originLocation || e.origin;
		this._sourceWindow = e.source;
		e.source.postMessage('pong', this._localLocation);
		return;
	}
	
	// Here we should ensure the authorized origin (an URL), and source (ref passed on first sent message) if possible
	//...
	
	// and maybe a bit of type checking... That may help...
	if (e.data && Object.prototype.toString.call(e.data) !== '[object Object]')
		return;
	else if (typeof e.data.name === 'undefined')
		return;
		
	if (e.data.method && typeof this[e.data.method] ==='function')
		this[e.data.method](e.data.args);
}

module.exports = ISocketComponent;