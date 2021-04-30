/**
 * @constructor ISocketComponent
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');

//var createISocketComponentHostDef = require('src/coreComponents/ISocketComponent/coreComponentDefs/ISocketComponentHostDef');
//var createISocketComponentSlotsDef = require('src/coreComponents/ISocketComponent/coreComponentDefs/ISocketComponentSlotsDef');

var ISocketComponent = function(originLocation) {
	this._localLocation = window.location.href;
	this._originLocation = originLocation;
	this._sourceWindow;
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'ISocketComponent';
	
	window.addEventListener("message", this.handleMessage.bind(this));
}
ISocketComponent.prototype = Object.create(CoreTypes.EventEmitter.prototype);
ISocketComponent.prototype.objectType = 'ISocketComponent';

ISocketComponent.prototype.createEvents = function() {
	this.createEvent('ready');
}

ISocketComponent.prototype.handleMessage = function(e) {
//	console.log(e.data, 'ping/' + this._originLocation.match(/\?page=([a-zA-Z]+)/)[1]);
	if (e.data === 'ping/' + this._originLocation.match(/\?page=([a-zA-Z]+)/)[1]) {
		this._originLocation = this._originLocation || e.origin;
		this._sourceWindow = e.source;
		e.source.postMessage('pong', this._localLocation);
		this.trigger('ready');
		return;
	}
	
	// Here we should ensure the authorized origin (an URL), and source (ref passed on first sent message) if possible
	//...
	
	// and maybe a bit of type checking... That may help...
	if (e.data && Object.prototype.toString.call(e.data) !== '[object Object]')
		return;
		
	if (e.data.method && typeof this[e.data.method] ==='function')
		this[e.data.method](e.data.payload);
}

ISocketComponent.prototype.callRemoteProcedure = function(procedureName, payload) {
	if (!this._sourceWindow)
		return;
		
	this._sourceWindow.postMessage(
		{
			method : procedureName,
			payload : payload
		},
		this._originLocation
	);
}

//ISocketComponent.prototype.drawTree = function(payload) {
////	var payload = e.args;
//	console.log(payload);
//	var hierarchy= d3.hierarchy(payload);
//	var DOMGraph = d3graph(hierarchy);
//	document.body.appendChild(DOMGraph);
//}

module.exports = ISocketComponent;