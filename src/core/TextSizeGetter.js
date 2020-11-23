/**
 * @constructor TextSizeGetter
 * 
*/

//var TypeManager = require('src/core/TypeManager');
var NodeResizeObserver = require('src/core/ResizeObserver');
//var appConstants = require('src/appLauncher/appLauncher');


var TextSizeGetter = function(def, parentDOMNodeDOMId, automakeable, childrenToAdd, targetSlot) {
	// width calculation
	this.textWidthCanvas = document.createElement("canvas");
	this.textWidthCanvasCtx = this.textWidthCanvas.getContext('2d');
	this.fontStyle = '';

	this.objectType = 'TextSizeGetter';
	this.resizeObserver = new NodeResizeObserver();
}
TextSizeGetter.prototype = {};
TextSizeGetter.prototype.objectType = 'TextSizeGetter';

TextSizeGetter.prototype.init = function(sampleNode) {
	this.sampleNode = sampleNode;
	this.resizeObserver.observe(sampleNode, this.initWidthCompute.bind(this));
}

TextSizeGetter.prototype.initWidthCompute = function(boundingBox) {
	var self = this;

	var style = window.getComputedStyle(this.sampleNode);
	this.fontStyle = style.fontSize + ' ' + style.fontFamily;
	this.textWidthCanvasCtx.font = this.fontStyle;
	
	if (boundingBox.h > 0)
		this.resizeObserver.unobserve(this.sampleNode); 
}

TextSizeGetter.prototype.getTextWidth = function(string) {
	if (typeof string === 'undefined')
		return;
    return this.textWidthCanvasCtx.measureText(string).width;
}

module.exports = TextSizeGetter;