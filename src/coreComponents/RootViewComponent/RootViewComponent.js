/**
 * @constructor RootViewComponent
*/

var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');

//var createRootViewComponentHostDef = require('src/core/coreComponents/RootViewComponent/coreComponentDefs/RootViewComponentHostDef');
//var createRootViewComponentSlotsDef = require('src/core/coreComponents/RootViewComponent/coreComponentDefs/RootViewComponentSlotsDef');

var RootViewComponent = function(definition, parentView, parent) {
	Components.CompositorComponent.call(this, definition, parentView, parent);
	this.objectType = 'RootViewComponent';
	this.render();
}
RootViewComponent.prototype = Object.create(Components.CompositorComponent.prototype);
RootViewComponent.prototype.objectType = 'RootViewComponent';
RootViewComponent.prototype.extendsCore = 'ComposedComponent';
RootViewComponent.prototype.render = function() {} 							// pure virtual (injected as a dependancy by AppIgnition)

RootViewComponent.defaultDef = {
	nodeName : 'app-root',
	attributes : [],
	states : [],
	props : [],
	reactOnParent : [],
	reactOnSelf : []
}

RootViewComponent.prototype.createDefaultDef = function() {
	return TypeManager.createComponentDef(
//			Object.assign(RootViewComponent.defaultDef, createRootViewComponentHostDef()),
			RootViewComponent.defaultDef,
			'RootViewComponentDefaultDef'
		);
}

module.exports = RootViewComponent;