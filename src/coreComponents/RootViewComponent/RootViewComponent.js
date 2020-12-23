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
		// RootView is a special case: as it is instanciated under the hood by the AppIgniter, effective Component's Style isn't used
//			Object.assign(RootViewComponent.defaultDef, createRootViewComponentHostDef()),
			RootViewComponent.defaultDef,
			'RootViewComponentDefaultDef'
		);
}

RootViewComponent.prototype.getPanel = function(Idx) {
	return this._children[Idx];
}

RootViewComponent.prototype.getHeaderPanel = function() {
	return this._children[0];
}

RootViewComponent.prototype.getPagePanel = function() {
	return this._children[1];
}

RootViewComponent.prototype.getAfterPagePanel = function() {
	return this._children[2];
}

module.exports = RootViewComponent;