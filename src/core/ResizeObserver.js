/**
 * @constructor NodeResizeObserver
 * 
 */

var CoreTypes = require('src/core/CoreTypes');
var MasterTimer = require('src/timers/MasterTimer');


	
var NodeResizeObserver = function() {
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'NodeResizeObserver';
		
	this.resizeObserver;
	if (ResizeObserver)
		this.resizeObserver = new ResizeObserver(this.getSize.bind(this));
}

NodeResizeObserver.prototype = Object.create(CoreTypes.EventEmitter.prototype);
NodeResizeObserver.prototype.objectType = 'NodeResizeObserver';

NodeResizeObserver.prototype.observe = function(node, cb) {
	if (!this.resizeObserver)
		return;
	this.createEvent(node.id);
	this.addEventListener(node.id, cb);
	this.resizeObserver.observe(node);
}

NodeResizeObserver.prototype.unobserve = function(node) {
	if (!this.resizeObserver)
		return;
	this.deleteEvent(node.id);
	this.clearEventListeners(node.id);
	this.resizeObserver.unobserve(node);
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
	

module.exports = NodeResizeObserver;