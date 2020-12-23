/**
 * @constructor FlexGridComponent
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

//var createFlexGridComponentHostDef = require('src/coreComponents/FlexGridComponent/coreComponentDefs/FlexGridComponentHostDef');
//var createFlexGridComponentSlotsDef = require('src/coreComponents/FlexGridComponent/coreComponentDefs/FlexGridComponentSlotsDef');

var FlexGridComponent = function(definition, parentView, parent) {
	Components.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'FlexGridComponent';
}
FlexGridComponent.prototype = Object.create(Components.CompositorComponent.prototype);
FlexGridComponent.prototype.objectType = 'FlexGridComponent';
FlexGridComponent.prototype.extendsCore = 'ComposedComponent';

FlexGridComponent.defaultDef = {
	nodeName : 'box-grid',
	attributes : [],
	states : [],
	props : [],
	reactOnParent : [],
	reactOnSelf : []
}

FlexGridComponent.prototype.createDefaultDef = function() {
	return TypeManager.createComponentDef(
			FlexGridComponent.defaultDef,
			'FlexGridComponentDefaultDef',
			'rootOnly'
		);
}

FlexGridComponent.prototype.getRowOfColummn = function(rowIdx, colIdx) {
	return this._children[colIdx]._children[rowIdx];
}

module.exports = FlexGridComponent;