/**
 * 
 */



const appConstants = require('src/appLauncher/appLauncher');
//const TypeManager = require('src/core/TypeManager');
const TemplateFactory = require('src/core/TemplateFactory');
const Registries = require('src/core/Registries');
const SWrapperInViewManipulator = require('src/_DesignSystemManager/SWrapperInViewManipulator');


const UIDGenerator = require('src/core/UIDGenerator');
const PropertyCache = require('src/core/PropertyCache');
const CachedTypes = require('src/core/CachedTypes');
//const idGenerator = TemplateFactory.UIDGenerator;
const nodesRegistry = Registries.nodesRegistry;
const viewsRegistry = Registries.viewsRegistry;

//const JSkeyboardMap = require('src/events/JSKeyboardMap');






//console.log(nodesRegistry);
//console.log(viewsRegistry);














/**
 * @constructor Pair
 * 
 * @param String name
 * @param String value
 */
var Pair = function(name, value) {
	this.name = name;
	this.value = value;
}
Pair.prototype = {};





var ListOfPairs = function(pseudoNameValuePairsList) {
	if (Array.isArray(pseudoNameValuePairsList)) {
		for (let i = 0, l = pseudoNameValuePairsList.length; i < l; i++) {
			this.push(
				new Pair(
					pseudoNameValuePairsList[i].name,
					pseudoNameValuePairsList[i].value
				)
			);
		}
	}
}
ListOfPairs.prototype = Object.create(Array.prototype);
Object.defineProperty(ListOfPairs.prototype, 'objectType', {
	value : 'ListOfPairs'
});














var DimensionsPair = function(initialValues) {
	this.inline = initialValues ? initialValues[0] : 0;
	this.block = initialValues ? initialValues[1] : 0;
}
DimensionsPair.prototype = {};
DimensionsPair.prototype.objectType = 'DimensionsPair';

DimensionsPair.prototype.set = function(valuesPair) {
	this.inline = valuesPair[0];
	this.block = valuesPair[1];
	return this;
}
DimensionsPair.prototype.add = function(valuesPair) {
	this.inline += valuesPair[0];
	this.block += valuesPair[1];
	return this;
}
DimensionsPair.prototype.substract = function(valuesPair) {
	this.inline -= valuesPair[0];
	this.block -= valuesPair[1];
	return this;
}
//dimensionsPair.prototype.getInlineValue = function() {
//	return this.inline;
//}
//dimensionsPair.prototype.getBlockValue = function() {
//	return this.block;
//}
//dimensionsPair.prototype.setInlineValue = function(inline) {
//	this.inline = inline;
//}
//dimensionsPair.prototype.setBlockValue = function(block) {
//	this.block = block;
//}














/**
 * @constructor EventEmitter
 */
var EventEmitter = function() {
	this.objectType = 'EventEmitter';
	this._eventHandlers = {};
	this._one_eventHandlers = {};
	this._identified_eventHandlers = {};
	
	this.createEvents();
}
EventEmitter.prototype = {};
EventEmitter.prototype.objectType = 'EventEmitter';

/**
 * @virtual
 */
EventEmitter.prototype.createEvents = function() {}				// virtual

/**
 * Creates a listenable event : generic event creation (onready, etc.)
 * 
 * @param {string} eventType
 */
EventEmitter.prototype.createEvent = function(eventType) {
	var self = this;
	this._eventHandlers[eventType] = [];
	if (!Object.getOwnPropertyDescriptor(this, 'on' + eventType)) {
		var propDescriptor = {};
		propDescriptor['on' + eventType] = {
			set : function(callback) {
				self.addEventListener(eventType, callback);
			}
		}
		Object.defineProperties(this, propDescriptor);
	}
	else {
		console.warn(this.objectType, ': this.createEvent has been called twice with the same eventType =>', eventType);
	}
	
	this._one_eventHandlers[eventType] = [];
	// identified event handlers are meant to be disposable
	this._identified_eventHandlers[eventType] = [];
}
/**
 * Deletes... an event
 * 
 * @param {string} eventType
 */
EventEmitter.prototype.deleteEvent = function(eventType) {
	delete this['on' + eventType];
}

EventEmitter.prototype.hasStdEvent = function(eventType) {
	
	return (typeof this._eventHandlers[eventType] !== 'undefined');
}

/**
 * @param {string} eventType
 * @param {function} handler : the handler to remove (the associated event stays available) 
 */
EventEmitter.prototype.removeEventListener = function(eventType, handler) {
	if (typeof this._eventHandlers[eventType] === 'undefined')
		return;
	for(var i = 0, l = this._eventHandlers[eventType].length; i < l; i++) {
		if (this._eventHandlers[eventType][i] === handler) {
			this._eventHandlers[eventType].splice(i, 1);
		}
	}
	for(var i = 0, l = this._one_eventHandlers[eventType].length; i < l; i++) {
		if (this._one_eventHandlers[eventType][i] === handler) {
			this._one_eventHandlers[eventType].splice(i, 1);
		}
	}
	for(var i = 0, l = this._identified_eventHandlers[eventType].length; i < l; i++) {
		if (this._identified_eventHandlers[eventType][i] === handler) {
			this._identified_eventHandlers[even-tType].splice(i, 1);
		}
	}
}

/**
 * These methods are only able to add "permanent" handlers : "one-shot" handlers must be added by another mean 
 * @param {string} eventType
 * @param {function} handler : the handler to add 
 * @param {number} index : where to add
 */
EventEmitter.prototype.addEventListener = function(eventType, handler) {
	if (typeof this._eventHandlers[eventType] === 'undefined')
		return;
	this._eventHandlers[eventType].push(handler);
}

EventEmitter.prototype.addEventListenerAt = function(eventType, handler, index) {
	if (typeof this._eventHandlers[eventType] === 'undefined')
		return;
	this._eventHandlers[eventType].splice(index, 0, handler);
}

EventEmitter.prototype.removeEventListenerAt = function(eventType, index) {
	if (typeof this._eventHandlers[eventType] === 'undefined')
		return;
	if (typeof index === 'number' && index < this._eventHandlers[eventType].length) {
		this._eventHandlers[eventType].splice(index, 1);
	}
}

EventEmitter.prototype.clearEventListeners = function(eventType) {
	if (typeof this._eventHandlers[eventType] === 'undefined')
		return;
	this._eventHandlers[eventType].length = 0;
	this._one_eventHandlers[eventType].length = 0;
}

/**
 * Generic Alias for this['on' + eventType].eventCall : this alias can be called rather than the eventCall property
 * @param {string} eventType
 * @param {any} payload 
 */ 
EventEmitter.prototype.trigger = function(eventType, payload, eventIdOrBubble, eventID) {
	if (!this._eventHandlers[eventType] && !this._one_eventHandlers[eventType] && !this._identified_eventHandlers[eventType]) {
		console.warn(this.objectType, 'Event : ' + eventType + ' triggered although it doesn\'t exist. Returning...');
		return;
	}
	
	var bubble = false;
	if (typeof eventIdOrBubble === 'boolean')
		bubble = eventIdOrBubble;
	else
		eventID = eventIdOrBubble;
	
	for(var i = 0, l = this._eventHandlers[eventType].length; i < l; i++) {
		if (typeof this._eventHandlers[eventType][i] === 'function')
			this._eventHandlers[eventType][i]({type : eventType, data : payload, bubble : bubble});
	}

	for(var i = this._one_eventHandlers[eventType].length - 1; i >= 0; i--) {
		if (typeof this._one_eventHandlers[eventType][i] === 'function') {
			this._one_eventHandlers[eventType][i]({type : eventType, data : payload, bubble : bubble});
			delete this._one_eventHandlers[eventType][i];
		}
	}
	
	var deleted = 0;
	if (typeof eventID !== 'undefined' && eventID !== 0) {
		for(var i = this._identified_eventHandlers[eventType].length - 1; i >= 0; i--) {
			if (typeof this._identified_eventHandlers[eventType][i] === 'undefined')
				deleted++;
			else if (eventID === this._identified_eventHandlers[eventType][i]['id']) {
				if (typeof this._identified_eventHandlers[eventType][i] === 'object') {
					this._identified_eventHandlers[eventType][i].f({type : eventType, data : payload, bubble : bubble})
					delete this._identified_eventHandlers[eventType][i];
				}
			}
		}
	}

	this._one_eventHandlers[eventType] = [];
	if (deleted === this._identified_eventHandlers[eventType].length)
		this._identified_eventHandlers[eventType] = [];
}





















