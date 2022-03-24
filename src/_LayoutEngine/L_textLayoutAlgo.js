/**
 * 
 * constructor TextLayoutAlgo
 *  
 */


//var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');

var TextSizeGetter = require('src/core/TextSizeGetter');
var textSizeGetter = new TextSizeGetter();

//var FontPath = require('src/integrated_libs_&_forks/fontpath_src');

/*
 * 
 */
var TextLayoutAlgo = function(layoutNode, textContent) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'TextLayoutAlgo';
	this.algoName = 'inline';
//	console.log(textContent);
	
	this.setSelfDimensions(this.layoutNode.dimensions, textContent);
	this.setParentDimensions(this.layoutNode.dimensions);
}

TextLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
TextLayoutAlgo.prototype.objectType = 'TextLayoutAlgo';

TextLayoutAlgo.prototype.getOffsets = function() {
	
}

TextLayoutAlgo.prototype.getDimensions = function() {
	
}

TextLayoutAlgo.prototype.setSelfDimensions = function(dimensions, textContent) {
//	console.log(textContent);
//	console.log(this.layoutNode.nodeName, this.layoutNode.dimensions);
	dimensions.set(this.getSelfDimensions(textContent));
//	console.log(dimensions);
}

TextLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
//	this.layoutNode._parent.dimensions.inline += dimensions.inline;
	this.updateParentDimensions(dimensions);
//	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions);
//	console.log(dimensions.block);
}

TextLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {
	// TODO: optimize : this could be achieved with the instanceof keyword
	if (['BlockLayoutAlgo', 'FlexLayoutAlgo'].indexOf(this.layoutNode._parent.layoutAlgo.objectType) === -1
			&& this.layoutNode._parent.dimensions.inline < dimensions.inline) {
		this.layoutNode._parent.dimensions.inline += dimensions.inline;
//		console.log('TextLayoutAlgo', 'update parent dimensions', this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.block);
	}
	if (this.layoutNode._parent.dimensions.block < dimensions.block) {
		this.layoutNode._parent.dimensions.block += dimensions.block;
//		console.log('update parent dimensions', this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.block);
	}
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions);
}

TextLayoutAlgo.prototype.getSelfDimensions = function(textContent) {
//	console.log(textContent);
	if (!textContent.length)
		return [0, 0];
	var textSize = textSizeGetter.getTextSizeDependingOnStyle(
			textContent,
			this.getFontStyle()
		);
//	console.log('lineHeight', this.layoutNode.computedStyle.bufferedValueToNumber('lineHeight'));
	return [textSize[0], this.layoutNode.computedStyle.bufferedValueToNumber('lineHeight')];
}

// TODO: get rid of the magic string here
TextLayoutAlgo.prototype.getFontStyle = function() {
	// Should be 13px, as accounted by the browser,
	// but effective size in canvas differs from effective size in the browser.
	// As we're only interested by the size in the canvas,
	// let's assume the fontSize needs to be augmented by 1 px
	return '14px roboto';
//	var fontSize = this.layoutNode.computedStyle.bufferedValueToNumber('fontSize');
//	return String(fontSize.value)
//		+ fontSize.unit
//		+ ' '
//		+ this.layoutNode.computedStyle.bufferedValueToNumber('fontFamily').match(/^\w/)
}



















module.exports = TextLayoutAlgo;