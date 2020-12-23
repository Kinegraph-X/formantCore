/**
 * @constructor FlexColumnComponent
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

var createFlexColumnComponentHostDef = require('src/coreComponents/FlexColumnComponent/coreComponentDefs/FlexColumnComponentHostDef');
//var createFlexColumnComponentSlotsDef = require('src/coreComponents/FlexColumnComponent/coreComponentDefs/FlexColumnComponentSlotsDef');

var FlexColumnComponent = function(definition, parentView, parent) {
	Components.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'FlexColumnComponent';
}
FlexColumnComponent.prototype = Object.create(Components.CompositorComponent.prototype);
FlexColumnComponent.prototype.objectType = 'FlexColumnComponent';
FlexColumnComponent.prototype.extendsCore = 'ComposedComponent';

FlexColumnComponent.defaultDef = {
	nodeName : 'box-column',
	attributes : [],
	states : [],
	props : [],
	reactOnParent : [],
	reactOnSelf : []
}

FlexColumnComponent.prototype.createDefaultDef = function() {
	return TypeManager.createComponentDef(
			createFlexColumnComponentHostDef(),
			'FlexColumnComponentDefaultDef',
			'rootOnly'
		);
}


FlexColumnComponent.prototype.getFirstChild = function() {
	return this._children[0];
}

FlexColumnComponent.prototype.getRow = function(rowIdx) {
	return this._children[rowIdx];
}

module.exports = FlexColumnComponent;