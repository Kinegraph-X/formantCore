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

// RowOfColumn and ColumnOfRow are identical, cause FlexGrid may host a Row or a Column
// 		=> let's use the method that is the most semantically convenient in our app 
FlexGridComponent.prototype.getRowOfColumn = function(rowIdx, colIdx) {
	return this._children[colIdx]._children[rowIdx];
}

FlexGridComponent.prototype.getColumnOfRow = function(rowIdx, colIdx) {
	return this._children[colIdx]._children[rowIdx];
}


FlexGridComponent.prototype.getFirstChild = function() {
	return this._children[0];
}

FlexGridComponent.prototype.getChild = function(Idx) {
	return this._children[Idx];
}

FlexGridComponent.prototype.getColumn = function(colIdx) {
	return this._children[colIdx];
}


module.exports = FlexGridComponent;