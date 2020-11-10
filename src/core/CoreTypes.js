var UIDGenerator = require('src/core/UIDGenerator');
var PropertyCache = require('src/core/PropertyCache');
var CachedTypes = require('src/core/CachedTypes');



/**
 * @factory UIDGenerator
 * 
 */

var Generator = function() {
	this.nextUID = 0;
}

Generator.prototype.newUID = function() {
	return this.nextUID++;
}
var idGenerator = new Generator();



/**
 * @typedCache {CachedNode} {ID : {nodeName : nodeName, cloneMother : DOMNode -but not yet-}}
 */
var nodesRegister = new PropertyCache('nodesRegister');

/**
 * @typedStore {StoredView} {ID : view}
 */
var viewsRegister = new PropertyCache('viewsRegister');





console.log(nodesRegister);
console.log(viewsRegister);











/**
 * @constructor EventEmitter
 */
var EventEmitter = function() {
	this.objectType = 'EventEmitter';
	this._eventHandlers = {};
	this._one_eventHandlers = {};
	this._identified_eventHandlers = {};
}
EventEmitter.prototype = {};
EventEmitter.prototype.objectType = 'EventEmitter';

/**
 * Creates a listenable event : generic event creation (onready, etc.)
 * 
 * @param {string} eventType
 */
