/**
 * 
 * constructor FlexLayoutAlgo
 *  
 */


//var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var FlexLayoutAlgo = function(layoutNode) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'FlexLayoutAlgo';
	this.algoName = 'flex';
	
	this.flexDirection = this.layoutNode.computedStyle.bufferedValueToString('flexDirection', 'repr');
	
	this.resetInlineAvailableSpaceOffset();
	this.resetBlockAvailableSpaceOffset();
	this.setSelfDimensions(this.layoutNode.dimensions);
//	this.setOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);

}

FlexLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
FlexLayoutAlgo.prototype.objectType = 'FlexLayoutAlgo';

FlexLayoutAlgo.prototype.setAvailableSpace = function(dimensions) {
		this.availableSpace.inline = dimensions.inline;
		this.availableSpace.block = dimensions.block;
	
//	console.log(this.availableSpace);
}

FlexLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {
	this.availableSpace.inline -= amountToSubstract;
}

FlexLayoutAlgo.prototype.decrementBlockAvailableSpace = function(amountToSubstract) {
	this.availableSpace.block -= amountToSubstract;
}

FlexLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {
	this.availableSpace.inline -= amountToSubstract;
}

FlexLayoutAlgo.prototype.resetInlineAvailableSpaceOffset = function() {
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart');
}

FlexLayoutAlgo.prototype.resetBlockAvailableSpaceOffset = function() {
	this.availableSpace.blockOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart');
}

FlexLayoutAlgo.prototype.setOffsets = function() {
	
}

FlexLayoutAlgo.prototype.getDimensions = function() {
	
}

FlexLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	
	dimensions.inline = this.getInlineDimension();
	var explicitHeight = this.getBlockDimension();
	dimensions.block = explicitHeight;
	this.setAvailableSpace(dimensions);
//	console.log(dimensions, this.availableSpace);
	
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing', 'repr') === 'content-box') {
		if (explicitHeight)
			dimensions.add([summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([0, summedBlockPaddings]);
		// Here inlineAvailableSpace is the same as the already computed available size
		
		
	}
	else {
		this.decrementInlineAvailableSpace(summedInlinePaddings);
		
	}
		
//	console.log('this.availableSpace', this.availableSpace);
//	console.log(dimensions);
}

FlexLayoutAlgo.prototype.updateParentAvailableSpace = function(dimensions) {
	
}

FlexLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
	this.layoutNode._parent.layoutAlgo.setAvailableSpace(dimensions);
	this.updateParentDimensions(dimensions);
//	console.log(dimensions.block);
}

FlexLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {
	
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	// TODO: maybe optimize : this could be achieved with the instanceof keyword => benchmark
	if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			&& this.layoutNode.computedStyle.bufferedValueToString('flexDirection') === 'row') {
//			console.log('InlineBlockLayoutAlgo', 'flex parent found');
//			console.log('InlineBlockLayoutAlgo', 'flex parent found', this.layoutNode._parent.dimensions.block);
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
			this.layoutNode._parent.dimensions.inline += dimensions.inline + summedInlineMargins;
		}
		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
			this.layoutNode._parent.dimensions.block = dimensions.block + summedBlockMargins;
//			console.log('InlineBlockLayoutAlgo', 'flex parent blockMargin', summedBlockMargins);
		}
//		console.log('FlexLayoutAlgo', 'flex parent found: row', this.layoutNode._parent.dimensions.block);
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			|| this.layoutNode._parent.layoutAlgo.algoName === 'block') {
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
			this.layoutNode._parent.dimensions.inline = dimensions.inline + summedInlineMargins;
		}
//		console.log('FlexLayoutAlgo', 'flex OR block parent found', dimensions.block, this.layoutNode._parent.dimensions.block);
		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
			this.layoutNode._parent.dimensions.block += dimensions.block + summedBlockMargins;
		}
//		console.log('FlexLayoutAlgo', 'flex OR block parent found', this.layoutNode._parent.dimensions.block);
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

FlexLayoutAlgo.prototype.getInlineDimension = function() {
//	console.log(this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.inline);
	return this.layoutNode._parent.dimensions.inline;
}

FlexLayoutAlgo.prototype.getBlockDimension = function() {
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('height'));
	// Explicit first, implicit then
	return this.layoutNode.computedStyle.bufferedValueToNumber('height');
}

FlexLayoutAlgo.prototype.getMargins = function() {
	
}

FlexLayoutAlgo.prototype.getInlineMargins = function() {
	
}

FlexLayoutAlgo.prototype.getSummedInlineMargins = function() {
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('marginLeft'));
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineEnd');
}

FlexLayoutAlgo.prototype.getBlockMargins = function() {
	
}

FlexLayoutAlgo.prototype.getSummedBlockMargins = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockEnd');
}

FlexLayoutAlgo.prototype.getPaddings = function() {
	
}

FlexLayoutAlgo.prototype.getSummedInlinePaddings = function() {
		return this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineEnd');
}

FlexLayoutAlgo.prototype.getSummedBlockPaddings = function() {
		return this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockEnd');
}



















module.exports = FlexLayoutAlgo;