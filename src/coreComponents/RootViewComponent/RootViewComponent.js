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
RootViewComponent.prototype.extendsCore = 'CompoundComponent';
RootViewComponent.prototype.render = function() {} 							// pure virtual (injected as a dependancy by AppIgnition)



RootViewComponent.prototype.createDefaultDef = function() {
	return TypeManager.createDef({
			host : TypeManager.createDef({
				nodeName : 'app-root'
			})
		});
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