/**
 * An abstract class based on a pattern similar to the Command pattern
 * 
 * new Command(
		function() {					// action
			// code here //
			this.trigger('action');
		},
		function() {					// canAct
			
		},
		function() {					// undo
			
		}
	)
 * 
 */

var Command = function(action, canAct, undo) {

	this.objectType = 'Command ' + action.name;
	this.canActQuery = false;
	this.action = action;
	this.canAct = canAct || null;
	this.undo = undo;
}

Command.prototype.objectType = 'Command';
Command.prototype.constructor = Command;

Command.prototype.act = function() {
	var self = this, canActResult, args = Array.prototype.slice.call(arguments);
	
	if (this.canAct === null) {
		this.action.apply(null, args);
		this.canActQuery = Promise.resolve();
	}
	else {
		this.canActQuery = this.canAct.apply(null, args); 
		if (typeof this.canActQuery === 'object' && this.canActQuery instanceof Promise) {
			this.canActQuery.then(
					function(queryResult) {
						args.push(queryResult);
						self.action.apply(null, args);
						return queryResult;
					},
					function(queryResult) {
						return queryResult;
					}
			);
		}
		else if (this.canActQuery) {
			this.canActQuery = Promise.resolve(this.canActQuery);
			this.action.apply(null, args);
		}
		else {
			this.canActQuery = Promise.reject(this.canActQuery);
		}
	}
	return this.canActQuery;
}


Command.__factory_name = 'Command';






/**
 * A constructor for STREAMS : streams may be instanciated by the implementation at "component" level (observableComponent automates the stream creation),
 * 					or as standalones when a view needs a simple "internal" reference to a stream (may also be totally elsewhere)
 */

var Stream = function(name, value, hostedInterface, transform, lazy, component) {
	this._hostComponent = component;
	this.forward = true;
	this.name = name;
	this.lazy = lazy || false;
	this.hostedInterface = hostedInterface;
	this.transform = transform || (value => value);
	this.inverseTransform;
	this.subscriptions = [];
	
	this._value;
	this.dirty;
	if (typeof value !== 'undefined')
		this.value = (hostedInterface && typeof hostedInterface.getProp === 'function') ? hostedInterface.getProp(name) : value;
}
Stream.prototype = {};
Stream.prototype.objectType = 'Stream';
Stream.prototype.constructor = Stream;
Object.defineProperty(Stream.prototype, 'value', {
	get : function() {
//		console.log(this.lazy, this.dirty, this.transform);
		if (this.lazy && this.dirty) {
			this.lazyUpdate();
		}
		
		return this.get();
	},
	
	set : function(value) {
//		console.log(value);
//		console.log(this.hostedInterface);
		var val = this.transform(value);
//		console.log(this.name, val);
		this.setAndUpdateConditional(val);
		this.set(val);
	}
});

Stream.prototype.acquireHostedInterface = function(hostedInterface) {
	hostedInterface.setProp(this.name, this._value);
	this.hostedInterface = hostedInterface;
}

Stream.prototype.get = function() {
	return this._value;
}

Stream.prototype.set = function(value) {
//	if (this.name === 'className')
//		console.log(this.forward, this.hostedInterface, value);
	if (this.forward && this.hostedInterface) {
		this.forward = false;
		this.hostedInterface.setProp(this.name, value);
		this.forward = true;
	}
	else
		this.forward = true;
}

/**
 * @method setAndUpdateConditional
 * 		Avoid infinite recursion when setting a prop on a custom element : 
 * 			- when set from outside : update and set the prop on the custom element
 *			- after updating a prop on a custom element : update only
 * 			- don't update when set from downward (reflected stream shall only call "set")
 */
Stream.prototype.setAndUpdateConditional = function(value) {
	this._value = value;
	if (!this.lazy) {
		if (this.forward) {
			if (!this.transform)
				this.update();
			else if (typeof this.transform === 'function') {
				try {
					// try/catch as the transform function is likely to always be outside of our scope
					this._value = this.transform(this._value);
				}
				catch(e) {
					console.log('Exception thrown while the transform function was executing on self data: ', e, this._value);
					return;
				}
				this.update();
			}
		}
	}
	else {
		this.dirty = true;
	}
}

Stream.prototype.update = function() {
	this.subscriptions.forEach(function(subscription) {
		subscription.execute(this._value);
	}, this);
}

Stream.prototype.lazyUpdate = function() {
	if (typeof this.transform === 'function') {
		try {
			// try/catch as the transform function is likely to always be outside of our scope
			this._value = this.transform(this._value);
		}
		catch(e) {
			console.log('Exception thrown while the transform function was executing on self data: ', e, this._value);
			return;
		}
	}
	this.update();
	this.dirty = false;
}

Stream.prototype.react = function(prop, reflectedHost) {
	this.get = function() {
		return reflectedHost[prop];
	}
	this.subscribe(prop, reflectedHost);
}

/**
 * reflect method  :
 *	triggers the local update loop when the reflectedHost updates
 *	AND
 *		simply sets a reflection mecanism if the reflectedHost[prop] was a literal
 *		OR
 *		lazy "sets" the reflectedHost (no infinite recursion, but no change propagation neither on the host) and triggers the given event when the local stream updates
 */ 
Stream.prototype.reflect = function(prop, reflectedHost, transform, inverseTransform, event) {
	this._value = reflectedHost[prop];// ? reflectedHost[prop] : this._value;
	
	if (transform && this.transform)
		console.warn('Bad transform assignment : this.transform already exists');
	else if (!this.transform)
		this.transform = transform;
	
	var desc = Object.getOwnPropertyDescriptor(reflectedHost, prop);
	var stdDesc = Object.getOwnPropertyDescriptor(Stream.prototype, 'value');
	var propertyDescriptor = {
			get : stdDesc.get.bind(this),
			set : stdDesc.set.bind(this)
	};
	
	if (!desc || (!desc.get && desc.writable))
		Object.defineProperty(reflectedHost, prop, propertyDescriptor);
	
	else if (reflectedHost.streams && reflectedHost.streams[prop]) {
		this._value = reflectedHost.streams[prop].get(); // we need transformed value if lazy
		
		reflectedHost.streams[prop].subscribe(this);
		
//		if (typeof reflectedHost.trigger === 'function')
//			this.subscribe(reflectedHost.trigger.bind(reflectedHost, event));
		
		return this.subscribe(reflectedHost.streams[prop].set, null, inverseTransform);
	}
	return this._value;
}

/**
 * subscribe method  :
 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter & map)
 */ 
Stream.prototype.subscribe = function(handlerOrHost, prop, transform, inverseTransform) {
	if (!handlerOrHost || (typeof handlerOrHost !== 'function' && typeof handlerOrHost !== 'object')) {
		console.warn('Bad observable handlerOrHost assigned : handler type is ' + typeof handler + ' instead of "function or getter/setter"', 'StreamName ' + this.name);
		return;
	}
	else {
		if (typeof transform === 'function')
			this.transform = transform;
		return this.addSubscription(handlerOrHost, prop, inverseTransform);//.subscribe();
	}
}

/**
 * filter method (syntactic sugar) :
 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (map) and the effective subscribtion
 */ 
Stream.prototype.filter = function(handlerOrHost, prop, filterFunc) {
	return this.addSubscription(handlerOrHost, prop).filter(filterFunc);
}

/**
 * map method (syntactic sugar) :
 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter) and the effective subscribtion
 */ 
Stream.prototype.map = function(handlerOrHost, prop, mapFunc) {
	return this.addSubscription(handlerOrHost, prop).map(mapFunc);
}

Stream.prototype.addSubscription = function(handlerOrHost, prop, inverseTransform, subscribingComponent) {
	this.subscriptions.push(new Subscription(handlerOrHost, prop, this, inverseTransform));
	return this.subscriptions[this.subscriptions.length - 1];
}

Stream.prototype.unsubscribe = function(subscriptionOrStream) {

	for(let i = this.subscriptions.length - 1; i >= 0; i--) {
		if (this.subscriptions[i] === subscriptionOrStream || this.subscriptions[i].obj === subscriptionOrStream) {
			this.subscriptions.splice(i, 1);
		}
	}
}







/**
 * An Abstract Class to be used by the Stream Ctor
 * 
 * returns chainable callback assignment functions on subscription
 * e.g. : childModules make use of this mecanism when automatically subscribing to streams on their parent :
 * 		this.streams[parentState].subscribe(candidate.hostElem, childState).filter(desc.filter).map(desc.map);
 */
