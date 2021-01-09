/**
 * @constructor FlexRowComponent
*/

var TypeManager = require('src/core/TypeManager');
var Component = require('src/core/Component');

var createFlexRowComponentHostDef = require('src/coreComponents/FlexRowComponent/coreComponentDefs/FlexRowComponentHostDef');
//var createFlexRowComponentSlotsDef = require('src/coreComponents/FlexRowComponent/coreComponentDefs/FlexRowComponentSlotsDef');

var FlexRowComponent = function(definition, parentView, parent) {
	Component.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'FlexRowComponent';
}
FlexRowComponent.prototype = Object.create(Component.CompositorComponent.prototype);
FlexRowComponent.prototype.objectType = 'FlexRowComponent';
FlexRowComponent.prototype.extendsCore = 'ComposedComponent';

//FlexRowComponent.defaultDef = {
//	nodeName : 'box-row',
//	attributes : [],
//	states : [],
//	props : [],
//	reactOnParent : [],
//	reactOnSelf : []
//}

FlexRowComponent.prototype.createDefaultDef = function() {
	return TypeManager.createComponentDef(
			createFlexRowComponentHostDef(),
			'FlexRowComponentDefaultDef',
			'rootOnly'
		);
}

FlexRowComponent.prototype.getFirstChild = function() {
	return this._children[0];
}

FlexRowComponent.prototype.getChild = function(Idx) {
	return this._children[Idx];
}

FlexRowComponent.prototype.getColumn = function(colIdx) {
	return this._children[colIdx];
}

module.exports = FlexRowComponent;