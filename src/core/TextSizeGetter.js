/**
 * @constructor TextSizeGetter
 * 
*/

var TypeManager = require('src/core/TypeManager');
var NodeResizeObserver = require('src/core/ResizeObserver');
//var appConstants = require('src/appLauncher/appLauncher');


var TextSizeGetter = function() {
	
	if (typeof document === 'undefined' || typeof document.ownerDocument === 'undefined')
		return;
		
	// width calculation
	this.initCb;
	this.textWidthCanvas = document.createElement("canvas");
	this.textWidthCanvasCtx = this.textWidthCanvas.getContext('2d');
	this.fontStyle = '';
	this.lineHeight = 0;

	this.objectType = 'TextSizeGetter';
	this.resizeObserver = new NodeResizeObserver();
}
TextSizeGetter.prototype = {};
TextSizeGetter.prototype.objectType = 'TextSizeGetter';

TextSizeGetter.prototype.init = function(sampleNode, cb) {
	this.sampleNode = sampleNode;
	this.initCb = cb;
	this.resizeObserver.observe(sampleNode, this.initWidthCompute.bind(this));
}

TextSizeGetter.prototype.oneShot = function(sampleNode, cb) {
	sampleNode.id = sampleNode.id + '-asStyleSource-' + TypeManager.UIDGenerator.newUID();
	this.resizeObserver.observe(sampleNode, this.onOneShot.bind(this, sampleNode, cb));
}

TextSizeGetter.prototype.onOneShot = function(sampleNode, cb) {
	var style = window.getComputedStyle(sampleNode);
	sampleNode.id = sampleNode.id.replace(/-asStyleSource-\d+/, '');
	if (!sampleNode.id)
		sampleNode.removeAttribute('id');
	if (cb)
		cb(style);
}

TextSizeGetter.prototype.initWidthCompute = function(e) {
	var self = this;

	var style = window.getComputedStyle(this.sampleNode);
	this.fontStyle = style.fontSize + ' ' + style.fontFamily;
	
	this.lineHeight = Number(style.lineHeight.slice(0, -2));
	
	this.textWidthCanvasCtx.font = this.fontStyle;
	
	if (e.data.boundingBox.h > 0) {
		if (this.initCb)
			this.initCb(this.fontStyle);
		this.resizeObserver.unobserve(this.sampleNode);
		this.initCb = undefined;
	} 
}

TextSizeGetter.prototype.getTextWidth = function(string) {
	if (typeof string === 'undefined')
		return;
    return this.textWidthCanvasCtx.measureText(string).width;
}

module.exports = TextSizeGetter;