var Subscription = function(subscriberObjOrHandler, subscriberProp, parent, inverseTransform) {
	this.subscriber = {
			prop : subscriberProp || null,
			obj : typeof subscriberObjOrHandler === 'object' ? subscriberObjOrHandler : null,
			cb : typeof subscriberObjOrHandler === 'function' ? subscriberObjOrHandler : function defaultCb() {return this._stream._value},
			inverseTransform : inverseTransform || function(value) {return value;},
			_subscription : this,
			_stream : parent,
			_parentHost : parent._hostComponent,
			host : null
	}
//	typeof subscriberProp === 'string' ?
	this._stream = parent;
	this._subscriberUID = '';
	this._subscriberType = '';
	
	this._firstPass = true;
}
//
//Subscription.prototype.subscribe = function(subscriberObjOrHandler, subscriberProp, inverseTransform) {
////	if (typeof subscriberObjOrHandler !== 'function' && typeof subscriberObjOrHandler !== 'object' && !this.subscriber.obj && !this.subscriber.cb) {
////		console.warn('Bad observableHandler given : handler type is ' + typeof subscriberObjOrHandler + ' instead of "function or object"', 'StreamName ' + this._parent.name);
////		return;
////	}
//	if (typeof subscriberObjOrHandler === 'object')
//		this.subscriber.obj = subscriberObjOrHandler;
//	else if (typeof subscriberObjOrHandler === 'function')
//		this.subscriber.cb = subscriberObjOrHandler;
//	
//	if (subscriberProp)
//		this.subscriber.prop = subscriberProp;
//	
//	return this;
//}

Subscription.prototype.unsubscribe = function() {
	this._stream.unsubscribe(this);
}

Subscription.prototype.filter = function(filterFunc, hostComponent) {
	if (!filterFunc)
		return this;
		
	// when cbOnly, we bind the cb on the component
	// but when reacting from a streamon a stream
	// we only have a ref on the parent stream
	// => we need to acquire a ref on the component somehow
	if (!this.subscriber.host)
		this.subscriber.host = hostComponent;

	// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark shows a slight improvement, as timings are identical although there is an overhaed with defineProperty)
	var f = new Function('value', 'return (' + filterFunc.toString() + ').call(this.subscriber.host, value) === true ? true : false;');
	Object.defineProperty(this, 'filter', {
		value : f,
		enumerable : true
	});
//	this.filter = filterFunc;
	return this;
}

Subscription.prototype.map = function(mapFunc, hostComponent) {
	if (!mapFunc)
		return this;
		
	// when cbOnly, we bind the cb on the component
	// but when reacting from a streamon a stream
	// we only have a ref on the parent stream
	// => we need to acquire a ref on the component somehow
	if (!this.subscriber.host)
		this.subscriber.host = hostComponent;

	// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark shows a slight improvement, as timings are identical although there is an overhaed with defineProperty)
	var f = new Function('value', 'return (' + mapFunc.toString() + ').call(this.subscriber.host, value);');
	Object.defineProperty(this, 'map', {
		value : f,
		enumerable : true
	});
//	this.map = mapFunc;
	return this;
}

Subscription.prototype.reverse = function(inverseTransform) {
	if(typeof inverseTransform !== 'function')
		return this;

	// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark needed)
	this.subscriber.inverseTransform = new Function('return (' + inverseTransform.toString() + ').apply(null, arguments);');
//	this.subscriber.inverseTransform = inverseTransform;
	return this;
}

Object.defineProperty(Subscription.prototype, 'execute', {
	value : function(value) {
//		console.log('%c %s %c %s', 'color:coral', 'Subscription "execute"', 'color:firebrick', 'Stream : ' + this._stream.name, 'value', value);
		var flag = true, val, desc;
		if (value !== undefined) {
			if (this.hasOwnProperty('filter'))
				flag = this.filter(value);
			if (flag && this.hasOwnProperty('map'))
				val = this.map(value);
			else if (flag)
				val = value;
			else
				return;
//			console.log('val', this._stream.name, val);
			
			if (this.subscriber.obj !== null && this.subscriber.prop !== null)
				this.subscriber.obj[this.subscriber.prop] = val;
			// second case shall only be reached if no prop is given : on a "reflected" subscription by a child component
			else if (this.subscriber.obj && (desc = Object.getOwnPropertyDescriptor(this.subscriber.obj, 'value')) && typeof desc.set === 'function')
				this.subscriber.obj.value = val;
			else if (this.subscriber.obj === null)
				this.subscriber.cb(this.subscriber.inverseTransform(val)); // inverseTransform may be a transparent function (is not when reflecting : we must not reflect the child state "as is" : the parent value may be "mapped requested" by the child)   
		}
		this._firstPass = false;
	},
	enumerable : true
});

Subscription.prototype.unAnonymize = function(subscriberUID, subscriberType) {
	this._subscriberUID = subscriberUID;
	this._subscriberType = subscriberType;
	
	return this;
}

Subscription.prototype.registerTransition = function(parent_UID) {
	Registries.stateMachineCache.registerTransition(
		this._subscriberUID,
		this._subscriberType,
		{
			from : this._stream.name,
			to : this.subscriber.prop,
			map : this.map,
			filter : this.filter,
			subscribe : this.subscriber.cb
		},
		parent_UID
	);
}











/**
 * A constructor for STREAMS more specifically used by providers objects
 */

var LazyResettableColdStream = function(name, transform, value) {

	this.forward = true;
	this.name = name;
	this.transform = transform || (value => value);
	this.inverseTransform;
	this.subscriptions = [];
	
	this._value;
	this._previousValues = [];
	this.lazy = true;
	this.dirty;
	this.lastIndexProvided = -1;
	if (typeof value !== 'undefined')
		this.value = value;
}
LazyResettableColdStream.prototype = Object.create(Stream.prototype);
LazyResettableColdStream.prototype.objectType = 'LazyResettableColdStream';
LazyResettableColdStream.prototype.constructor = LazyResettableColdStream;
Object.defineProperty(LazyResettableColdStream.prototype, 'value', {
	get : function() {
		
		if (this.lazy && this.dirty) {
			this.lazyUpdate();
		}
		
		return this.get();
	},
	
	set : function(value) {
		var val = this.transform(value);
		this.setAndUpdateConditional(val);
		this.forward = true;
	}
});

/**
 * @method setAndUpdateConditional
 * 		Avoid infinite recursion when setting a prop on a custom element : 
 * 			- when set from outside : update and set the prop on the custom element
 *			- after updating a prop on a custom element : update only
 * 			- don't update when set from downward (reflected stream shall only call "set")
 */
LazyResettableColdStream.prototype.setAndUpdateConditional = function(value) {
//	console.trace(value);
	this._value = value;
	this._previousValues.push(value);
	
	if (this.forward && !this.lazy) {
		if (!this.transform) {
			this.update();
		}
		else if (typeof this.transform === 'function') {
			try {
				// try/catch as the transform function is likely to always be outside of our scope
				this._value = this.transform(this._value);
				this._previousValues.splice(this._previousValues.length - 1, 1, this._value);
			}
			catch(e) {
				console.log('Exception thrown while the transform function was executing on self data: ', e, this._value);
				return;
			}
			this.update();
		}
	}
	else {
		this.dirty = true;
	}
}

LazyResettableColdStream.prototype.update = function() {
	
	this.subscriptions.forEach(function(subscription) {
		subscription.execute(this._previousValues);
//		console.log(this._previousValues[0]);
	}, this);
	this.lastIndexProvided = this._previousValues.length - 1;
}

LazyResettableColdStream.prototype.lazyUpdate = function() {
//	if (typeof this.transform === 'function') {
//		try {
//			// try/catch as the transform function is likely to always be outside of our scope
//			this._value = this.transform(this._value);
//			this._previousValues.splice(this._previousValues.length - 1, 1, this._value);
//		}
//		catch(e) {
//			console.log('Exception thrown while the transform function was executing on self data: ', e, this._value);
//			return;
//		}
//	}
	this.update();
	this.dirty = false;
}

LazyResettableColdStream.prototype.addSubscription = function(handlerOrHost, prop, inverseTransform) {
//	console.log(handlerOrHost, prop);
	this.subscriptions.push(new ColdSubscription(handlerOrHost, prop, this, inverseTransform));
	return this.subscriptions[this.subscriptions.length - 1];
}














/**
 * An Abstract Class to be used by the Stream Ctor
 * 
 * returns chainable callback assignment functions on subscription
 * e.g. : childModules make use of this mecanism when automatically subscribing to streams on their parent :
 * 		this.streams[parentState].subscribe(candidate.hostElem, childState).filter(desc.filter).map(desc.map);
 */
