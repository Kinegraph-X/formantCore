/**
 * @injector DependancyInjector
 */
var rDataset = require('src/core/ReactiveDataset');
var cSet = require('src/core/ComponentSet');

var Components = require('src/core/Component');
var App = require('src/core/AppIgnition');



/**
 * Dependancy Injection
 */

Components.CompositorComponent.createAppLevelExtendedComponent();

App.coreComponents.LazySlottedComposedComponent.prototype.rDataset = rDataset;
App.coreComponents.LazySlottedComposedComponent.prototype.cSet = cSet;

App.coreComponents.LazySlottedComposedComponent.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(DOMNodeId, this);
};
App.coreComponents.AbstractTree.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(DOMNodeId, this, this.listTemplate.getHostDef());
};
App.componentTypes.KeyValueList.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(DOMNodeId, this, this.listTemplate.getHostDef());
};
App.componentTypes.ScrollSlider.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(DOMNodeId, this);
};

module.exports = App;