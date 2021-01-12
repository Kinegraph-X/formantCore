/**
 * @constructor NodeResizeObserver
 * 
 */

var TypeManager = require('src/core/TypeManager');
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
// complete proto follows at end of page
// REPLACES CoreTypes = require('src/core/CoreTypes');












	
var NodeResizeObserver = function() {
	EventEmitter.call(this);
	this.objectType = 'NodeResizeObserver';
		
	this.resizeObserver;
	if (ResizeObserver)
		this.resizeObserver = new ResizeObserver(this.getSize.bind(this));
}

NodeResizeObserver.prototype = Object.create(EventEmitter.prototype);
NodeResizeObserver.prototype.objectType = 'NodeResizeObserver';

NodeResizeObserver.prototype.observe = function(node, cb) {
	if (!this.resizeObserver)
		return;

	if (!node.id || this._eventHandlers[node.id]) {
		node.id = node.id + '-asStyleSource-' + TypeManager.UIDGenerator.newUID();
//		console.warn('resizeObserver: ambiguous observed node : ' + node.id + '. Please give it a unique DOM id to disambiguate the event callback.' + (!node.id ? '  Given node is: ' : ''), (!node.id ? node : ''));
//		return;
	}
	this.createEvent(node.id);
	this.addEventListener(node.id, cb);
	this.resizeObserver.observe(node, {box : 'border-box'});
}

NodeResizeObserver.prototype.unobserve = function(node) {
	if (!this.resizeObserver)
		return;
		
	this.deleteEvent(node.id);
	this.clearEventListeners(node.id);
	this.resizeObserver.unobserve(node);
	
	node.id = node.id.replace(/-asStyleSource-\d+/, '');
	if (!node.id)
		node.removeAttribute('id');
}

NodeResizeObserver.prototype.getSize = function(observerEntries) {
	var boundingBox = {};
	observerEntries.forEach(function(entry) {
		if (!this.hasStdEvent(entry.target.id))
			return;
		if(entry.contentBoxSize) {
			// Checking for chrome as using a non-standard array
			if (entry.contentBoxSize[0]) {
				boundingBox.h = entry.contentBoxSize[0].blockSize; 
				boundingBox.w = entry.contentBoxSize[0].inlineSize;
			} else {
				boundingBox.h = entry.contentBoxSize.blockSize; 
				boundingBox.w = entry.contentBoxSize.inlineSize;
			}          
		} else {
			boundingBox.h = entry.contentRect.height; 
			boundingBox.w = entry.contentRect.width;
		}
		
		this.trigger(entry.target.id, {boundingBox : boundingBox});
		
	}, this);
}

















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
	if (!this._eventHandlers[eventType] && this._one_eventHandlers[eventType] && this._identified_eventHandlers[eventType])
		return;
	
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

























	

module.exports = NodeResizeObserver;