var ColdSubscription = function(subscriberObjOrHandler, subscriberProp, parent, inverseTransform) {
//	console.log(parent.lastIndexProvided);
	this.subscriber = {
		currentIndex : parent.lastIndexProvided,
		prop : subscriberProp || null,
		obj : typeof subscriberObjOrHandler === 'object' ? subscriberObjOrHandler : null,
		cb : typeof subscriberObjOrHandler === 'function' ? subscriberObjOrHandler : function defaultCb(val) {return val},
		inverseTransform : inverseTransform || function(value) {return value;},
		_subscription : this,
		_stream : parent
	}
//	typeof subscriberProp === 'string' ?
	this._stream = parent;
	this._firstPass = true;
}
ColdSubscription.prototype = Object.create(Subscription.prototype);
ColdSubscription.prototype.objectType = 'ColdSubscription';

Object.defineProperty(ColdSubscription.prototype, 'execute', {
	value : function(valuesFromStack) {
//		console.log(valuesFromStack);
		valuesFromStack.forEach(function(val, key) {
			if (key > this.subscriber.currentIndex) {
				this.executeSingle(val);
				this.subscriber.currentIndex++;
//				console.log(this.subscriber.currentIndex);
			}
		}, this);
	}
})

Object.defineProperty(ColdSubscription.prototype, 'executeSingle', {
	value : function(value) {
//		console.log('%c %s %c %s', 'color:coral', 'Subscription "execute"', 'color:firebrick', 'Stream : ' + this._stream.name, 'value:', value);
		var flag = true, val, desc;
		if (value !== undefined) {
			if (this.hasOwnProperty('filter'))
				flag = this.filter(value);
			if (flag && this.hasOwnProperty('map'))
				val = this.map(value);
			else if (flag)
				val = value;
			else
				return;
//			console.log('val', this._stream.name, val);
			
//			console.log(this.subscriber.obj !== null && this.subscriber.prop !== null);
			if (this.subscriber.obj !== null && this.subscriber.prop !== null)
				this.subscriber.obj[this.subscriber.prop] = val;
			// second case shall only be reached if no prop is given : on a "reflected" subscription by a child component
			else if (this.subscriber.obj && (desc = Object.getOwnPropertyDescriptor(this.subscriber.obj, 'value')) && typeof desc.set === 'function')
				this.subscriber.obj.value = val;
			else if (this.subscriber.obj === null)
				this.subscriber.cb(this.subscriber.inverseTransform(val)); // inverseTransform may be a transparent function (is not when reflecting : we must not reflect the child state "as is" : the parent value may be "mapped requested" by the child)   
		}
		this._firstPass = false;
	},
	enumerable : true
});

Object.defineProperty(ColdSubscription.prototype, 'setPointerToStart', {
	value : function() {
		this.subscriber.currentIndex = 0;
	}
})

























/**
 * A constructor for NUMBERED STREAMS : numbered streams should be part of a StreamPool
 */

var NumberedStream = function(key, component, name, value) {
	this._key = key;
	this._parent = component;
	Stream.call(this, name, value);
}
NumberedStream.prototype = Object.create(Stream.prototype);
NumberedStream.prototype.objectType = 'NumberedStream';
NumberedStream.prototype.constructor = NumberedStream;

Object.defineProperty(NumberedStream.prototype, 'value', {
	get : function() {
		if (this.lazy) {
			this.dirty = false;
		}
		
		return this.get();
	},
	
	set : function(value) {
		this.setAndUpdateConditional(value);
		this.set(value);
	}
});

NumberedStream.prototype.get = function() {
	return this._value;
}

NumberedStream.prototype.set = function(value) {
	if (this.forward && this.hostedInterface) {
		this.forward = false;
//		this.hostedInterface.setProp(this.name, value);
		this.forward = true;
	}
	else
		this.forward = true;
}

/**
 * @method setAndUpdateConditional
 * 		Avoid infinite recursion when setting a prop on a custom element : 
 * 			- when set from outside : update and set the prop on the custom element
 *			- after updating a prop on a custom element : update only
 * 			- don't update when set from downward (reflected stream shall only call "set")
 */
NumberedStream.prototype.setAndUpdateConditional = function(value) {
	this._value = value;
	if (!this.lazy) {
		if (this.forward) {
			this.update();
		}
	}
	else {
		this.dirty = true;
	}
}

/**
 * 
 */
NumberedStream.prototype.remove = function() {
	if (this._parent)
		return this._parent.removeChild(this._key);
}













/**
 * A constructor for STREAMS POOL : numbered streams should be part of a StreamPool
 */

var StreamPool = function(component) {
	this._parent = component;
	this._streamsArray  = [];
}
StreamPool.prototype = Object.create(EventEmitter.prototype);
StreamPool.prototype.objectType = 'StreamPool';
StreamPool.prototype.constructor = StreamPool;

/**
 * @param {number} idx : the _key of the member Stream
 */
StreamPool.prototype.getFirst = function() {
	return this._streamsArray[0];
}

/**
 * @param {number} idx : the _key of the member Stream
 */
StreamPool.prototype.getStreamAt = function(idx) {
	return this._streamsArray[idx];
}

/**
 * @param {number} idx : the _key of the member Stream
 */
StreamPool.prototype.getLast = function() {
	return this._streamsArray[this._streamsArray.length - 1];
}

/**
 * @param {object} child : an instance of another object
 */
StreamPool.prototype.pushChild = function(child) {
	child._parent = this;
	child._key = this._streamsArray.length;
	this._streamsArray.push(child);
}

/**
 * @param {object} child : an instance of another object
 * @param {number} atIndex : the required index to splice at
 */
StreamPool.prototype.addChildAt = function(child, atIndex) {
	child._parent = this;
	child._key = atIndex;
	this._streamsArray.splice(atIndex, 0, child);
	this.generateKeys(atIndex);
}

/**
 * 
 */
StreamPool.prototype.removeChild = function(childKey) {
	var removed = this._streamsArray.splice(childKey, 1);
	(childKey < this._streamsArray.length && this.generateKeys(childKey));
	return removed;
}

/**
 * 
 */
StreamPool.prototype.removeLastChild = function() {
	var removed = this._streamsArray.pop();
	return removed;
}

/**
 * @param {number} atIndex : the required index to clear at
 */
StreamPool.prototype.removeChildAt = function(atIndex) {
	var removedChild = this._streamsArray.splice(atIndex, 1);
	this.generateKeys(atIndex);
}

/**
 * 
 */
StreamPool.prototype.removeAllChildren = function() {
	this._streamsArray.length = 0;
	return true;
}

/**
 * @param {number} atIndex : the first _key we need to invalidate
 */
StreamPool.prototype.generateKeys = function(atIndex) {
	for (let i = atIndex || 0, l = this._streamsArray.length; i < l; i++) {
		this._streamsArray[i]._key = i;
	}
}
















/**
 * @constructor SavableStore
 * @param {Function} onUpdateCallback
 * @param {Array<String>} valueNamesList
 */
var SavableStore = function(onUpdateCallback, valueNamesList = []) {
	this.onUpdateCallback = onUpdateCallback;
	this.valueNames = Array();
	this.values = Array();
	if (valueNamesList && valueNamesList.length) {
		valueNamesList.forEach(function(valueName) {
			this.addValue(valueName);
		}, this);
	}
}

/**
 * @method addValue
 * @param {String} valueName
 */
SavableStore.prototype.addValue = function(valueName) {
	this.valueNames.push(valueName);
	this.values.push(new TemplateFactory.PropModel({[valueName] : undefined}))
}

/**
 * @method removeValue
 * @param {String} valueName
 */
SavableStore.prototype.removeValue = function(valueName) {
	// FIXME: we should make use of the valueNames index
	var valuePos = this.valueNames.indexOf(valueName);
	this.values.splice(valuePos, 1);
	this.valueNames.splice(valuePos, 1);
}

SavableStore.prototype.clearValues = function() {
	this.values.length = 0;
}

/**
 * @method update
 * @param {String} valueName
 * @param {String|Boolean} value
 */
SavableStore.prototype.update = function(valueName, value) {
	// FIXME: we should make use of the valueNames index
	var valueObj = this.values[this.valueNames.indexOf(valueName)];
	valueObj[valueName] = value;
	
	/** @type {{[key : String] : String|Boolean}} */
	let returnValue = {};
	this.valueNames.forEach(function(name, key) {
		returnValue[name] = this.values[key][name];
	}, this);
	this.onUpdateCallback(JSON.stringify(returnValue));
}

SavableStore.prototype.empty = function() {
	this.valueNames.forEach(function(valueName, key) {
		this.values[key][valueName] = undefined;
	}, this);
}


























