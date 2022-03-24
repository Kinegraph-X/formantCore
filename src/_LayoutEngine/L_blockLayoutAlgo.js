/**
 * 
 * constructor BlockLayoutAlgo
 *  
 */


//var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var BlockLayoutAlgo = function(layoutNode) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'BlockLayoutAlgo';
	this.algoName = 'block';
	
	this.resetInlineAvailableSpaceOffset();
	this.resetBlockAvailableSpaceOffset();
	this.setSelfDimensions(this.layoutNode.dimensions);
//	this.setOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);

}

BlockLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
BlockLayoutAlgo.prototype.objectType = 'BlockLayoutAlgo';

BlockLayoutAlgo.prototype.setAvailableSpace = function(dimensions) {
		this.availableSpace.inline = dimensions.inline;
		this.availableSpace.block = dimensions.block;
	
//	console.log(this.availableSpace);
}

BlockLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {
	this.availableSpace.inline -= amountToSubstract;
}

BlockLayoutAlgo.prototype.decrementBlockAvailableSpace = function(amountToSubstract) {
	this.availableSpace.block -= amountToSubstract;
}

BlockLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {
	this.availableSpace.inline -= amountToSubstract;
}

BlockLayoutAlgo.prototype.resetInlineAvailableSpaceOffset = function() {
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart');
}

BlockLayoutAlgo.prototype.resetBlockAvailableSpaceOffset = function() {
	this.availableSpace.blockOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart');
}

BlockLayoutAlgo.prototype.setOffsets = function() {
	
}

BlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	
	dimensions.inline = this.getInlineDimension();
	var explicitWidth = this.getBlockDimension();
	dimensions.block = explicitWidth;
	this.setAvailableSpace(dimensions);
//	console.log(dimensions, this.availableSpace);
	
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing', 'repr') === 'content-box') {
		if (explicitWidth)
			dimensions.add([summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([0, summedBlockPaddings]);
		// Here inlineAvailableSpace is the same as the original size
		
		
	}
	else {
		this.decrementInlineAvailableSpace(summedInlinePaddings);
	}
	
//	console.log('summedInlinePaddings', summedInlinePaddings);
//	console.log('this.availableSpace', this.availableSpace);
//	console.log(dimensions);
}

BlockLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
	this.layoutNode._parent.layoutAlgo.setAvailableSpace(dimensions);
	this.updateParentDimensions(dimensions);
//	console.log(dimensions.block);
}

BlockLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {
	
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	// TODO: maybe optimize : this could be achieved with the instanceof keyword => benchmark
	if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			&& this.layoutNode.computedStyle.bufferedValueToString('flexDirection') === 'row') {
//			console.log('BlockLayoutAlgo', 'flex parent found');
//			console.log('BlockLayoutAlgo', 'flex parent found', this.layoutNode._parent.dimensions.block);
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
			this.layoutNode._parent.dimensions.inline += dimensions.inline + summedInlineMargins;
		}
		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
			this.layoutNode._parent.dimensions.block = dimensions.block + summedBlockMargins;
//			console.log('BlockLayoutAlgo', 'flex parent blockMargin', summedBlockMargins);
		}
//			console.log('BlockLayoutAlgo', 'flex parent found: row', this.layoutNode._parent.dimensions.block);
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			|| this.layoutNode._parent.layoutAlgo.algoName === 'block') {
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
			this.layoutNode._parent.dimensions.inline = dimensions.inline + summedInlineMargins;
		}
		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
//			console.log('BlockLayoutAlgo', 'flex OR block parent found', dimensions.block, summedBlockMargins, this.layoutNode._parent.dimensions.block);
			this.layoutNode._parent.dimensions.block += dimensions.block + summedBlockMargins;
		}
//		console.log('BlockLayoutAlgo', 'flex OR block parent found', this.layoutNode._parent.dimensions.block);
	}
	else {
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline) {
			this.layoutNode._parent.dimensions.inline += dimensions.inline;
		}
		if (this.layoutNode._parent.dimensions.block < dimensions.block) {
			this.layoutNode._parent.dimensions.block = dimensions.block;
		}
	}
	
//	console.log('may update parent dimensions',  this.layoutNode._parent.dimensions.block, this.layoutNode.dimensions.block + inlineMargins);
//	console.log('update parent dimensions', this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.block);

	this.layoutNode._parent.layoutAlgo.updateParentDimensions(dimensions);
}

BlockLayoutAlgo.prototype.getInlineDimension = function() {
	return this.layoutNode._parent.dimensions.inline;
}

BlockLayoutAlgo.prototype.getBlockDimension = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('height');
}

BlockLayoutAlgo.prototype.getMargins = function() {
	
}

BlockLayoutAlgo.prototype.getInlineMargins = function() {
	
}

BlockLayoutAlgo.prototype.getSummedInlineMargins = function() {
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('marginLeft'));
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineEnd');
}

BlockLayoutAlgo.prototype.getBlockMargins = function() {
	
}

BlockLayoutAlgo.prototype.getSummedBlockMargins = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockEnd');
}

BlockLayoutAlgo.prototype.getPaddings = function() {
	
}

BlockLayoutAlgo.prototype.getSummedInlinePaddings = function() {
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart'), this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineEnd'));
	return this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineEnd');
}

BlockLayoutAlgo.prototype.getSummedBlockPaddings = function() {
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart'), this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockEnd'));
	return this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockEnd');
}

















module.exports = BlockLayoutAlgo;