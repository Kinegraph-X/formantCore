/**
 * @constructor RootViewComponent
*/

var TemplateFactory = require('src/core/TemplateFactory');
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


RootViewComponent.prototype.createDefaultDef = function() {
	return TemplateFactory.createDef({
			host : TemplateFactory.createDef({
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