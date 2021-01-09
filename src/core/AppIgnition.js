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
var coreComponents = ComposedComponent.coreComponents;

var elementDecorator_Offset = require('src/UI/_mixins/elementDecorator_Offset');

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
//	console.log(TypeManager.viewsRegister);
}



/*
 * INITIALIZATION CHAPTER : instanciate DOM
 * 
 */
Ignition.prototype.instanciateDOM = function() {
	var views = TypeManager.viewsRegister,
		nodes = TypeManager.nodesRegister.cache,
		attributesCache = TypeManager.caches.attributes.cache,
		attributes,
		effectiveViewAPI,
		masterNode;

	views.forEach(function(view, key) {
		
		attributes = attributesCache[view._defUID];
		effectiveViewAPI = view.currentViewAPI;
		
		if (nodes[view._defUID].cloneMother) {
			// nodes[view._defUID].cloneMother.cloneNode(true); => deep clone : also copies the nested nodes (textual contents are nodes...)
			view.callCurrentViewAPI('setMasterNode', nodes[view._defUID].cloneMother.cloneNode(true));
			Object.assign(view.callCurrentViewAPI('getMasterNode'), elementDecorator_Offset);
		}
		else {
			nodes[view._defUID].cloneMother = ElementCreator.createElement(nodes[view._defUID].nodeName, nodes[view._defUID].isCustomElem, TypeManager.caches.states.cache[view._defUID]);
//			console.log(nodes[view._defUID].cloneMother);
			attributes.forEach(function(attrObject) {
				if (attrObject.getName().indexOf('aria') === 0)
					nodes[view._defUID].cloneMother.setAria(attrObject.getName(), attrObject.getValue());
				else
					nodes[view._defUID].cloneMother[attrObject.getName()] = attrObject.getValue();
			});
			view.callCurrentViewAPI('setMasterNode', nodes[view._defUID].cloneMother.cloneNode(true));
			Object.assign(view.callCurrentViewAPI('getMasterNode'), elementDecorator_Offset);
		}
		
		masterNode = view.callCurrentViewAPI('getMasterNode');
		attributes.forEach(function(attrObject) {
			if (attrObject.getName().indexOf('on') === 0)
				masterNode[attrObject.getName()] = attrObject.getValue();
		});
		
		if (view._parent)
			view.callCurrentViewAPI('getMasterNode')._component = view._parent;
		
		// Connect DOM objects 
		if (view.sWrapper)
			view.callCurrentViewAPI('getWrappingNode').append(view.sWrapper.styleElem.cloneNode(true));
		
		if (view.parentView && view.parentView.callCurrentViewAPI('getWrappingNode'))
			view.parentView.callCurrentViewAPI('getWrappingNode').append(view.callCurrentViewAPI('getMasterNode'));
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
//			console.log(defUID);
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
				component.registerEvents();

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
				component.registerEvents();

			this.defineStreamsBidirectionalReflection(defUID, component);
		}, this);
	}
	
	for (let defUID in typedComponentRegister) {
//		console.log(defUID, typedComponentRegister[defUID]);
		typedComponentRegister[defUID].forEach(function(component) {
//			console.log(listDef.UID);
//			if (!component.view) {
//				console.log(defUID, component._UID, listDef.UID);
//				return;
//			}
//			if (listDef.UID === '5')
//				console.log(component._UID, TypeManager.dataStoreRegister.getItem(component._UID), TypeManager.dataStoreRegister);
			if (typeof (dataStoreKey = TypeManager.dataStoreRegister.getItem(component._UID)) !== 'undefined')
				this.handleReflectionOnModel.call(component, listDef.reflectOnModel, listDef.augmentModel, listDef.each[dataStoreKey]);
		}, this);
	}
}
Ignition.prototype.defineStreamsBidirectionalReflection = function(defUID, component) {
//	console.log(component);
	// DOM objects extension : we need 2 custom props to offer a rich "reactive" experience
	// The view's "hosts" gains access here to the streams of the component.
	// It's needed if we want to allow access to the reactivity mechanisms from outside of the framework :
	// 		-> any change to an attribute or a DOM prop shall trigger a full update of the component, following the defined reactivity path (by def obj)
	// And it may be usefull in some other "barely legal" cases... (for example in "hacky" implementations that attach listeners directly to the DOM)
	component.view.getMasterNode().streams = component.streams;
	
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
	component.streams[stateObj.getName()].acquireHostedInterface(component.view.currentViewAPI.hostedInterface);
	
	// set default states
	if (!component.view.isCustomElem) {
		// define reflexive props on view
		ElementCreator.propGetterSetter.call(component.view.getMasterNode(), stateObj.getName());
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
//		document.querySelector('#' + containerIdOrContainerNode).appendChild(mainComponent.view.getMasterNode());
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
//	document.querySelector('#' + containerIdOrContainerNode).appendChild(mainComponent.view.getMasterNode());
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

	document.querySelector(containerId !== 'body' ? '#' + containerId : containerId).appendChild(component.view.getMasterNode());
//	componentListHostDef.each.length = 0;
}
DelayedDecoration.prototype = Object.create(Ignition.prototype);
DelayedDecoration.prototype.objectType = 'DelayedDecoration';








/**
 * @constructor RootView
 */
var createRootViewComponentHostDef = require('src/coreComponents/RootViewComponent/coreComponentDefs/RootViewComponentHostDef');

var RootView = function(igniterForChild, prepagePage) {
	var component;
	if (prepagePage)
		component = new componentTypes.RootViewComponent(TypeManager.createComponentDef(createRootViewComponentHostDef().moduleDef));
	else
		component = new componentTypes.RootViewComponent(TypeManager.createComponentDef(createRootViewComponentHostDef().minimalModuleDef));
		
	if (igniterForChild && typeof igniterForChild.init === 'function') {
		igniterForChild.init(component.view, component);
	}

	component.render();
	document.querySelector('body').prepend(component.view.getMasterNode());
	return component;
}
RootView.prototype = Object.create(Ignition.prototype);
RootView.prototype.objectType = 'RootView';










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
	new coreComponents.ComponentList(definition, parent.view, parent);
//	console.log(definition);
	this.decorateComponentsThroughDefinitionsCache(definition.getHostDef());
	definition.getHostDef().each = [];
}




module.exports = {
		componentTypes : componentTypes,
		coreComponents : coreComponents,
		RootView : RootView,
		Ignition : IgnitionToComposed,
		IgnitionFromDef : IgnitionFromDef,
		IgnitionToExtensible : IgnitionToExtensible,
		DelayedDecoration : DelayedDecoration,
		List : List,
		decorateComponentsThroughDefinitionsCache : IgnitionFromDef.prototype.decorateComponentsThroughDefinitionsCache
}