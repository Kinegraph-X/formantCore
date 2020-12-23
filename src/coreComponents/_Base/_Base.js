/**
 * @constructor _componentName
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

//var create_componentNameHostDef = require('src/coreComponents/_componentName/coreComponentDefs/_componentNameHostDef');
//var create_componentNameSlotsDef = require('src/coreComponents/_componentName/coreComponentDefs/_componentNameSlotsDef');

var _componentName = function(definition, parentView, parent) {
	Components.ComponentWithView.call(this, definition, parentView, parent);
	this.objectType = '_componentName';
}
_componentName.prototype = Object.create(Components.ComponentWithView.prototype);
_componentName.prototype.objectType = '_componentName';

_componentName.defaultDef = {
	nodeName : 'div',
	attributes : [],
	states : [],
	props : [],
	reactOnParent : [],
	reactOnSelf : []
}

//_componentName.prototype.createDefaultDef = function() {
//	return TypeManager.createComponentDef(
//			Object.assign(_componentName.defaultDef, create_componentNameHostDef()),
//			'_componentNameDefaultDef'
//		);
//}

module.exports = _componentName;