/**
 * An interface to be implemented by a module based on a worker
 */
var WorkerInterface = function(workerName, stringifiedWorker, url) {
	EventEmitter.call(this);
	this.objectType = workerName || 'WorkerInterface';
	this._responseHandler = {};
	this.createEvent('message');
	this.name = workerName;
	
	var blob = new Blob([stringifiedWorker /*https://www.npmjs.com/package/stringify*/], {type: 'application/javascript'});
	var blobURL = window.URL.createObjectURL(blob);
	url = typeof blobURL === 'string' ? blobURL : url;
	this.worker = new Worker(url);
	this.worker.onmessage = this.handleResponse.bind(this); 
}
WorkerInterface.prototype = Object.create(EventEmitter.prototype);
WorkerInterface.prototype.objectType = 'WorkerInterface';
WorkerInterface.prototype.constructor = WorkerInterface;

WorkerInterface.prototype.postMessage = function(action, e) { 	// e.data = File Object (blob)
	// syntax [(messageContent:any)arg0, (transferableObjectsArray:[transferable, transferable, etc.])arg1]

	if (typeof e === 'undefined')
		this.worker.postMessage.call(this.worker, [action]);
	else if (e.data instanceof ArrayBuffer)
		this.worker.postMessage.call(this.worker, [action, e.data], [e.data]);
	else
		this.worker.postMessage.call(this.worker, [action, e.data]);
}

WorkerInterface.prototype.addResponseHandler = function(handlerName, handler) {
	if (typeof handler === 'function')
		this._responseHandler[handlerName] = handler;
}

WorkerInterface.prototype.handleResponse = function(response) {
//	console.log(response);
	
	if (!this.handleError(response))
		return;
	
	if (typeof this._responseHandler[response.data[0]] === 'function') {
		if (response.data.length > 1) {
			var args = Array.prototype.slice.call(response.data, 1);
			this._responseHandler[response.data[0]].apply(this, args);
			this.trigger('message', response.data, ['string', 'number'].indexOf(typeof args[0]) !== -1 ? args[0] : ''); // only pass strings or numbers as eventID
		}
		else {
			this._responseHandler[response.data[0]]();
			this.trigger('message', response.data);
		}
	}
	
}

WorkerInterface.prototype.handleError = function(response) {
	if (response.data.constructor !== Array) {
		console.log([this.name + ' error generic', '']);
		return;
	}

	switch (response.data[0]) {
		case 'error' :
		case 'warning' :
			console.log(this.name + ' ' + response.data[0], response.data[1]);
			return;
	}
	
	return true;
}

WorkerInterface.__factory_name = 'WorkerInterface';


























/**
 * @singleton PixiStage
 */
var PixiStage = {
	 
}

PixiStage.renderer = null;
PixiStage.stage = null;

PixiStage.createRenderer = function() {
	this.renderer = new PIXI.CanvasRenderer(window.innerWidth, window.innerHeight, {transparent:true, antialias : true, autoResize : true});
}

PixiStage.createStage = function() {
	this.stage = new PIXI.Container();
	
	TweenMax.ticker.addEventListener("tick", function() {
		renderer.render(stage);
	});
}

PixiStage.getStage = function() {
	return this.stage;
}

PixiStage.addChild = function(shape) {
	this.stage.addChild(shape);
}




/*
layerwidth = paddingLeft + marginLeft + nodeWidth
layerHeight = paddingTop + marginTop + nodeHeigth

position = {
	x : this.getParentView.currentAPI.getOffset().x + layerWidth,
	y : this.getParentView.currentAPI.getOffset().y + layerHeigth * this._parent._key
}

		=> extrapolate radial pos from domain = xMax - xMin, alpha = (x - xMin) * 2PI / domain, x = cos(alpha), y = sin(alpha)
		
getHandlePos is a pure function(entering||exiting, nodeSize, _Key)

	=> could we use some lib to have complete DOM -> xy conversion ?
		=> gl-html.js
*/







/**
 * @constructor PixiView
 */
var PixiViewAPI = function(def) {
	
	this.nodeName = def.nodeName;
	this.templateNodeName = def.templateNodeName;
	
	this.hostElem;
	this.rootElem;
	this.hostedInterface = {
		setProp : PixiViewAPI.hostedInterface.setProp.bind(this),
		getProp : PixiViewAPI.hostedInterface.getProp.bind(this)
	};
	this.presenceAsAProp = 'flex';
	
	this.objectType = 'PixiViewAPI';
}
PixiViewAPI.prototype = Object.create(EventEmitter.prototype);
PixiViewAPI.prototype.objectType = 'PixiViewAPI';
PixiViewAPI.prototype.constructor = PixiViewAPI;

PixiViewAPI.hostedInterface = {
	setProp : function(propName, value) {
//		this.hostElem[propName] = value;
	},
	getProp : function(propName, value) {
//		return this.hostElem[propName];
	}
};


PixiViewAPI.prototype.setPresence = function(bool) {
	this.hostElem.style.display = bool ? this.presenceAsAProp : 'none';
}

PixiViewAPI.prototype.addEventListener = function(eventName, handler) {
	this.hostElem.addEventListener(eventName, handler);
}

/**
 * 
 */
PixiViewAPI.prototype.setMasterNode = function(node) {
	this.hostElem = node;
	this.rootElem = node.shadowRoot;
}

/**
 * 
 */
PixiViewAPI.prototype.getMasterNode = function() {
	return this.hostElem;
}

/**
 * 
 */
PixiViewAPI.prototype.getWrappingNode = function() {
	return this.rootElem || this.hostElem;
}

/**
 * 
 */
PixiViewAPI.prototype.isTextInput = function() {
	return this.nodeName.toUpperCase() === 'INPUT';
}

/**
 * 
 */
PixiViewAPI.prototype.getLowerIndexChildNode = function() {
	try {
		return this.getWrappingNode().children[atIndex - 1];
	}
	catch(e) {
		return false;
	}
}

/**
 * 
 */
PixiViewAPI.prototype.setContentNoFail = function(value) {
	if (this.isTextInput())
		this.hostElem.value = value;
	else
		this.setNodeContent(value);
}

/**
 * 
 */
PixiViewAPI.prototype.setTextContent = function(text) {
	this.getWrappingNode().textContent = text;
}

/**
 * 
 */
PixiViewAPI.prototype.setNodeContent = function(contentAsString) {
	this.getWrappingNode().innerHTML = contentAsString;
}

/**
 * 
 */
PixiViewAPI.prototype.appendTextNode = function(text) {
	var elem = document.createElement('span');
	elem.innerHTML = text;
	this.getWrappingNode().appendChild(elem);
}

/**
 * @param {Component} childNode
 * @param {number} atIndex
 */
PixiViewAPI.prototype.addChildNodeAt = function(childNode, atIndex) {
	var lowerIndexChild;
	if (lowerIndexChild = this.getLowerIndexChildNode(atIndex))
		lowerIndexChild.insertAdjacentElement('afterend', childNode);
	else
		this.getWrappingNode().appendChild(childNode);
}

/**
 * @abstract
 */
PixiViewAPI.prototype.empty = function() {
	this.getWrappingNode().innerHTML = null;
	return true;
}

/**
 * @param {array[string]} contentAsArray
 * @param {string} templateNodeName
 */
PixiViewAPI.prototype.getMultilineContent = function(contentAsArray) {
	return this.getFragmentFromContent(contentAsArray, this.templateNodeName);
}

/**
 * @param {array[string]} contentAsArray
 * @param {string} templateNodeName
 */
PixiViewAPI.prototype.getFragmentFromContent = function(contentAsArray, templateNodeName) {

	var fragment = document.createDocumentFragment(), elem;
	contentAsArray.forEach(function(val) {
		var elem = document.createElement(templateNodeName);
		elem.id = 'targetSubViewElem-' + TemplateFactory.UIDGenerator.newUID();
		if (val instanceof HTMLElement) {
			elem.appendChild(val);
			fragment.appendChild(elem);
			return;
		}
		
		elem.innerHTML = val;
		fragment.appendChild(elem);
	}, this);
	return fragment;
}

PixiViewAPI.prototype.setContentFromArray = function(contentAsArray) {
	this.empty();
	this.getWrappingNode().appendChild(this.getMultilineContent(contentAsArray));
}






















/**
 * @constructor DOMView
 */