EventEmitter.prototype.createEvent = function(eventType) {
	this._eventHandlers[eventType] = [];
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
	CoreModule.call(this);

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

var Stream = function(name, value, reflectedObj, transform, lazy) {

	this.forward = true;
	this.name = name;
	this.lazy = typeof lazy !== 'undefined' ? lazy : false;
	this.reflectedObj = reflectedObj;
	this.transform = transform || undefined;
	this.inverseTransform;
	this.subscriptions = [];
	
	this._value;
	this.value = typeof reflectedObj === 'object' ? reflectedObj[name] : value;
	this.dirty;
}
Stream.prototype.objectType = 'Stream';
Object.defineProperty(Stream.prototype, 'value', {
	get : function() {
		if (this.lazy) {
			if (typeof this.transform === 'function')
				this._value = this.transform(this.get());
			this.dirty = false;
		}
		
		return this.get();
	},
	
	set : function(value) {
		this.setAndUpdateConditional(value);
		this.set(value);
	}
});

Stream.prototype.get = function() {
	return this._value;
}

Stream.prototype.set = function(value) {
	if (this.forward && this.reflectedObj) {
		this.forward = false;
		this.reflectedObj[this.name] = value;
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
				this._value = this.transform(value);
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
	if (typeof this.transform === 'function')
		this._value = this.transform(this._value);
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
	this._value = reflectedHost[prop];
	
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
		
		if (typeof reflectedHost.trigger === 'function')
			this.subscribe(reflectedHost.trigger.bind(reflectedHost, event));
		
		return this.subscribe(reflectedHost.streams[prop].set, null, inverseTransform);
	}
	return this._value;
}

/**
 * subscribe method  :
 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter & map)
 */ 
Stream.prototype.subscribe = function(handlerOrHost, prop, inverseTransform) {
	if (!handlerOrHost || (typeof handlerOrHost !== 'function' && typeof handlerOrHost !== 'object')) {
		console.warn('Bad observable handlerOrHost assigned : handler type is ' + typeof handler + ' instead of "function or getter/setter"', 'StreamName ' + this.name);
		return;
	}
	else
		return this.addSubscription(handlerOrHost, prop, inverseTransform).subscribe();
}

/**
 * filter method (syntactic sugar) :
 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (map) and the effective subscribtion
 */ 
Stream.prototype.filter = function(filterFunc) {
	return this.addSubscription().filter(filterFunc);
}

/**
 * map method (syntactic sugar) :
 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter) and the effective subscribtion
 */ 
Stream.prototype.map = function(mapFunc) {
	return this.addSubscription().map(mapFunc);
}

Stream.prototype.addSubscription = function(handlerOrHost, prop, inverseTransform) {
	this.subscriptions.push(new Subscription(handlerOrHost, prop, this, inverseTransform));
	return this.subscriptions[this.subscriptions.length - 1];
}

Stream.prototype.unsubscribe = function(handler) {
	if (typeof handler !== 'function') {
		console.warn('Bad observableHandler given for removal : handler type is ' + typeof handler + ' instead of "function or object"', 'StreamName ' + this.name);
		return;
	}
	for(var i = this.subscriptions.length - 1; i > 0; i--) {
		if (this.subscriptions[i] === handler || this.subscriptions[i].host === handler) {
			(function(j) {this.subscriptions.splice(j, 1);})(i);
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
			prop : typeof subscriberProp === 'string' ? subscriberProp : null,
			obj : typeof subscriberObjOrHandler === 'object' ? subscriberObjOrHandler : null,
			cb : typeof subscriberObjOrHandler === 'function' ? subscriberObjOrHandler : function() {return this._stream._value},
			inverseTransform : inverseTransform || function(value) {return value;},
			_subscription : this,
			_stream : parent
	}
	
	this._stream = parent;
	this._firstPass = true;
}

Subscription.prototype.subscribe = function(subscriberObjOrHandler, subscriberProp, inverseTransform) {
	if (typeof subscriberObjOrHandler !== 'function' && typeof subscriberObjOrHandler !== 'object' && !this.subscriber.obj && !this.subscriber.cb) {
		console.warn('Bad observableHandler given : handler type is ' + typeof subscriberObjOrHandler + ' instead of "function or object"', 'StreamName ' + this._parent.name);
		return;
	}
	if (typeof subscriberObjOrHandler === 'object')
		this.subscriber.obj = subscriberObjOrHandler;
	else if (typeof subscriberObjOrHandler === 'function')
		this.subscriber.cb = subscriberObjOrHandler;
	
	if (typeof subscriberProp === 'string')
		this.subscriber.prop = subscriberProp;
	
	return this;
}

Subscription.prototype.filter = function(filterFunc) {
	if (typeof filterFunc !== 'function')
		return this;

	// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark shows a slight improvement, as timings are identical although there is an overhaed with defineProperty)
	var f = new Function('value', 'return (' + filterFunc.toString() + ').call(this.subscriber, value) === true ? true : false;');
	Object.defineProperty(this, 'filter', {
		value : f,
		enumerable : true
	});
	
	return this;
}

Subscription.prototype.map = function(mapFunc) {
	if(typeof mapFunc !== 'function')
		return this;

	// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark shows a slight improvement, as timings are identical although there is an overhaed with defineProperty)
	var f = new Function('value', 'return (' + mapFunc.toString() + ').call(this.subscriber, value);');
	Object.defineProperty(this, 'map', {
		value : f,
		enumerable : true
	});
	
	return this;
}

Subscription.prototype.reverse = function(inverseTransform) {
	if(typeof inverseTransform !== 'function')
		return this;

	// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark needed)
	this.subscriber.inverseTransform = new Function('return (' + inverseTransform.toString() + ').apply(null, arguments);');
	
	return this;
}

Object.defineProperty(Subscription.prototype, 'execute', {
	value : function(value) {
//		console.log('value', value);
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
			
//			console.log('subscriber', this.subscriber);
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
 * @constructor ComponentView
 */
var ComponentView = function(definition, parentView) {
//	console.log(definition);
	if (definition.getHostDef()) {
		
		this.nodeName = definition.getHostDef().nodeName;
		this.section = definition.getHostDef().section;
		
		this.childrenShallHaveOffset = this.shallChildrenHaveOffset(definition);
		
		this.subViewsHolder;
		if (definition.getHostDef().type !== 'ComposedComponent' && (definition.subSections.length || definition.members.length))
			this.subViewsHolder = new ComponentSubViewsHolder(definition, this);
		
		if (!nodesRegister.getItem(definition.getHostDef().UID))
			nodesRegister.setItem(definition.getHostDef().UID, (new CachedTypes.CachedNode(definition.getHostDef().nodeName)));

		viewsRegister.setItem(idGenerator.newUID(), this);
	}
	
	this.parentView = parentView || null;
	if (parentView)
		this.parentView = this.getEffectiveParentNode();
	
	this.hostElem;
	this.rootElem;
}
ComponentView.prototype = {};
ComponentView.prototype.objectType = 'ComponentView';
ComponentView.prototype.constructor = ComponentView;

/**
 * @abstract
 * HELPER : => when appending a child, should we append to rootNode or to a subSection ?
 * 
 */
ComponentView.prototype.getEffectiveParentNode = function() {
	return this.parentView.childrenShallHaveOffset === true
			? this.parentView.subViewsHolder.subViews[this.section + 1]
				: (this.parentView.childrenShallHaveOffset === 1
						? this.parentView.subViewsHolder.subViews[1]
							: this.parentView.hostElem);
}
/**
 * @abstract
 * HELPER : => when appending a child, should we append to rootNode or to a subSection ?
 * 
 */
ComponentView.prototype.shallChildrenHaveOffset = function(definition) {
	if (definition.getHostDef().sWrapper) {
		if (definition.subSections.length)
			return 0;
		else
			return 1;
	}
	else if (definition.subSections.length)
		return 0;
	return false;
}






/**
 * @constructor ComponentView
 */
var ComponentSubView = function(definition, parentView) {
	this.nodeName = definition.nodeName;
	this.section = definition.section;
	
	if (!nodesRegister.getItem(definition.UID))
		nodesRegister.setItem(definition.UID, (new CachedTypes.CachedNode(definition.nodeName)));
	
	this.parentView = parentView || null;
	if (parentView)
		this.parentView = this.getEffectiveParentNode();
	
	this.hostElem;
	this.rootElem;
	
	viewsRegister.setItem(idGenerator.newUID(), this);
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
		this.memberViews.push((new ComponentSubView(def, this.parentView)));
	}, this);
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
		roleInTree : '',	// replaces CSS classes : enum ('root', 'branch', 'leaf') 
		position : 0,		// position as a state : degrees, 'min', 'man', nbr of pixels from start, etc. 
		size : 0,			// size as a state : length, height, radius
		tabIndex : 0,
		'delete' : false		// isn't a -persistent- state (cause it removes the node, hm) but deserves a glyph
}













module.exports = {
		idGenerator : idGenerator, 
		viewsRegister : viewsRegister,
		EventEmitter : EventEmitter,
		Command : Command,
		Worker : WorkerInterface,
		Stream : Stream,
		ComponentView, ComponentView,
		commonStates : commonStates
}