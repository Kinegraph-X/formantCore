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

App.coreComponents.LazySlottedCompoundComponent.prototype.rDataset = rDataset;
App.coreComponents.AbstractAccordion.prototype.rDataset = rDataset;
App.coreComponents.LazySlottedCompoundComponent.prototype.cSet = cSet;

App.componentTypes.RootViewComponent.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(null, this);
};
App.coreComponents.LazySlottedCompoundComponent.prototype.render = function(DOMNodeId, previousListHostDef) {
	new App.DelayedDecoration(DOMNodeId, this, previousListHostDef);
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
App.componentTypes.SlidingPanel.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(DOMNodeId, this);
};


module.exports = App;