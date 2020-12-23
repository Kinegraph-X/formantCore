/**
 * @constructor AppOverlayComponent
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

var createAppOverlayComponentHostDef = require('src/coreComponents/AppOverlayComponent/coreComponentDefs/AppOverlayComponentHostDef');
//var createAppOverlayComponentSlotsDef = require('src/coreComponents/AppOverlayComponent/coreComponentDefs/AppOverlayComponentSlotsDef');

var AppOverlayComponent = function(definition, parentView, parent) {
	Components.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'AppOverlayComponent';
}
AppOverlayComponent.prototype = Object.create(Components.CompositorComponent.prototype);
AppOverlayComponent.prototype.objectType = 'AppOverlayComponent';
AppOverlayComponent.prototype.extendsCore = 'ComposedComponent';

AppOverlayComponent.defaultDef = {
	nodeName : 'app-overlay',
	attributes : [],
	states : [],
	props : [],
	reactOnParent : [],
	reactOnSelf : []
}

AppOverlayComponent.prototype.createDefaultDef = function() {
	return createAppOverlayComponentHostDef();
}

module.exports = AppOverlayComponent;