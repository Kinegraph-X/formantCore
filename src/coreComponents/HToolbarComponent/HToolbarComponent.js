/**
 * @constructor HToolbarComponent
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

var createHToolbarComponentHostDef = require('src/coreComponents/HToolbarComponent/coreComponentDefs/HToolbarComponentHostDef');
//var createHToolbarComponentSlotsDef = require('src/coreComponents/HToolbarComponent/coreComponentDefs/HToolbarComponentSlotsDef');

var HToolbarComponent = function(definition, parentView, parent) {
	Components.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'HToolbarComponent';
}
HToolbarComponent.prototype = Object.create(Components.CompositorComponent.prototype);
HToolbarComponent.prototype.objectType = 'HToolbarComponent';
HToolbarComponent.prototype.extendsCore = 'ComposedComponent';

//HToolbarComponent.defaultDef = {
//	nodeName : 'h-toolbar',
//	attributes : [],
//	states : [],
//	props : [],
//	reactOnParent : [],
//	reactOnSelf : []
//}

HToolbarComponent.prototype.createDefaultDef = function() {
	return TypeManager.createComponentDef(
			createHToolbarComponentHostDef(),
			'HToolbarComponentDefaultDef',
			'rootOnly'
		);
}

module.exports = HToolbarComponent;