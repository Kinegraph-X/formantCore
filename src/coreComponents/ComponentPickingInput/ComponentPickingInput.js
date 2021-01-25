/**
 * @constructor ComponentPickingInput
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

var createComponentPickingInputHostDef = require('src/coreComponents/ComponentPickingInput/coreComponentDefs/ComponentPickingInputHostDef');
//var createComponentPickingInputSlotsDef = require('src/coreComponents/ComponentPickingInput/coreComponentDefs/ComponentPickingInputSlotsDef');

var ComponentPickingInput = function(definition, parentView, parent) {
	if (!definition.getGroupHostDef() || !definition.getGroupHostDef().props.fastHasObjectByKey('inChannel'))
		definition = createComponentPickingInputHostDef();
//	console.log(definition);
	Components.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'ComponentPickingInput';
}
ComponentPickingInput.prototype = Object.create(Components.CompositorComponent.prototype);
ComponentPickingInput.prototype.objectType = 'ComponentPickingInput';
ComponentPickingInput.prototype.extendsCore = 'CompoundComponent';

//ComponentPickingInput.defaultDef = {
//	nodeName : 'div',
//	attributes : [],
//	states : [],
//	props : [],
//	reactOnParent : [],
//	reactOnSelf : []
//}

ComponentPickingInput.prototype.createDefaultDef = function() {
	return createComponentPickingInputHostDef().getHostDef();
}

module.exports = ComponentPickingInput;