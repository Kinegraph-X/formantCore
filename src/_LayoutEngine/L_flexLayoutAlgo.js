/**
 * 
 * constructor FlexLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var FlexLayoutAlgo = function(layoutNode, layoutDimensionsBuffer) {
	BaseLayoutAlgo.call(this, layoutNode, layoutDimensionsBuffer);
	this.objectType = 'FlexLayoutAlgo';
	this.algoName = 'flex';
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	
	this.localDebugLog('FlexLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	this.flexDirection = this.layoutNode.computedStyle.bufferedValueToString('flexDirection');
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline)
		console.warn('Layout forbidden structure: Found a block-flow element inside an inline-flow element.')
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)
		this.updateParentDimensions = this.updateFlexParentDimensions;
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
		this.updateParentDimensions = this.updateBlockParentDimensions;
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
		this.updateParentDimensions = this.updateInlineBlockParentDimensions;
	
	// NEW FORMATTING CONTEXT
	// Here, we must traverse all the previous inline siblings to get the max block size
	if (this.layoutNode.previousSibling && this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
		var maxBlockSize = 0, currentNode = this.layoutNode.previousSibling;
		while(currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
			maxBlockSize = Math.max(currentNode.dimensions.outerBlock, maxBlockSize);
			currentNode = currentNode.previousSibling;
		}
		// This is a new Block Formatting Context (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
		this.layoutNode._parent.availableSpace.blockOffset += maxBlockSize;
		this.layoutNode._parent.layoutAlgo.resetAvailableSpace(this.layoutNode._parent.dimensions);
	}
	
	this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
	
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setAvailableSpace(this.layoutNode.dimensions);
	
	this.resetInlineAvailableSpaceOffset();
	this.resetBlockAvailableSpaceOffset();
	
	this.setSelfOffsets();
	this.setParentDimensions(this.layoutNode.dimensions);
	
	if (this.isIndirectFlexChild) {
		// CAUTION: Here is flexCtx._parent._UID assigned: only case where is indirect flexChild but is flexContext-host
		var layoutCallbackRegisryItem = TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._parent._UID);
		layoutCallbackRegisryItem.subLevels.push(this.layoutNode);
	}
	
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

FlexLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
FlexLayoutAlgo.prototype.objectType = 'FlexLayoutAlgo';

FlexLayoutAlgo.prototype.resetAvailableSpace = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	this.availableSpace.inline = dimensions.inline - summedInlinePaddings;
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth');
}

FlexLayoutAlgo.prototype.setSelfOffsets = function(dimensions) {
	this.layoutNode.offsets.inline =  this.layoutNode._parent.offsets.marginInline + this.layoutNode._parent.availableSpace.inlineOffset + this.getInlineOffsetforAutoMargins();
	this.layoutNode.offsets.block =  this.layoutNode._parent.offsets.marginBlock + this.layoutNode._parent.availableSpace.blockOffset + this.getBlockOffsetforAutoMargins();
	this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.cs.getMarginInlineStart();
	this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.cs.getMarginBlockStart();
//	this.layoutNode._parent.layoutAlgo.resetAvailableSpace(this.layoutNode._parent.dimensions);
	
//	this.layoutNode.updateCanvasShapeOffsets();
}

FlexLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var DHL = 0;
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	this.localDebugLog(this.DHLstr(DHL), 'flex set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_pre', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'flex set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.flex_pre', this.layoutNode.dimensions.block);
	
	dimensions.inline = !this.hasExplicitWidth
		? this.layoutNode._parent.availableSpace.inline > summedInlineBorders + summedInlineMargins ? this.layoutNode._parent.availableSpace.inline - summedInlineBorders - summedInlineMargins : 0
		: this.getInlineDimension();
	dimensions.block = !this.hasExplicitHeight ? 0 : this.getBlockDimension();
	
	if (this.cs.getBoxSizing() === this.boxModelValuesAsConstants.contentBox) {
		// TODO: implement that rightly
		if (!this.hasExplicitWidth) {
			if (this.hasExplicitHeight)
				dimensions.add([0, 0, 0, 0, 0, 0]);
			else
				dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
		}
		else if (!this.hasExplicitHeight) {
			if (this.hasExplicitWidth)
				dimensions.add([0, 0, 0, 0, 0, 0]);
			else
				dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
		}
	}
	else if (!this.hasExplicitWidth) {
		if (this.hasExplicitHeight)
			dimensions.add([0, 0, 0, 0, 0, 0]);
		else
			dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
	}
	else if (!this.hasExplicitHeight) {
		if (this.hasExplicitWidth)
			dimensions.add([0, 0, 0, 0, 0, 0]);
		else
			dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
	}
	
	dimensions.setBorderSize([dimensions.inline, dimensions.block]);
	dimensions.addToBorderSize([summedInlineBorders, summedBlockBorders]);
	dimensions.setOuterSize([dimensions.borderInline, dimensions.borderBlock]);
	dimensions.addToOuterSize([summedInlineMargins, summedBlockMargins]);
	
//	console.log(this.layoutNode.nodeName, dimensions);
	
	if (this.hasExplicitWidth)
		this.layoutNode._parent.layoutAlgo.decrementInlineAvailableSpace(this.layoutNode.dimensions.outerInline);
	
	this.localDebugLog(this.DHLstr(DHL), 'flex set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'flex set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
	
//	this.layoutNode.updateCanvasShapeDimensions();
}

FlexLayoutAlgo.prototype.updateParentAvailableSpace = function(dimensions) {
	
}

FlexLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'flex increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'flex increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'flex increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'flex increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
//	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

FlexLayoutAlgo.prototype.updateBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'flex update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions -  summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
//	console.log(this.layoutNode._parent.dimensions.block);
	this.localDebugLog(this.DHLstr(DHL), 'flex update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

FlexLayoutAlgo.prototype.updateFlexParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'flex update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions -  summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'flex update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
//	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

FlexLayoutAlgo.prototype.updateInlineBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'flex update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentInlineBorders = this.cs.getParentSummedInlineBorders();
	var summedParentInlineMargins = this.cs.getParentSummedInlineMargins();
	
//	console.log(this.layoutNode.nodeName, 'updateInlineBlockParentDimensions', this.layoutNode._parent.availableSpace.lastOffset.inline, dimensions.outerInline);
//	console.log(this.layoutNode.nodeName, this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.inline);
	
	var parentInlineDimensions = this.layoutNode._parent.availableSpace.lastOffset.inline + dimensions.outerInline + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth();
//	console.log(this.layoutNode.nodeName, this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.inline, parentInlineDimensions);
	if (this.layoutNode._parent.dimensions.inline < parentInlineDimensions) {
		this.layoutNode._parent.dimensions.inline = parentInlineDimensions - summedParentInlineBorders;
		this.layoutNode._parent.dimensions.borderInline = parentInlineDimensions;
		this.layoutNode._parent.dimensions.outerInline = parentInlineDimensions + summedParentInlineMargins;
		this.layoutNode._parent.availableSpace.inline = 0;
		this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode._parent.availableSpace.lastOffset.inline + dimensions.outerInline;
	}
	
//	console.log(this.layoutNode.nodeName, 'updateInlineBlockParentDimensions', this.layoutNode._parent.availableSpace.lastOffset.inline, dimensions.outerInline);
//	console.log(this.layoutNode.nodeName, this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.inline);
	
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions -  summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
//	console.log(this.layoutNode._parent.dimensions.block);
	this.localDebugLog(this.DHLstr(DHL), 'flex update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

//FlexLayoutAlgo.prototype.getInlineDimension = function() {
//	return (!this.layoutNode.computedStyle.getIsInitialValueAsBool('width') && this.layoutNode.computedStyle.bufferedValueToNumber('width')) || null;
//}
//
//FlexLayoutAlgo.prototype.getBlockDimension = function() {
//	return this.layoutNode.computedStyle.bufferedValueToNumber('height');
//}























module.exports = FlexLayoutAlgo;