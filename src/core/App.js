/**
 * @bootstraper AppIgniter
 * @bootstraper ListInjector
 */

const appConstants = require('src/appLauncher/appLauncher');
const ElementCreator = require('src/core/GenericElementConstructor');
const TypeManager = require('src/core/TypeManager');
const TemplateFactory = require('src/core/TemplateFactory');
const Registries = require('src/core/Registries');
const CoreTypes = require('src/core/CoreTypes');
const Component = require('src/core/Component');
const CompoundComponent = require('src/core/CompoundComponent');
const componentTypes = CompoundComponent.componentTypes;
const coreComponents = CompoundComponent.coreComponents;

const elementDecorator_OffsetProp = require('src/core/elementDecorator_Offset');




/**
 * @constructor Ignition : this is the abstract class
 */
const Ignition = function(definition, containerIdOrContainerNode) {}
Ignition.prototype = {};
Ignition.prototype.objectType = 'Ignition'; 

Ignition.prototype.decorateComponentsThroughDefinitionsCache = function(listDef) {
	
	// instanciate DOM objects through cloning : DOM attributes are always static
	// 					=> iterate on the "views" register
	if (typeof document !== 'undefined' && typeof document.ownerDocument !== 'undefined')
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
	var rootNodeIfDOM,
		views = Registries.viewsRegistry,
		nodes = Registries.nodesRegistry.cache,
		attributesCache = Registries.caches.attributes.cache,
		attributes,
		alreadyCloned = false,
		cloneMother,
		effectiveViewAPI,
		masterNode;

	views.forEach(function(view, key) {
		attributes = attributesCache[view._defUID];
		effectiveViewAPI = view.currentViewAPI;
		
		if (nodes[view._defUID].cloneMother) {
			view.callCurrentViewAPI('setMasterNode', nodes[view._defUID].cloneMother.cloneNode(true));
			Object.assign(view.callCurrentViewAPI('getMasterNode'), elementDecorator_OffsetProp);
		}
		else {
			nodes[view._defUID].cloneMother = ElementCreator.createElement(nodes[view._defUID].nodeName, nodes[view._defUID].isCustomElem, Registries.caches.states.cache[view._defUID]);

			alreadyCloned = false;
			cloneMother = nodes[view._defUID].cloneMother;
			attributes.forEach(function(attrObject) {
				if (attrObject.getName().indexOf('aria') === 0)
					cloneMother.setAria(attrObject.getName(), attrObject.getValue());
				else {
					if (attrObject.getName() === 'textContent' && view.currentViewAPI.isShadowHost)
						console.warn('DOM rendering shall fail: textContent on a DOM custom-element shall be appended outside of the shadowRoot. nodeName is ' + view.currentViewAPI.nodeName + ' & _defUID is ' + view._defUID + '. Consider using a reactive prop instead. For example, the SimpleText Component can handle that case.')
					cloneMother[attrObject.getName()] = attrObject.getValue();
				}
			});
			view.callCurrentViewAPI('setMasterNode', cloneMother.cloneNode(true));
			Object.assign(view.callCurrentViewAPI('getMasterNode'), elementDecorator_OffsetProp);
		}
		
		
		if (view._parent)
			view.callCurrentViewAPI('getMasterNode')._component = view._parent;
		
		// Connect DOM objects 
		if (view._sWrapperUID) {
			if (Object.prototype.toString.call(appConstants.getUID(view._sWrapperUID)) === '[object Object]') {
				view.styleHook.s = appConstants.getUID(view._sWrapperUID).clone();
				
				if (view.sOverride) {
					view.styleHook.s.overrideStyles(view.sOverride);
				}
				view.styleHook.s.shouldSerializeAll();
				
				// For style overrides and custom def objects.
				// the iframe is -no- shadow root => get the first app-root encountered as parent node
				if (view.currentViewAPI.nodeName === 'iframe') {
					if (rootNodeIfDOM.shadowRoot)
						rootNodeIfDOM.shadowRoot.prepend(view.styleHook.s.getStyleNode());
					// FIXME: this should be of no use: crappy fallback
					else
						document.body.prepend(view.styleHook.s.getStyleNode());
				}
				else {
					view.callCurrentViewAPI('getWrappingNode').append(view.styleHook.s.getStyleNode());
				}
			}
		}
		
		if(view.parentView && typeof view.parentView.callCurrentViewAPI !== 'function')
			console.warn('unknown rendering error : view.parentView.callCurrentViewAPI is not a function', view.parentView);
	
		if (view.parentView && view.parentView.callCurrentViewAPI('getWrappingNode')) {
			view.parentView.callCurrentViewAPI('getWrappingNode').append(view.callCurrentViewAPI('getMasterNode'));
		}
		
		// This is quite risky, as for now rootView is instanciated first,
		// but do we have any guarantee this will always be the case ?
		if (!rootNodeIfDOM && view.currentViewAPI.nodeName === 'app-root')
			rootNodeIfDOM = view.callCurrentViewAPI('getMasterNode');
	});
}





