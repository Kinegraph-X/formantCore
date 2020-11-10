/**
 * @bootstraper AppIgniter
 * @bootstraper ListInjector
 */

var ElementCreator = require('src/UI/generics/GenericElementConstructor');
var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var ComposedComponent = require('src/core/ComposedComponent');

console.log(TypeManager.caches);




var App = function(definition, containerIdOrContainerNode) {
	var mainComponent = new ComposedComponent(definition, containerIdOrContainerNode); 
	this.decorateComponentsThroughDefinitionsCache();
	return mainComponent;
}
App.prototype = {};

App.prototype.decorateComponentsThroughDefinitionsCache = function() {
	
	// instanciate DOM objects through cloning : DOM attributes are always static
	// 					=> iterate on the "views" register
	this.instanciateDOM();
	
	// instanciate streams
	this.instanciateStreams();
	
	// handle reactivity (TODO: and event subscription) : each component as a "unique ID from the def" => retrieve queries from the "reactivity" register
	this.handleReactivityAndEvents();
	
	// decorate DOM Objects with :
	// * 						- streams
	// * 						- reflexive props
	// assign reflectedObj to streams
	this.streamsBidirectionalReflection();
	
	TypeManager.viewsRegister.length = 0;
	TypeManager.typedHostsRegister.reset();
}



/*
 * INITIALIZATION CHAPTER : instanciate DOM
 * 
 */
App.prototype.instanciateDOM = function() {
	var views = TypeManager.viewsRegister,
	nodes = TypeManager.nodesRegister.cache,
	attributesCache = TypeManager.caches.attributes.cache,
	attributes;

	views.forEach(function(view) {
		if (nodes[view._defUID].cloneMother)
			view.hostElem = nodes[view._defUID].cloneMother.cloneNode();
		else {
			nodes[view._defUID].cloneMother = ElementCreator.createElement(nodes[view._defUID].nodeName, nodes[view._defUID].isCustomElem);
			attributes = attributesCache[view._defUID];
			attributes.forEach(function(attrObject) {
				nodes[view._defUID].cloneMother[attrObject.getName()] = attrObject.getValue();
			});
			view.hostElem = nodes[view._defUID].cloneMother.cloneNode();	
		}
		// textContent is not cloned
		view.hostElem.textContent = attributes.findObjectByKey('textContent').textContent;
		
		view.rootElem = view.hostElem.shadowRoot;
		
		// Connect DOM objects 
		if (view.parentView && view.parentView.hostElem)
			(view.parentView.rootElem || view.parentView.hostElem).appendChild(view.hostElem);
	});
}





/*
 * INITIALIZATION CHAPTER : instanciate Streams
 * 
 */
App.prototype.instanciateStreams = function() {
	var typedComponentRegister = TypeManager.typedHostsRegister.cache;
	var streams = TypeManager.caches.streams.cache;
	for (let defUID in typedComponentRegister) {
		typedComponentRegister[defUID].forEach(function(component) {
			streams[defUID].forEach(function(stateObj) {
				component.streams[stateObj.getName()] = new CoreTypes.Stream(stateObj.getName());
			})
		});
	}
}




/*
 * INITIALIZATION CHAPTER : handle reactivity & events
 * 
 */
App.prototype.handleReactivityAndEvents = function() {
	var typedComponentRegister = TypeManager.typedHostsRegister.cache;
	var reactivityQueries, bindingHandler, component;
	TypeManager.reactivityQueries.forEach(function(subscriptionType) {
		bindingHandler = subscriptionType + 'Binding';
		
		for (let defUID in typedComponentRegister) {
			reactivityQueries = TypeManager.caches[subscriptionType].cache[defUID];
			typedComponentRegister[defUID].forEach(function(component) {
				if (!reactivityQueries.length)
					return;

				if (component._parent)
					component[bindingHandler](reactivityQueries, component._parent);
				else if (subscriptionType === 'reactOnSelf')
					component[bindingHandler](reactivityQueries);
			});
		}
		
	});
}







/*
 * INITIALIZATION CHAPTER : streamsBidirectionalReflection
 * 
 */
App.prototype.streamsBidirectionalReflection = function() {
	var typedComponentRegister = TypeManager.typedHostsRegister.cache;
	for (let defUID in typedComponentRegister) {
		typedComponentRegister[defUID].forEach(function(component) {
			if (!component.view)
				return;
			this.defineStreamsBidirectionalReflection(defUID, component);
		}, this);
	}
}
App.prototype.defineStreamsBidirectionalReflection = function(defUID, component) {
	// streams
	component.view.hostElem.streams = component.streams;
	
	TypeManager.caches.states.cache[defUID].forEach(function(stateObj) {
		this.reflectStream(component, stateObj);
	}, this);
}
App.prototype.reflectStream = function(component, stateObj) {
	// assign reflectedObj to streams
	component.streams[stateObj.getName()].reflectedObj = component.view.hostElem;
	
	// define reflexive props on view
	ElementCreator.propGetterSetter.call(component.view.hostElem, stateObj.getName());
	
	// set default states
	if (!component.view.isCustomElem)
		component.streams[stateObj.getName()].value = stateObj.getValue();
}







var List = function(definition) {
	
}







module.exports = {
		Ignition : App,
		List : List
}