/**
 * @bootstraper AppIgniter
 * @bootstraper ListInjector
 */

var ElementCreator = require('src/UI/generics/GenericElementConstructor');
var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Component = require('src/core/Component');
var ComposedComponent = require('src/core/ComposedComponent');
var componentTypes = ComposedComponent.componentTypes;
//var CompositeFactory = require('src/core/CompositeFactory');

console.log(TypeManager.caches);
//console.log(TypeManager.dataStoreRegister);



/**
 * @constructor Ignition : this is the abstract class
 */
var Ignition = function(definition, containerIdOrContainerNode) {}
Ignition.prototype = {};
Ignition.prototype.objectType = 'Ignition'; 

Ignition.prototype.decorateComponentsThroughDefinitionsCache = function(listDef) {
	
	// instanciate DOM objects through cloning : DOM attributes are always static
	// 					=> iterate on the "views" register
	this.instanciateDOM();
	
	// instanciate streams
	this.instanciateStreams();
	
	// handle reactivity and event subscription : each component holds a "unique ID from the def" => retrieve queries from the "reactivity" register
	this.handleReactivityAndEvents();
	
	// decorate DOM Objects with :
	// * 						- streams
	// * 						- reflexive props
	// assign reflectedObj to streams
	this.lateEventBindingAndBidirectionalReflection(listDef);

	this.cleanRegisters();
}



/*
 * INITIALIZATION CHAPTER : instanciate DOM
 * 
 */
Ignition.prototype.instanciateDOM = function() {
	var views = TypeManager.viewsRegister,
		nodes = TypeManager.nodesRegister.cache,
		attributesCache = TypeManager.caches.attributes.cache,
		attributes;

	views.forEach(function(view) {
		
		attributes = attributesCache[view._defUID];
//		console.log(view._defUID, attributes);
		if (nodes[view._defUID].cloneMother)
			// nodes[view._defUID].cloneMother.cloneNode(true); => deep clone : also copies the nested nodes (textual contents are nodes...)
			view.hostElem = nodes[view._defUID].cloneMother.cloneNode(true);
		else {
			nodes[view._defUID].cloneMother = ElementCreator.createElement(nodes[view._defUID].nodeName, nodes[view._defUID].isCustomElem, TypeManager.caches.states.cache[view._defUID]);
			attributes.forEach(function(attrObject) {
				if (attrObject.getName().indexOf('aria') === 0)
					nodes[view._defUID].cloneMother.setAria(attrObject.getName(), attrObject.getValue());
				else
					nodes[view._defUID].cloneMother[attrObject.getName()] = attrObject.getValue();
			});
			view.hostElem = nodes[view._defUID].cloneMother.cloneNode(true);
		}
		
		attributes.forEach(function(attrObject) {
			if (attrObject.getName().indexOf('on') === 0)
				view.hostElem[attrObject.getName()] = attrObject.getValue();
		});
		
		view.rootElem = view.hostElem.shadowRoot;
		if (view._parent)
			view.hostElem._component = view._parent;
		
		// Connect DOM objects 
		if (view.sWrapper)
			(view.rootElem || view.hostElem).append(view.sWrapper.styleElem.cloneNode(true));
		if (view.parentView && view.parentView.hostElem)
			(view.parentView.rootElem || view.parentView.hostElem).append(view.hostElem);
	});
}





/*
 * INITIALIZATION CHAPTER : instanciate Streams
 * 
 */
Ignition.prototype.instanciateStreams = function() {
	var typedComponentRegister = TypeManager.typedHostsRegister.cache;
	var streams = TypeManager.caches.streams.cache;
	for (let defUID in typedComponentRegister) {
		typedComponentRegister[defUID].forEach(function(component) {
			streams[defUID].forEach(function(stateObj) {
				component.streams[stateObj.getName()] = new CoreTypes.Stream(stateObj.getName(), stateObj.getValue());
			})
		});
	}
}





/*
 * INITIALIZATION CHAPTER : handle reactivity & events
 * 
 */
Ignition.prototype.handleReactivityAndEvents = function() {
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
					component[bindingHandler](reactivityQueries, component._parent, subscriptionType);
				else if (subscriptionType === 'reactOnSelf')
					component[bindingHandler](reactivityQueries, component._parent, subscriptionType);
			});
		}
		
	});
	TypeManager.eventQueries.forEach(function(subscriptionType) {
		
		for (let defUID in typedComponentRegister) {
			eventQueries = TypeManager.caches[subscriptionType].cache[defUID];
			
			typedComponentRegister[defUID].forEach(function(component) {
				if (!eventQueries.length)
					return;
				switch(subscriptionType) {
					case 'subscribeOnParent' :
						if (component._parent)
							component.handleEventSubscriptions(subscriptionType, eventQueries, component._parent);
						break;
					case 'subscribeOnChild' :
						component.handleEventSubscriptions(subscriptionType, eventQueries);
						break;
					case 'subscribeOnSelf' :
						component.handleEventSubscriptions(subscriptionType, eventQueries);
						break;
				}	
			});
		}
		
	});
}