/*
 * INITIALIZATION CHAPTER : instanciate Streams
 * 
 */
Ignition.prototype.instanciateStreams = function() {
	var typedComponentRegister = Registries.typedHostsRegistry.cache;
	var streams = Registries.caches.streams.cache;
	for (let defUID in typedComponentRegister) {
		typedComponentRegister[defUID].forEach(function(component) {
			streams[defUID].forEach(function(stateObj) {
//				console.log(stateObj.getName(), component)
				component.streams[stateObj.getName()] = new CoreTypes.Stream(stateObj.getName(), stateObj.getValue(), null, null, null, component);
			})
		});
	}
}





/*
 * INITIALIZATION CHAPTER : handle reactivity & events
 * 
 */
Ignition.prototype.handleReactivityAndEvents = function() {
	var typedComponentRegister = Registries.typedHostsRegistry.cache;
	var reactivityQueries, eventQueries, bindingHandler, component;
	
	TemplateFactory.reactivityQueries.forEach(function(subscriptionType) {
		bindingHandler = subscriptionType + 'Binding';
		
		for (let defUID in typedComponentRegister) {
			reactivityQueries = Registries.caches[subscriptionType].cache[defUID];
			
			typedComponentRegister[defUID].forEach(function(component) {
				// DEBUG HACK: to stop the infinite recursion we had in the DesignSystemManager
//				if (listDef && (component._children.length >= 3 || reactivityQueries.length > 3)) {	//typedComponentRegister[defUID].listItemMembersCount
////					console.log(reactivityQueries, component);
//					return;
//				}
				
				if (!reactivityQueries.length)
					return;

				if (component._parent && subscriptionType === 'reactOnParent')
					component[bindingHandler](reactivityQueries, component._parent, subscriptionType);
				else if (subscriptionType === 'reactOnSelf') {
					component[bindingHandler](reactivityQueries, component._parent, subscriptionType);
				}
			});
		}
		
	});
	TemplateFactory.eventQueries.forEach(function(subscriptionType) {
		
		for (let defUID in typedComponentRegister) {
			eventQueries = Registries.caches[subscriptionType].cache[defUID];
			
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
	var typedComponentRegister = Registries.typedHostsRegistry.cache;

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
	var typedComponentRegister = Registries.typedHostsRegistry.cache;
	for (let defUID in typedComponentRegister) {
		typedComponentRegister[defUID].forEach(function(component) {
			if (!component.view)
				return;
			
			// TMP Hack: call artificial "hook" on LazySlottedCompoundComponent although it's not a "ComponentWithHooks"
			// (see LazySlottedCompoundComponent & ColorSamplerSetComponent)
			if (component instanceof Component.ComponentWithHooks || component instanceof coreComponents.LazySlottedCompoundComponent)
				component.registerEvents();

			this.defineStreamsBidirectionalReflection(defUID, component);
		}, this);
	}
	
	var dataStoreKey;
	for (let defUID in typedComponentRegister) {
		typedComponentRegister[defUID].forEach(function(component) {
			if (typeof (dataStoreKey = Registries.dataStoreRegistry.getItem(component._UID)) !== 'undefined')
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
	component.view.getMasterNode().streams = component.streams;
	
	// And we reflect the View on each State Stream : 
	// 		-> it's a nice & implicit way to declare in the def obj that the reactivity-chain targets an "exposed" state
	// And we define for each State a special prop on the view, that reflects the state of the component
	// 
	// -*- Regarding the word "implicit" : these "kind of" tricks are strongly motivated by the philosophy of the DOM custom elements :
	//			=> the global state of the component is held by an attribute on the node : styling uses then "state dependant" selectors (through CSS or anything you could use)
	//			=> this reflection mechanism is the second step needed to achieve the goal we've mentioned above,
	// 			   say that the reactivity-chain is exposed for anyone to have access to the component's magic, even from outside of the framework    
	Registries.caches.states.cache[defUID].forEach(function(stateObj) {
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
//		component.streams[stateObj.getName()].value = stateObj.getValue();
	}
}
Ignition.prototype.handleReflectionOnModel = function(reflectOnModel, augmentModel, item) {
	// states and props may be automatically reflected on the component and so here on the host of the (Composed)Component (depending on the fact they're declared on the def), but not on the model : define that here
	//		update the model (assigning a getter & setter) in order to get the component's props reflected on the model
	// else
	// 		update the component's reactive props without reflection on the model
	
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
	Registries.viewsRegistry.length = 0;
	Registries.typedHostsRegistry.reset();	
}


/**
 * @method Ignition.prototype.getUpperWrappingComponentOutsideAppScope
 */

Ignition.prototype.getWrappingComponentOutsideAppScope = function(selector) {
	if (typeof window.parent === 'undefined') {
		console.warn('AppIgnition.getWrappingComponentOutsideAppScope: can only be called from insed an IFrame (no parent window found). Returning...');
		return;
	}
	else if (window.parent.document.querySelector('app-root').shadowRoot === null) {
		console.log(window.parent.document.querySelector('app-root'));
		console.error('AppIgnition.getWrappingComponentOutsideAppScope: the DOMelem named app-root has no shadowRoot. Returning...');
		return;
	}
	
	var matchingFrameElement;
	if ((matchingFrameElement = window.parent.document.querySelector('app-root').shadowRoot.querySelector(selector))) {
		return matchingFrameElement._component;
	}
	else if (!selector){
		console.error('AppIgnition helper method for IFrames: getting a ref on a component outside of the app\'s scope requires passing a DOM selector');
	}
	else {
		console.error('AppIgnition helper method for IFrames: no matching IFrame element for the given selector');
	}
}








/**
 * @constructor IgnitionFromDef
 */
const IgnitionFromDef = function(definition, parentView, parent) {
	
	var type = definition.getHostDef().getType() || (definition.getGroupHostDef() && definition.getGroupHostDef().getType());
	if (type in componentTypes) {
		var mainComponent = new componentTypes[type](definition, parentView, parent);
		this.decorateComponentsThroughDefinitionsCache();
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
const IgnitionToCompound = function(definition, parentView) {
	
	var mainComponent = new CompoundComponent(definition, parentView); 
	this.decorateComponentsThroughDefinitionsCache();
	return mainComponent;
}
IgnitionToCompound.prototype = Object.create(Ignition.prototype);
IgnitionToCompound.prototype.objectType = 'IgnitionToCompound'; 



/**
 * @constructor IgnitionToExtensible
 */
const IgnitionToExtensible = function(definition, containerIdOrContainerNode) {
	
	var mainComponent = new componentTypes.SinglePassExtensibleCompoundComponent(definition, containerIdOrContainerNode); 
	this.decorateComponentsThroughDefinitionsCache();
	return mainComponent;
}
IgnitionToExtensible.prototype = Object.create(Ignition.prototype);
IgnitionToExtensible.prototype.objectType = 'IgnitionToExtensible'; 


/**
 * @constructor DelayedInit
 * @param {String} containerId : A DOM selector, can be body or an id selector without the #
 * @param {Component} component : the root component to be injected in the DOM
 * @param {HierarchicalDefinition} componentListHostDef : an optional definition for a list of components to be instanciaded /!\ RESEVERD for the Dataset Type
 */
const DelayedDecoration = function(containerId, component, componentListHostDef) {
	
	this.decorateComponentsThroughDefinitionsCache(componentListHostDef);
	
	if (componentListHostDef)
		componentListHostDef.each.length = 0;
	
	if (typeof containerId !== 'string')
		return;

	document.querySelector(containerId !== 'body' ? '#' + containerId : containerId).appendChild(component.view.getMasterNode());
}
DelayedDecoration.prototype = Object.create(Ignition.prototype);
DelayedDecoration.prototype.objectType = 'DelayedDecoration';







/**
 * @utility renderDOM
 * @param {String} containerSelector : A DOM selector, can be body or an id selector without the #
 * @param {Component} component : the root component to be injected in the DOM
 * @param {HierarchicalDefinition} componentListHostDef : an optional definition for a list of components to be instanciaded /!\ RESEVERD for the Dataset Type
 */
const renderDOM = function(containerSelector, component, componentListHostDef) {
	const app = new Ignition()
	app.decorateComponentsThroughDefinitionsCache(componentListHostDef);
	
	if (componentListHostDef)
		componentListHostDef.each.length = 0;
	
	if (typeof containerSelector !== 'string')
		return component;

	document.querySelector(containerSelector).appendChild(component.view.getMasterNode());
}










/**
 * @constructor RootView
 */
const createRootViewComponentHostDef = require('src/coreComponents/RootViewComponent/coreComponentDefs/RootViewComponentHostDef');

const RootView = function(igniterForChild, preparePage, noAppend) {
	var component;
	if (preparePage)
		component = new componentTypes.RootViewComponent(TypeManager.createComponentDef(createRootViewComponentHostDef().moduleDef));
	else
		component = new componentTypes.RootViewComponent(TypeManager.createComponentDef(createRootViewComponentHostDef().minimalModuleDef));
	
	if (igniterForChild && typeof igniterForChild.init === 'function') {
		igniterForChild.init(component.view, component);
	}
	
	// Render in all sitations as we may want a root view whithout children when beginning the creation of an app
	component.render();
	
	// HACK: before we generalize the API for style objects, there's only the DOM...
	//		=> don't try to append a node to the DOM if we're outside the browser
	if (typeof document === 'undefined' || typeof document.ownerDocument === 'undefined')
		return component;
	
	if (!noAppend)
		document.querySelector('body').appendChild(component.view.getMasterNode());
	return component;
}
RootView.prototype = Object.create(Ignition.prototype);
RootView.prototype.objectType = 'RootView';













/**
 * @constructor List
 * This ctor is the effector of the ReactiveDataset
 * 	=> tight coupling = mandatory static inclusion in core (Dataset requires App).
 */
const List = function(definition, parent) {
	this.create(definition, parent);
}
List.prototype = Object.create(Ignition.prototype);
List.prototype.objectType = 'List'; 

List.prototype.create = function(definition, parent) {
	new coreComponents.ComponentList(definition, parent.view, parent);
	this.decorateComponentsThroughDefinitionsCache(definition.getHostDef());
	definition.getHostDef().each = [];
}

const App = {
		componentTypes : componentTypes,
		coreComponents : coreComponents,
		RootView : RootView,
		IgnitionToCompound : IgnitionToCompound,
		IgnitionFromDef : IgnitionFromDef,
		IgnitionToExtensible : IgnitionToExtensible,
		DelayedDecoration : DelayedDecoration,
		renderDOM : renderDOM,
		List : List,
		decorateComponentsThroughDefinitionsCache : IgnitionFromDef.prototype.decorateComponentsThroughDefinitionsCache
}

module.exports = App;