var DOMViewAPI = function(def) {
	this.isShadowHost = def.isCustomElem;
	this.nodeName = def.nodeName;
	this.templateNodeName = def.templateNodeName;
	
	this.hostElem;
	this.rootElem;
	this.hostedInterface = {
		setProp : DOMViewAPI.hostedInterface.setProp.bind(this),
		getProp : DOMViewAPI.hostedInterface.getProp.bind(this)
	};
	this.presenceAsAProp = 'flex';
	
	this.objectType = 'DOMViewAPI';
}
DOMViewAPI.prototype = Object.create(EventEmitter.prototype);
DOMViewAPI.prototype.objectType = 'DOMViewAPI';
DOMViewAPI.prototype.constructor = DOMViewAPI;

DOMViewAPI.hostedInterface = {
	setProp : function(propName, value) {
		this.hostElem[propName] = value;
//		console.log(this.hostElem[propName]);
	},
	getProp : function(propName, value) {
		return this.hostElem[propName];
	}
};


DOMViewAPI.prototype.setPresence = function(bool) {
	this.hostElem.style.display = bool ? this.presenceAsAProp : 'none';
}

DOMViewAPI.prototype.addEventListener = function(eventName, handler) {
	this.hostElem.addEventListener(eventName, handler);
}

/**
 * 
 */
DOMViewAPI.prototype.setMasterNode = function(node) {
	this.hostElem = node;
	this.rootElem = node.shadowRoot;
}

/**
 * 
 */
DOMViewAPI.prototype.getMasterNode = function() {
	return this.hostElem;
}

/**
 * 
 */
DOMViewAPI.prototype.getWrappingNode = function() {
	return this.rootElem || this.hostElem;
}

/**
 * 
 */
DOMViewAPI.prototype.isTextInput = function() {
	return this.nodeName.toUpperCase() === 'INPUT' || this.nodeName.toUpperCase() === 'TEXTAREA';
}

/**
 * 
 */
DOMViewAPI.prototype.getTextInputValue = function() {
	return this.getMasterNode().value;
}

/**
 * 
 */
DOMViewAPI.prototype.getLowerIndexChildNode = function(atIndex) {
	try {
		return this.getWrappingNode().children[atIndex - 1];
	}
	catch(e) {
		return false;
	}
}

/**
 * 
 */
DOMViewAPI.prototype.getTextContent = function() {
	// It may seem weird to return all the texts ignoring the real HTMLElements
	// Let'st try this for now...
	
	var realTextContent = '';
	this.getWrappingNode().childNodes.forEach(function(elem) {
		if (elem instanceof Text)
			realTextContent += elem.wholeText;
	});
	return realTextContent;
}

/**
 * 
 */
DOMViewAPI.prototype.setContentNoFail = function(value) {
	if (this.isTextInput())
		this.hostElem.value = value;
	else
		this.setNodeContent(value);
}

/**
 * 
 */
DOMViewAPI.prototype.getContentNoFail = function(value) {
	if (this.isTextInput())
		return this.hostElem.value;
	else
		return this.getTextContent(); 
}

/**
 * 
 */
DOMViewAPI.prototype.setTextContent = function(text) {
	this.getWrappingNode().textContent = text;
}

/**
 * 
 */
DOMViewAPI.prototype.setNodeContent = function(contentAsString) {
	this.getWrappingNode().innerHTML = contentAsString;
}

/**
 * 
 */
DOMViewAPI.prototype.appendTextNode = function(text) {
	var elem = document.createTextNode(text);
	this.getWrappingNode().appendChild(elem);
}

/**
 * @param {Component} childNode
 * @param {number} atIndex
 */
DOMViewAPI.prototype.addChildNodeAt = function(childNode, atIndex) {
	var lowerIndexChild;
	if ((lowerIndexChild = this.getLowerIndexChildNode(atIndex)))
		lowerIndexChild.insertAdjacentElement('afterend', childNode);
	else
		this.getWrappingNode().appendChild(childNode);
}

/**
 * @abstract
 */
DOMViewAPI.prototype.empty = function() {
	this.getWrappingNode().innerHTML = null;
	return true;
}

/**
 * @param {array[string]} contentAsArray
 * @param {string} templateNodeName
 */
DOMViewAPI.prototype.getMultilineContent = function(contentAsArray) {
	return this.getFragmentFromContent(contentAsArray, this.templateNodeName);
}

/**
 * @param {array[string]} contentAsArray
 * @param {string} templateNodeName
 */
DOMViewAPI.prototype.getFragmentFromContent = function(contentAsArray, templateNodeName) {

	var fragment = document.createDocumentFragment(), elem;
	contentAsArray.forEach(function(val) {
		var elem = document.createElement(templateNodeName);
		elem.id = 'targetSubViewElem-' + TemplateFactory.UIDGenerator.newUID();
		if (val instanceof HTMLElement) {
			elem.appendChild(val);
			fragment.appendChild(elem);
			return;
		}
		
		elem.innerHTML = val;
		fragment.appendChild(elem);
	}, this);
	return fragment;
}

DOMViewAPI.prototype.setContentFromArray = function(contentAsArray) {
	this.empty();
	this.getWrappingNode().appendChild(this.getMultilineContent(contentAsArray));
}

DOMViewAPI.prototype.updateBGColor = function(color) {
	this.getMasterNode().style.backgroundColor = color;
}

/**
 * These methods are implemented as a reminder and a potentially needed fallback,
 * but in most cases of hiding/showing, we should prefer the reactive states-based mechanism:
 * states : [{hidden : 'hidden'}} will be automagically reflected on the DOM node
 */
DOMViewAPI.prototype.hide = function() {
	this.getMasterNode().hidden = 'hidden';	
}

DOMViewAPI.prototype.show = function() {
	this.getMasterNode().hidden = null;	
}























/**
 * @constructor ComponentView
 */
var ComponentView = function(definition, parentView, parent, isChildOfRoot) {
//	console.error(definition);
	var def = (definition.getHostDef && definition.getHostDef()) || definition;
//	if (definition.getHostDef() && definition.getHostDef().nodeName === 'smart-select')
//		console.log(def);
	this._defUID = def.UID;
	this.isCustomElem = def.isCustomElem;
	this._sWrapperUID = def.sWrapper ? def.sWrapper.getName() : null;
	// TODO: styleHook.s refers to the AbstractStylesheet => change that, it's not at all explicit
	this.styleHook;
//	console.log(def);
	this.sOverride = def.sOverride;
	
	this.objectType = 'ComponentView';
	if (!def.nodeName) {
		console.error('no nodeName given to a componentView : returning...', def);
		return;
	}
	else if (!(parentView instanceof ComponentView) && def.nodeName !== 'app-root') {
		console.warn('no parentView given to a componentView : nodeName is', def.nodeName, '& type is', def.type);
	}
		
	this.API = this.currentViewAPI = new DOMViewAPI(def);
	this.section = def.section;
	
	if (!nodesRegistry.getItem(this._defUID))
		nodesRegistry.setItem(this._defUID, (new CachedTypes.CachedNode(def.nodeName, def.isCustomElem)));
	
	if (!Registries.caches.attributes.getItem(this._defUID))
		Registries.caches.attributes.setItem(this._defUID, def.attributes);
		
	viewsRegistry.push(this);

	if (def !== definition) {
		this._parent = parent;
		this.targetSubView = null;
//		if (def.sOverride) {
//			
//		}
		this.styleHook = new SWrapperInViewManipulator(this);
		
//		if (definition.getHostDef() && definition.getHostDef().type === 'Fieldset')
//			console.log(definition);
		this.subViewsHolder;
		if ((definition.subSections.length && definition.subSections[0] !== null) || definition.members.length) {
			this.subViewsHolder = new ComponentSubViewsHolder(definition, this);
			// this shall be retried after calling the hooks, as the interfaces may have added subViews
			this.getTargetSubView(def);
		}
		else
			this.subViewsHolder = new ComponentSubViewsHolder(null, this);
	}
	
	var hadParentView = this.parentView = parentView instanceof ComponentView ? parentView : null;
	if (this.parentView && !isChildOfRoot) {
		this.parentView = this.getEffectiveParentView();
//		console.log('hadParentView', parentView, this.parentView);
	}
		
	if (hadParentView && !this.parentView)
		console.warn('Lost parentView => probable section number missing in definition obj :', def.nodeName);
}
ComponentView.prototype = {};
ComponentView.prototype.objectType = 'ComponentView';
ComponentView.prototype.constructor = ComponentView;

/**
 * Main helper to access the effective implementation of the View
 */
ComponentView.prototype.callCurrentViewAPI = function(methodName, ...args) {
	return this.currentViewAPI[methodName](...args);
}

/**
 * @abstract
 * HELPER : => when appending a child, should we append to rootNode or to a subSection ?
 * 
 */
