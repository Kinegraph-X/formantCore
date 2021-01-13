/**
 * @constructor AppBoundaryComponent
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

var createAppBoundaryComponentHostDef = require('src/coreComponents/AppBoundaryComponent/coreComponentDefs/AppBoundaryComponentHostDef');
//var createAppBoundaryComponentSlotsDef = require('src/coreComponents/AppBoundaryComponent/coreComponentDefs/AppBoundaryComponentSlotsDef');

var AppBoundaryComponent = function(definition, parentView, parent) {
	Components.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'AppBoundaryComponent';
}
AppBoundaryComponent.prototype = Object.create(Components.CompositorComponent.prototype);
AppBoundaryComponent.prototype.objectType = 'AppBoundaryComponent';
AppBoundaryComponent.prototype.extendsCore = 'ComposedComponent';

AppBoundaryComponent.defaultDef = {
	nodeName : 'div',
	attributes : [],
	states : [],
	props : [],
	reactOnParent : [],
	reactOnSelf : []
}

AppBoundaryComponent.prototype.createDefaultDef = function() {
	return TypeManager.createComponentDef(
			createAppBoundaryComponentHostDef(),
			'AppBoundaryComponentDefaultDef',
			'rootOnly'
		);
}

AppBoundaryComponent.prototype.getFirstChild = function() {
	return this._children[0];
}

AppBoundaryComponent.prototype.getChild = function(Idx) {
	return this._children[Idx];
}

AppBoundaryComponent.prototype.getRow = function(rowIdx) {
	return this._children[rowIdx];
}

module.exports = AppBoundaryComponent;