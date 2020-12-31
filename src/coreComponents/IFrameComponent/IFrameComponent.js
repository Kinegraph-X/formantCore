/**
 * @constructor IFrameComponent
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');

var createIFrameComponentHostDef = require('src/coreComponents/IFrameComponent/coreComponentDefs/IFrameComponentHostDef');
//var createIFrameComponentSlotsDef = require('src/coreComponents/IFrameComponent/coreComponentDefs/IFrameComponentSlotsDef');

var IFrameComponent = function(definition, parentView, parent) {
	this._src = definition.getHostDef().src;
	delete definition.getHostDef().src;
	console.log(definition);
	if (!definition.getHostDef().attributes.findObjectByKey('src'))
		definition.getHostDef().attributes.push(new TypeManager.attributesModel({src : this._src}));
	Components.ComponentWithView.call(this, definition, parentView, parent);
}
var proto_proto = Object.create(Components.ComponentWithView.prototype);
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

module.exports = IFrameComponent;