ComponentView.prototype.getEffectiveParentView = function() {
	return (this.parentView.subViewsHolder && this.parentView.subViewsHolder.subViews.length) 
					? this.parentView.subViewsHolder.subViews[this.section]
					: this.parentView;
}

ComponentView.prototype.getTargetSubView = function(def) {
	this.targetSubView = (def.targetSlotIndex !== null && this.subViewsHolder.memberViews.length > def.targetSlotIndex)
		? this.subViewsHolder.memberAt(def.targetSlotIndex)
		: null;	
}

/**
 * 
 * TODO: remove the this alias after having checked the historical code
 * (this method has become "getWrappingNode")
 */
ComponentView.prototype.getRoot = function() {
	return this.getWrappingNode();
}

/**
 * Shorthand method on the currentViewAPI
 */
ComponentView.prototype.getMasterNode = function() {
	return this.callCurrentViewAPI('getMasterNode');
}

/**
 * Shorthand method on the currentViewAPI
 */
ComponentView.prototype.getWrappingNode = function() {
	return this.callCurrentViewAPI('getWrappingNode');
}

/**
 * These shorthands methods are only useful when we explicitly need
 * to update the -stylesheet- associated with a (shadowed, obviously) web-component
 */
ComponentView.prototype.hide = function() {
	if (this.view.styleHook.s)
		this.styleHook.s.updateRule({visibility : 'hidden'}, ':host')
	else
		this.currentViewAPI.hide();
}
ComponentView.prototype.show = function() {
	if (this.view.styleHook.s)
		this.styleHook.s.updateRule({visibility : 'visible'}, ':host')
	else
		this.currentViewAPI.show();
}


/**
 * @param {boolean | innerEvent} boolOrEvent
 * might be direclty passed an event obj (a "framework event-type")
 */
ComponentView.prototype.setPresence = function(boolOrEvent) {
	var bool;
	if (typeof boolOrEvent === 'object' && typeof boolOrEvent.data !== 'undefined')
		bool = boolOrEvent.data;
	else
		bool = boolOrEvent;
	this.callCurrentViewAPI('setPresence', bool);
}

/**
 * @param {string} eventName
 * @param {function} handler
 * 
 * TODO: remove the addEventListener alias after having checked the historical code
 */
ComponentView.prototype.addEventListenerOnNode = ComponentView.prototype.addEventListener = function(eventName, handler) {
	this.callCurrentViewAPI('addEventListener', eventName, handler);
}

/**
 * 
 */
ComponentView.prototype.getTextContent = function() {
	return this.callCurrentViewAPI('getTextContent');
}

/**
 * @abstract
 * 
 * @needsGlobalRefactoring
 */
Object.defineProperty(ComponentView.prototype, 'value', { 		// ComponentWithReactiveText.prototype.populateSelf makes good use of that
	get : function() {
		return this.callCurrentViewAPI('getContentNoFail');
	},
	set : function(value) {
		this.callCurrentViewAPI('setContentNoFail', value);
	}
});

/**
 * 
 */
ComponentView.prototype.setTextContent = function(text) {
	this.callCurrentViewAPI('setTextContent', text);
}

/**
 * 
 */
ComponentView.prototype.setContentNoFail = function(text) {
	this.callCurrentViewAPI('setContentNoFail', text);
}

/**
 * 
 */
ComponentView.prototype.setNodeContent = function(contentAsString) {
	this.callCurrentViewAPI('setNodeContent', contentAsString);
}

/**
 * 
 * 
 * @needsGlobalRefactoring (becomes appendAsTextNode)
 */
ComponentView.prototype.appendText = function(textContent) {
	this.appendAsTextNode(textContent);
}

/**
 * 
 */
ComponentView.prototype.appendAsTextNode = function(textContent) {
	this.callCurrentViewAPI('appendTextNode', textContent);
}

/**
 * @param {Component} childView
 * @param {number} atIndex
 * 
 * @needsGlobalRefactoring
 */
ComponentView.prototype.addChildAt = function(childView, atIndex) {
	this.subViewsHolder.addMemberView(childView);
	childView.parentView = this;
	this.addChildNodeFromViewAt(childView, atIndex);
}

/**
 * @param {Component} childView
 * @param {number} atIndex
 */
ComponentView.prototype.addChildNodeFromViewAt = function(childView, atIndex) {
	if (!childView.getMasterNode())		// check presence of masterNode, as we may be adding a childComponent before the view has been rendered
		return;
	this.callCurrentViewAPI('addChildNodeAt', childView.getMasterNode(), atIndex);
}

/**
 * @abstract
 */
ComponentView.prototype.empty = function() {
	return this.callCurrentViewAPI('empty');
}

/**
 * @abstract
 */
ComponentView.prototype.emptyTargetSubView = function() {
	return this.targetSubView.empty();
}

ComponentView.prototype.setContentFromArray = function(contentAsArray) {
	this.callCurrentViewAPI('empty');
	this.callCurrentViewAPI('setContentFromArray', contentAsArray);
}

/**
 * @param {array[string]} contentAsArray
 */
ComponentView.prototype.setContentFromArrayOnTargetSubview = function(contentAsArray) {
//	console.log(this._parent.objectType);
	return this.targetSubView.setContentFromArray(contentAsArray);
}











/**
 * @constructor ComponentSubView
 */
var ComponentSubView = function(definition, parentView) {
	ComponentView.call(this, definition, parentView);
	
	this.objectType = 'ComponentSubView';
	
}
ComponentSubView.prototype = Object.create(ComponentView.prototype);
ComponentSubView.prototype.objectType = 'ComponentSubView';
ComponentSubView.prototype.constructor = ComponentSubView;








/**
 * @constructor ComponentSubViewsHolder
 */
var ComponentSubViewsHolder = function(definition, parentView) {

	this.parentView = parentView || null;
	this.subViews = [];
	this.memberViews = [];
	
	// subViewsHolder exists even if there is no subViews (and we pass a definition as null if there is neither memberViews nor subViews)
	if (definition)
		this.instanciateSubViews(definition);
}
ComponentSubViewsHolder.prototype = {};
ComponentSubViewsHolder.prototype.objectType = 'ComponentSubViewsHolder';
ComponentSubViewsHolder.prototype.constructor = ComponentSubViewsHolder;

ComponentSubViewsHolder.prototype.instanciateSubViews = function(definition) {
	definition.subSections.forEach(function(def) {
		this.subViews.push((new ComponentSubView(def, this.parentView)));
	}, this);
	definition.members.forEach(function(def) {
		if(typeof def.section === 'undefined') {
			if (typeof def.host !== 'undefined')
				console.warn('A component\'s definition contains "members" which seem to be Components (they have a "host" property), but have no "type" property (so they\'re being instanciated as views, and it failed). If you menat to define a view, you must define a template without hierarchy (the nodeName & section properties must be defined at the first level). nodeName is ' + def.host.nodeName + ' & defUID is ' + def.host.UID);
			else
				console.warn('A member view\'s definition doesn\'t contain a "section" prop at first level, you may have defined it wrongly. You must define a template without hierarchy (the nodeName & section properties must be defined at the first level). nodeName is ' + def.nodeName + ' & defUID is ' + def.UID);
		}
		this.memberViews.push((new ComponentSubView(def, def.section !== null ? this.subViews[def.section] : this.parentView)));
	}, this);
}

ComponentSubViewsHolder.prototype.firstMember = function() {
	return this.memberViews[0];
}

ComponentSubViewsHolder.prototype.lastMember = function() {
	return this.memberViews[this.memberViews.length - 1];
}

ComponentSubViewsHolder.prototype.memberAt = function(idx) {
	return this.memberViews[idx];
}

ComponentSubViewsHolder.prototype.immediateAddMemberAt = function(idx, memberView) {
	var backToTheFutureAmount = this.memberViews.length - idx;
	Registries.viewsRegistry.splice(Registries.viewsRegistry.length - backToTheFutureAmount, 0, memberView);
	this.memberViews.splice(idx, 1, memberView);
}

// Should not be used: 
// We need the mecanism defined in ComponentView 
// to define the correct parentView
ComponentSubViewsHolder.prototype.addMemberView = function(view) {
	this.memberViews.push(view);
}

ComponentSubViewsHolder.prototype.addMemberViewFromDef = function(definition) {
	var view = new ComponentSubView(definition, this.parentView);
	this.memberViews.push(view);
	return view;
}

ComponentSubViewsHolder.prototype.moveMemberViewFromTo = function(from, to, viewsRegistryIdx, offset) {
	this.memberViews.splice(to, 0, this.memberViews.splice(from, 1)[0]);
	if (offset && typeof viewsRegistryIdx === 'number')
		this.immediateAscendViewAFewStepsHelper(offset, viewsRegistryIdx);
}

