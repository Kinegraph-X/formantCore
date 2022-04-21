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
	this.localDebugLog('BlockLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)
		this.updateParentDimensions = this.updateFlexParentDimensions;
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
		this.updateParentDimensions = this.updateBlockParentDimensions;
	
	// Here, we must traverse all the previous inline siblings to get the max block size
	if (this.layoutNode.previousSibling && this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
		var maxBlockSize = 0, currentNode = this.layoutNode.previousSibling;
		while(currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
			maxBlockSize = Math.max(currentNode.dimensions.outerBlock, maxBlockSize);
			currentNode = currentNode.previousSibling;
		}
		// This is a new Block Formatting Context (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
		this.layoutNode._parent.availableSpace.lastOffset = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += maxBlockSize;
		this.layoutNode._parent.layoutAlgo.resetInlineAvailableSpaceOffset();
	}
	
//	console.log(this.layoutNode.availableSpace);
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setAvailableSpace(this.layoutNode.dimensions);
	console.log(this.layoutNode.availableSpace);
	
	this.setSelfOffsets();
	this.setParentDimensions(this.layoutNode.dimensions);
	
	
	
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

BlockLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
BlockLayoutAlgo.prototype.objectType = 'BlockLayoutAlgo';

BlockLayoutAlgo.prototype.setSelfOffsets = function(dimensions) {
	this.layoutNode.offsets.inline =  this.layoutNode._parent.offsets.marginInline + this.layoutNode._parent.availableSpace.inlineOffset;
	this.layoutNode.offsets.block =  this.layoutNode._parent.offsets.marginBlock + this.layoutNode._parent.availableSpace.blockOffset;
	this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart');
	this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart');
	this.layoutNode.updateCanvasShapeOffsets();
}

BlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	var explicitWidth = this.getInlineDimension();
	dimensions.inline = explicitWidth === null
		? (this.layoutNode._parent && (this.layoutNode._parent.availableSpace.inline - summedInlineBorders))
			|| dimensions.inline
		: explicitWidth;
		
//	console.log(this.layoutNode.nodeName, dimensions.inline);
	dimensions.block = this.getBlockDimension();
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing') === 'content-box') {
		if (explicitWidth)
			dimensions.add([summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
	}
	dimensions.setBorderSize([dimensions.inline, dimensions.block]);
	dimensions.addToBorderSize([summedInlineBorders, summedBlockBorders]);
	dimensions.setOuterSize([dimensions.borderInline, dimensions.borderBlock]);
	dimensions.addToOuterSize([summedInlineMargins, summedBlockMargins]);
	
	
	

	
//	console.log(this.layoutNode.nodeName, dimensions);
	this.layoutNode.updateCanvasShapeDimensions();
}

BlockLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEnd');
		this.layoutNode._parent.dimensions.block = parentBlockDimensions;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

BlockLayoutAlgo.prototype.updateBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();

	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockStartWidth');
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

BlockLayoutAlgo.prototype.updateFlexParentDimensions = function(outerDimensions) {
	
}

BlockLayoutAlgo.prototype.setParentDimensions_off = function(dimensions) {
	this.layoutNode._parent.layoutAlgo.setAvailableSpace(dimensions);
	this.updateParentDimensions(dimensions);
}

BlockLayoutAlgo.prototype.getInlineDimension = function() {
	return (!this.layoutNode.computedStyle.getIsInitialValueAsBool('width') && this.layoutNode.computedStyle.bufferedValueToNumber('width')) || null;
}

BlockLayoutAlgo.prototype.getBlockDimension = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('height');
}























module.exports = BlockLayoutAlgo;