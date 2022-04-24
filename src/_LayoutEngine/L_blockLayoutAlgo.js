/**
 * 
 * constructor BlockLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var BlockLayoutAlgo = function(layoutNode) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'BlockLayoutAlgo';
	this.algoName = 'block';
	
	if (this.layoutNode._parent.layoutAlgo.isFlexChild || this.layoutNode._parent.layoutAlgo.isIndirectFlexChild)
		this.isIndirectFlexChild = true;
	
	this.localDebugLog('BlockLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline)
		console.warn('Layout forbidden structure: Found a block-flow element inside an inline-flow element.')

	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		this.setParentDimensions = this.setBlockParentDimensions;
		this.updateParentDimensions = this.updateInlineBlockParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.setParentDimensions = this.setBlockParentDimensions;
		this.updateParentDimensions = this.updateBlockParentDimensions;
	}
	
//	console.log(this.layoutNode._parent.layoutAlgo.algoName, this.layoutAlgosAsConstants.inlineBlock);
//	console.log('this.layoutNode._parent.availableSpace', this.layoutNode._parent.availableSpace);
	this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
	
	// NEW FORMATTING CONTEXT
	// Here, we must traverse all the previous inline siblings to get the max block size
	if (this.layoutNode.previousSibling && this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
		var maxBlockSize = 0, currentNode = this.layoutNode.previousSibling;
		while(currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
			maxBlockSize = Math.max(currentNode.dimensions.outerBlock, maxBlockSize);
			currentNode = currentNode.previousSibling;
		}
		// This is a new Block Formatting Context (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
//		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += maxBlockSize;
		this.layoutNode._parent.layoutAlgo.resetAvailableSpace(this.layoutNode._parent.dimensions);
	}
	
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setAvailableSpace(this.layoutNode.dimensions);
	
//	console.log('this.layoutNode._parent.availableSpace', this.layoutNode._parent.availableSpace);
	
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);
	
	if (this.isIndirectFlexChild)
		TypeManager.layoutCallbackRegistry.setItem(this.layoutNode._UID, this.layoutNode);
	
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

BlockLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
BlockLayoutAlgo.prototype.objectType = 'BlockLayoutAlgo';

BlockLayoutAlgo.prototype.resetAvailableSpace = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	this.availableSpace.inline = dimensions.inline - summedInlinePaddings;
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth');
}

BlockLayoutAlgo.prototype.setSelfOffsets = function(dimensions) {
	this.layoutNode.offsets.inline =  this.layoutNode._parent.offsets.marginInline + this.layoutNode._parent.availableSpace.inlineOffset + this.getInlineOffsetforAutoMargins();
	this.layoutNode.offsets.block =  this.layoutNode._parent.offsets.marginBlock + this.layoutNode._parent.availableSpace.blockOffset + this.getBlockOffsetforAutoMargins();
	this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart');
	this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart');
	this.layoutNode._parent.layoutAlgo.resetAvailableSpace(this.layoutNode._parent.dimensions);
	
	this.layoutNode.updateCanvasShapeOffsets();
}

BlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var DHL = 0;
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	this.localDebugLog(this.DHLstr(DHL), 'block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_pre', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_pre', this.layoutNode.dimensions.block);
	
	dimensions.inline = !this.hasExplicitWidth
		? this.layoutNode._parent.availableSpace.inline - summedInlineBorders - summedInlineMargins
		: this.getInlineDimension();
	dimensions.block = !this.hasExplicitHeight ? 0 : this.getBlockDimension();
	
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing') === 'content-box') {
		if (this.hasExplicitWidth)
			dimensions.add([summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
	}
	dimensions.setBorderSize([dimensions.inline, dimensions.block]);
	dimensions.addToBorderSize([summedInlineBorders, summedBlockBorders]);
	dimensions.setOuterSize([dimensions.borderInline, dimensions.borderBlock]);
	dimensions.addToOuterSize([summedInlineMargins, summedBlockMargins]);
	
	if (this.hasExplicitWidth)
		this.layoutNode._parent.layoutAlgo.decrementInlineAvailableSpace(this.layoutNode.dimensions.outerInline);
	
	this.localDebugLog(this.DHLstr(DHL), 'block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
	
	this.layoutNode.updateCanvasShapeDimensions();
}

BlockLayoutAlgo.prototype.setBlockParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentInlineBorders = this.layoutNode._parent.layoutAlgo.getSummedInlineBorders();
	var summedParentInlineMargins = this.layoutNode._parent.layoutAlgo.getSummedInlineMargins();
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	// case of a zero-inline-sized inlineBlock parent of parent, of parent...
	if (this.layoutNode._parent.dimensions.inline < dimensions.outerInline) {
//		console.log('block increment parent : inline size', this.layoutNode._parent.dimensions.inline, dimensions.outerInline);
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.inlineOffset + dimensions.outerInline + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderInlineEndWidth');
		this.layoutNode._parent.dimensions.inline = parentBlockDimensions + summedParentInlineBorders;
		this.layoutNode._parent.dimensions.borderInline = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerInline = parentBlockDimensions + summedParentInlineMargins;
		this.layoutNode._parent.availableSpace.inline = 0;
	}
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins
		this.layoutNode._parent.availableSpace.block = 0;
	}
	
	this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
	this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

BlockLayoutAlgo.prototype.setFlexRowParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
//	console.log('setFlexRowParentDimensions');
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	this.layoutNode._parent.layoutAlgo.resetInlineAvailableSpaceOffset();
	this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;

	if (this.layoutNode._parent.dimensions.block < dimensions.outerBlock) {
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

BlockLayoutAlgo.prototype.updateBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	if (this.layoutNode._parent.dimensions.inline < dimensions.outerInline) {
		this.layoutNode._parent.dimensions.inline += dimensions.inline;
		this.layoutNode._parent.dimensions.borderInline += dimensions.borderInline;
		this.layoutNode._parent.dimensions.outerInline += dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inline = 0;
	}
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions -  summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

BlockLayoutAlgo.prototype.updateFlexParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions -  summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

BlockLayoutAlgo.prototype.updateInlineBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	if (this.layoutNode._parent.dimensions.inline < dimensions.outerInline) {
		this.layoutNode._parent.dimensions.inline += dimensions.inline;
		this.layoutNode._parent.dimensions.borderInline += dimensions.borderInline;
		this.layoutNode._parent.dimensions.outerInline += dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inline = 0;
	}
	
//	if (this.layoutNode._parent._parent.computedStyle.bufferedValueToString('flexDirection') === this.flexDirectionsAsConstants.row)
		this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
//	else if (this.layoutNode._parent._parent.computedStyle.bufferedValueToNumber('flexDirection') === this.flexDirectionsAsConstants.column)
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions -  summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
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