ComponentSubViewsHolder.prototype.moveLastMemberViewTo = function(to, offset, viewsRegistryIdx) {
	var from = this.memberViews.length - 1
	if (offset && viewsRegistryIdx)
		this.moveMemberViewFromTo(from, to, offset, viewsRegistryIdx);
}

ComponentSubViewsHolder.prototype.immediateUnshiftMemberView = function(definition) {
	var lastView = Registries.viewsRegistry.pop();
	var view = new ComponentSubView(definition, this.parentView);
	this.memberViews.unshift(view);
	
	Registries.viewsRegistry.push(lastView);
	return view;
}

ComponentSubViewsHolder.prototype.immediateAscendViewAFewStepsHelper = function(stepsCount, effectiveViewIdx) {
	var ourLatelyAppendedView = Registries.viewsRegistry.splice(effectiveViewIdx, 1)[0];
//	console.log(Registries.viewsRegistry.length, stepsCount, Registries.viewsRegistry[Registries.viewsRegistry.length - 1 - stepsCount]);
	Registries.viewsRegistry.splice(effectiveViewIdx - stepsCount, 0, ourLatelyAppendedView);
}

ComponentSubViewsHolder.prototype.resetMemberContent = function(idx, textContent) {
	this.memberViews[idx].reset();
}

ComponentSubViewsHolder.prototype.setMemberContent = function(idx, textContent) {
	this.memberViews[idx].setContentNoFail(textContent);
}

ComponentSubViewsHolder.prototype.setMemberContent_Fast = function(idx, textContent) {
	this.memberViews[idx].setTextContent(textContent);
}

ComponentSubViewsHolder.prototype.appendContentToMember = function(idx, textContent) {
	this.memberViews[idx].appendAsTextNode(textContent);
}

ComponentSubViewsHolder.prototype.appendAsMemberContent = function(idx, textContent) {
	this.memberViews[idx].empty();
	this.memberViews[idx].appendAsTextNode(textContent);
}

ComponentSubViewsHolder.prototype.setEachMemberContent = function(contentAsArray) {
	contentAsArray.forEach(function(val, key) {
		if (typeof val !== 'string')
			return;
		this.setMemberContent(key, val);
	}, this);
}

ComponentSubViewsHolder.prototype.setEachMemberContent_Fast = function(contentAsArray) {
	contentAsArray.forEach(function(val, key) {
		if (typeof val !== 'string')
			return;
		this.setMemberContent_Fast(key, val);
	}, this);
}
















var DOMCanvasAccessor = function(definition, view) {
	DOMViewAPI.call(this, definition);
	this.objectType = 'DOMCanvasAccessor';
//	console.log(definition.members);
	this.view = view;
	this.ctx;
	
//	var found = false;
//	definition.members.forEach(function(member, idx) {
//		if (!found && ((member.getHostDef() && member.getHostDef().nodeName === 'canvas') || member.nodeName === 'canvas')) {
//			this.canvasLocation = view.subViewsHolder.memberAt(idx);
//			found = true;
//		}
//	}, this);
}
DOMCanvasAccessor.prototype = Object.create(DOMViewAPI.prototype);
DOMCanvasAccessor.prototype.objectType = 'DOMCanvasAccessor';

DOMCanvasAccessor.prototype.setMasterNode = function(node) {
	var self = this, canvas;
	DOMViewAPI.prototype.setMasterNode.call(this, node);
	
	this.view.nodeAsAPromise.then(function(boundingBox) {
//		console.log(boundingBox);
		canvas = self.view.subViewsHolder.memberAt(0).getMasterNode();
		canvas.width = boundingBox.w;
		canvas.height = boundingBox.h;
		self.ctx = canvas.getContext('2d');	
		return boundingBox;
	});
}

DOMCanvasAccessor.prototype.setFillColor = function(color) {
	var self = this;
//	this.view.nodeAsAPromise.then(function() {
		self.ctx.fillStyle = color;
//	});
}

DOMCanvasAccessor.prototype.drawPoint = function(x, y) {
	var self = this;
//	this.view.nodeAsAPromise.then(function() {
		self.ctx.fillRect(x, y, 1, 1);
//	});
}


























var CanvasView = function(definition, parentView) {
	ComponentView.call(this, definition, parentView);
	
	this.objectType = 'CanvasView';
	this.currentViewAPI = new DOMCanvasAccessor(definition, this);
	
	this.w = 0;
	this.h = 0;
	this.nodeAsAPromise;
}

CanvasView.prototype = Object.create(ComponentView.prototype);
CanvasView.prototype.objectType = 'CanvasView';

CanvasView.prototype.getDimensions = function() {
	var self = this;
	this.nodeAsAPromise = new Promise(function(resolve, reject) {
		var inter = setInterval(function() {
			if (self.subViewsHolder.memberAt(0).getMasterNode()) {
				clearInterval(inter);				
				appConstants.resizeObserver.observe(self.subViewsHolder.memberAt(0).getMasterNode(), self.storeDimensions.bind(self, resolve));
			}
		}, 512);
	});
	return this.nodeAsAPromise;
}

CanvasView.prototype.storeDimensions = function(resolve, e) {

	this.w = e.data.boundingBox.w;
	this.h = e.data.boundingBox.h;
	resolve(e.data.boundingBox);
	appConstants.resizeObserver.unobserve(this.subViewsHolder.memberAt(0).getMasterNode());
}

CanvasView.prototype.gradientFill = function(colorScale) {
	var length = colorScale.max();
	this.callCurrentViewAPI('gradientFill', colorScale[0], colorScale[length], 0, 0, this.w, this.h);
}

CanvasView.prototype.partialGradientFill = function(boundaries, colorScale) {
	var length = colorScale.max();
	this.callCurrentViewAPI('gradientFill', colorScale[0], colorScale[length], boundaries.x, boundaries.y, boundaries.w, boundaries.h);
}

CanvasView.prototype.manualGradientFill = function(colorScale, boundaries) {
	var self = this;
	var length = 1; //colorScale.max();
	
	
	this.nodeAsAPromise.then(function(boundingBox) {
//		console.log(boundingBox);
		if (typeof boundaries === 'undefined') {
			boundaries = {
				w : boundingBox ? boundingBox.w : self.w,
				h  : boundingBox ? boundingBox.h : self.h,
				x : 0,
				y : 0
			};
		}
//		console.log(boundingBox);
//		console.log('canvas promise');
		for (let x = boundaries.x, l = boundaries.w + boundaries.x; x < l; x++) {
			for (let y = boundaries.y, L = boundaries.h + boundaries.y; y < L; y++) {
				self.callCurrentViewAPI('setFillColor', colorScale((x - boundaries.x) * length / boundaries.w).hex());
				self.callCurrentViewAPI('drawPoint', x, y);	
			}
		}
	});
}
















/**
 * A static definition of some DOM attributes :
 * 		reminded here as useful for storing a component's "persistent state" (although it's only "persisted" through the Stream interface)
 * 		used by the visibleStateComponent to map glyphs on states
 */
var commonStates = {
		hidden : false,
		disabled : false,
		checked : false,
		focused : false,
		selected : false,
		highlighted : false,
		blurred : false,
		valid : false,
		recent : false, 	// boolean otherwise handled by specific mecanism (component should be referenced in a list, etc.)
		branchintree : '',	// replaces CSS classes : enum ('root', 'branch', 'leaf')
		leafintree : '',
		nodeintree : false,
		expanded : false,
		sortable : false,
		sortedasc : false,
		sorteddesc :false,
		position : 0,		// position as a state : degrees, 'min', 'man', nbr of pixels from start, etc. 
		size : 0,			// size as a state : length, height, radius
		tabIndex : 0,
		'delete' : false,		// isn't a -persistent- state (cause it removes the node, hm) but deserves a glyph
		shallreceivefile : true,
		handlesvideo : true
}













module.exports = {
	Pair : Pair,
	ListOfPairs : ListOfPairs,
	DimensionsPair : DimensionsPair,
	EventEmitter : EventEmitter,
	Command : Command,
	Worker : WorkerInterface,
	Stream : Stream,
	LazyResettableColdStream : LazyResettableColdStream,
	NumberedStream : NumberedStream,
	StreamPool : StreamPool,
	SavableStore : SavableStore,
	ComponentView : ComponentView,
	ComponentSubView : ComponentSubView,
	ComponentSubViewsHolder : ComponentSubViewsHolder,
	CanvasView : CanvasView,
	commonStates : commonStates
}