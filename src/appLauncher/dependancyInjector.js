/**
 * @injector DependancyInjector
 */
var rDataset = require('src/core/ReactiveDataset');
var cSet = require('src/core/ComponentSet');

var Components = require('src/core/Component');
var App = require('src/core/AppIgnition');

// FIXME: we MUST get that value from the app context
// 		AND be able to define on which component type we want to inject the "magic" prototype extension
var isLayoutEngineON = true;


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

if (isLayoutEngineON) {
	var SpecialDependencyInjector = require('src/_LayoutEngine/SpecialDependencyInjector');
	// TODO: Object.assign is the ugliest and riskiest way to create a mixin.
	// 		=> if it's "injection", please inject via some "in framework" existing & tested decoration principle
	App.componentTypes.HierarchicalObject.prototype = Object.assign(App.componentTypes.HierarchicalObject.prototype, SpecialDependencyInjector.prototype);
}


module.exports = App;