/*
 * INITIALIZATION CHAPTER : lateEventBindingAndBidirectionalReflection
 * 
 */
Ignition.prototype.lateEventBindingAndBidirectionalReflection = function(listDef) {
	if (!listDef)
		this.streamsBidirectionalReflectionBlank();
	else
		this.streamsBidirectionalReflectionFilled(listDef);
	
}
Ignition.prototype.streamsBidirectionalReflectionBlank = function() {
	var typedComponentRegister = TypeManager.typedHostsRegister.cache;

	for (let defUID in typedComponentRegister) {

		typedComponentRegister[defUID].forEach(function(component) {
			if (!component.view)
				return;
			
			if (component instanceof Component.ComponentWithHooks)
				component.registerEvents(TypeManager.hostsDefinitionsCacheRegister.getItem(defUID));

			this.defineStreamsBidirectionalReflection(defUID, component);
		}, this);
	}
}
Ignition.prototype.streamsBidirectionalReflectionFilled = function(listDef) {
	var typedComponentRegister = TypeManager.typedHostsRegister.cache;
//	console.log(listDef.UID);
	for (let defUID in typedComponentRegister) {
		typedComponentRegister[defUID].forEach(function(component) {
			if (!component.view)
				return;
			
			if (component instanceof Component.ComponentWithHooks)
				component.registerEvents(TypeManager.hostsDefinitionsCacheRegister.getItem(defUID));

			this.defineStreamsBidirectionalReflection(defUID, component);
		}, this);
	}
	
	for (let defUID in typedComponentRegister) {
//		console.log(defUID, typedComponentRegister[defUID]);
		typedComponentRegister[defUID].forEach(function(component) {
//			console.log(listDef.UID);
			if (!component.view) {
//				console.log(listDef.UID);
				return;
			}
//			if (listDef.UID === '5')
//				console.log(component._UID, TypeManager.dataStoreRegister.getItem(component._UID), TypeManager.dataStoreRegister);
			if (typeof (dataStoreKey = TypeManager.dataStoreRegister.getItem(component._UID)) !== 'undefined')
				this.handleReflectionOnModel.call(component, listDef.reflectOnModel, listDef.augmentModel, listDef.each[dataStoreKey]);
		}, this);
	}
}
Ignition.prototype.defineStreamsBidirectionalReflection = function(defUID, component) {
	// DOM objects extension : we need 2 custom props to offer a rich "reactive" experience
	// The view's "hosts" gains access here to the streams of the component.
	// It's needed if we want to allow access to the reactivity mechanisms from outside of the framework :
	// 		-> any change to an attribute or a DOM prop shall trigger a full update of the component, following the defined reactivity path (by def obj)
	// And it may be usefull in some other "barely legal" cases... (for example in "hacky" implementations that attach listeners directly to the DOM)
	component.view.hostElem.streams = component.streams;
	
	// And we reflect the View on each State Stream : 
	// 		-> it's a nice & implicit way to declare in the def obj that the reactivity-chain targets an "exposed" state
	// And we define for each State a special prop on the view, that reflects the state of the component
	// 
	// -*- Regarding the word "implicit" : these "kind of" tricks are strongly motivated by the philosophy of the DOM custom elements :
	//			=> the global state of the component is held by an attribute on the node : styling uses then "state dependant" selectors (through CSS or anything you could use)
	//			=> this reflection mechanism is the second step needed to achieve the goal we've mentioned above,
	// 			   say that the reactivity-chain is exposed for anyone to have access to the component's magic, even from outside of the framework    
	TypeManager.caches.states.cache[defUID].forEach(function(stateObj) {
		this.reflectViewOnAStateStream(component, stateObj);
	}, this);
}
Ignition.prototype.reflectViewOnAStateStream = function(component, stateObj) {
	// assign reflectedObj to streams
	component.streams[stateObj.getName()].acquireReflectedObj(component.view.hostElem);
	
	// set default states
	if (!component.view.isCustomElem) {
		// define reflexive props on view
		ElementCreator.propGetterSetter.call(component.view.hostElem, stateObj.getName());
		component.streams[stateObj.getName()].value = stateObj.getValue();
	}
}
Ignition.prototype.handleReflectionOnModel = function(reflectOnModel, augmentModel, item) {
	// states and props may be automatically reflected on the component and so here on the host of the (Composed)Component (depending on the fact they're declared on the def), but not on the model : define that here
	//		update the model (assigning a getter & setter) in order to get the component's props reflected on the model
	// else
	// 		update the component's reactive props without reflection on the model
//	console.log(item);
	if (reflectOnModel) {
		if (augmentModel) {
			for (var s in this.streams) {
				item[this.streams[s].name] = this.streams[s].reflect(this.streams[s].name, item);
			}
		}
		else {
			for (var prop in item) {
				if (!this.streams[prop])
					continue;
				item[prop] = this.streams[prop].reflect(prop, item);
			}
		}
	}
	else {
		for (var prop in item) {
			if (!this.streams[prop])
				continue;
			this.streams[prop].value = item[prop];
		}
	}
}


