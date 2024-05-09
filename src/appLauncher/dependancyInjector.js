/**
 * @injector DependancyInjector
 */

const App = require('src/core/App');
const ReactiveDataset = require('src/core/ReactiveDataset');
const ComponentSet = require('src/core/ComponentSet');



/**
 * Dependancy Injection
 */
App.coreComponents.IteratingComponent.prototype.rDataset = ReactiveDataset;
App.coreComponents.LazySlottedCompoundComponent.prototype.rDataset = ReactiveDataset;
App.coreComponents.AbstractAccordion.prototype.rDataset = ReactiveDataset;
App.coreComponents.LazySlottedCompoundComponent.prototype.cSet = ComponentSet;


App.componentTypes.RootViewComponent.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(null, this);
};
App.coreComponents.LazySlottedCompoundComponent.prototype.render = function(DOMNodeId, previousListHostDef) {
	new App.DelayedDecoration(DOMNodeId, this, previousListHostDef);
};
App.coreComponents.AbstractTree.prototype.render = function(DOMNodeId) {
	new App.DelayedDecoration(DOMNodeId, this, this.listTemplate.getHostDef());
};

// Is meant as a reminder that the naiveDOM type is naive and should be cleaned in a further update
const isLayoutEngineON = true;
if (isLayoutEngineON) {
	var SpecialDependencyInjector = require('src/_LayoutEngine/SpecialDependencyInjector');
	// TODO: Object.assign is the ugliest and riskiest way to create a mixin.
	// 		=> if it's "injection", please inject via some "in framework" existing & tested decoration principle
	App.componentTypes.HierarchicalObject.prototype = Object.assign(App.componentTypes.HierarchicalObject.prototype, SpecialDependencyInjector.prototype);
}


module.exports = App;