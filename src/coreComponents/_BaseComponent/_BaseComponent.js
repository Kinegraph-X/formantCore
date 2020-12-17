/**
 * @constructor _componentNameComponent
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

//var create_componentNameComponentHostDef = require('src/coreComponents/_componentNameComponent/coreComponentDefs/_componentNameComponentHostDef');
//var create_componentNameComponentSlotsDef = require('src/coreComponents/_componentNameComponent/coreComponentDefs/_componentNameComponentSlotsDef');

var _componentNameComponent = function(definition, parentView, parent) {
	Components.ComponentWithView.call(this, definition, parentView, parent);
	this.objectType = '_componentNameComponent';
}
_componentNameComponent.prototype = Object.create(Components.ComponentWithView.prototype);
_componentNameComponent.prototype.objectType = '_componentNameComponent';

_componentNameComponent.defaultDef = {
	nodeName : 'div',
	attributes : [],
	states : [],
	props : [],
	reactOnParent : [],
	reactOnSelf : []
}

//_componentNameComponent.prototype.createDefaultDef = function() {
//	return TypeManager.createComponentDef(
//			Object.assign(_componentNameComponent.defaultDef, create_componentNameComponentHostDef()),
//			'_componentNameComponentDefaultDef'
//		);
//}

module.exports = _componentNameComponent;