Ignition.prototype.cleanRegisters = function() {
	TypeManager.viewsRegister.length = 0;
	TypeManager.typedHostsRegister.reset();	
}






/**
 * @constructor IgnitionFromDef
 */
var IgnitionFromDef = function(definition, containerIdOrContainerNode) {
	
	var type = definition.getHostDef().getType() || (definition.getGroupHostDef() && definition.getGroupHostDef().getType());
	if (type in componentTypes) {
		var mainComponent = new componentTypes[type](definition, containerIdOrContainerNode);
		this.decorateComponentsThroughDefinitionsCache();
//		document.querySelector('#' + containerIdOrContainerNode).appendChild(mainComponent.view.hostElem);
		return mainComponent;
	}
	else
		console.error('IgnitionFromDef : unknown component type found in the definition : type is ' + type);
}
IgnitionFromDef.prototype = Object.create(Ignition.prototype);
IgnitionFromDef.prototype.objectType = 'IgnitionFromDef'; 



/**
 * @constructor IgnitionToComposed
 */
var IgnitionToComposed = function(definition, containerIdOrContainerNode) {
	
	var mainComponent = new ComposedComponent(definition, containerIdOrContainerNode); 
	this.decorateComponentsThroughDefinitionsCache();
	return mainComponent;
}
IgnitionToComposed.prototype = Object.create(Ignition.prototype);
IgnitionToComposed.prototype.objectType = 'IgnitionToComposed'; 



/**
 * @constructor IgnitionToExtensible
 */
var IgnitionToExtensible = function(definition, containerIdOrContainerNode) {
	
	var mainComponent = new componentTypes.SinglePassExtensibleComposedComponent(definition, containerIdOrContainerNode); 
	this.decorateComponentsThroughDefinitionsCache();
//	document.querySelector('#' + containerIdOrContainerNode).appendChild(mainComponent.view.hostElem);
	return mainComponent;
}
IgnitionToExtensible.prototype = Object.create(Ignition.prototype);
IgnitionToExtensible.prototype.objectType = 'IgnitionToExtensible'; 


/**
 * @constructor DelayedInit
 */
var DelayedDecoration = function(containerId, component, componentListHostDef) {
	
	this.decorateComponentsThroughDefinitionsCache(componentListHostDef);
	
	if (typeof containerId !== 'string')
		return;

	document.querySelector('#' + containerId).appendChild(component.view.hostElem);
//	componentListHostDef.each.length = 0;
}
DelayedDecoration.prototype = Object.create(Ignition.prototype);
DelayedDecoration.prototype.objectType = 'DelayedDecoration';










/**
 * @constructor List
 * This ctor is the effector of the ReactiveDataset
 * 	=> tight coupling = mandatory static inclusion in core (Dataset requires App).
 */
var List = function(definition, parent) {
	this.create(definition, parent);
}
List.prototype = Object.create(Ignition.prototype);
List.prototype.objectType = 'List'; 

List.prototype.create = function(definition, parent) {
	new ComposedComponent.prototype.ComponentList(definition, parent.view, parent);
	this.decorateComponentsThroughDefinitionsCache(definition.getHostDef());
	TypeManager.listsDefinitionsCacheRegister.getItem(parent._firstListUIDSeen).each = [];
}




module.exports = {
		componentTypes : componentTypes,
		Ignition : IgnitionToComposed,
		IgnitionFromDef : IgnitionFromDef,
		IgnitionToExtensible : IgnitionToExtensible,
		DelayedDecoration : DelayedDecoration,
		List : List,
		decorateComponentsThroughDefinitionsCache : IgnitionFromDef.prototype.decorateComponentsThroughDefinitionsCache
}