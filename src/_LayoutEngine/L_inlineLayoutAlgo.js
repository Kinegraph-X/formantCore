/**
 * 
 * constructor InlineLayoutAlgo
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
var InlineLayoutAlgo = function(layoutNode, textContent) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'InlineLayoutAlgo';
	this.algoName = 'inline';
	
	this.setSelfDimensions(this.layoutNode.dimensions, textContent);
	this.setParentDimensions(this.layoutNode.dimensions);
}

InlineLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
InlineLayoutAlgo.prototype.objectType = 'InlineLayoutAlgo';

InlineLayoutAlgo.prototype.setOffsets = function() {
	
}

InlineLayoutAlgo.prototype.getDimensions = function() {
	return [0, 0];
}

InlineLayoutAlgo.prototype.setSelfDimensions = function(dimensions, textContent) {
//	console.log(this.layoutNode.nodeName, this.layoutNode.dimensions);
	dimensions.set(this.getDimensions(textContent));
//	console.log(dimensions);
}

InlineLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
//	this.layoutNode._parent.dimensions.block += dimensions.block;
	this.updateParentDimensions(dimensions);
//	console.log(dimensions.block);
}

InlineLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {
	// TODO: optimize : this could be achieved with the instanceof keyword
	if (['BlockLayoutAlgo', 'FlexLayoutAlgo'].indexOf(this.layoutNode._parent.layoutAlgo.objectType) === -1
			&& this.layoutNode._parent.dimensions.inline < dimensions.inline) {
		this.layoutNode._parent.dimensions.inline += dimensions.inline;
//		console.log('InlineLayoutAlgo', 'update parent dimensions', this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.block);
	}
	if (this.layoutNode._parent.dimensions.block < dimensions.block) {
		this.layoutNode._parent.dimensions.block += dimensions.block;
//		console.log('update parent dimensions', this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.block);
	}
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions);
}





















module.exports = InlineLayoutAlgo;