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
	
	this.setRefsToParents(layoutNode);
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
		this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + maxBlockSize);
		this.parentLayoutAlgo.resetInlineAvailableSpace();
	}
	
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
		
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

FlexLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
FlexLayoutAlgo.prototype.objectType = 'FlexLayoutAlgo';

FlexLayoutAlgo.prototype.executeLayout = function() {
	this.setSelfDimensions();
	this.setAvailableSpace();
	
	this.resetInlineAvailableSpaceOffset();
	this.resetBlockAvailableSpaceOffset();
	
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions();
}

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
	if (this.hasExplicitWidth)
		this.dimensions.setFromInline(this.getInlineDimension());
	else
		this.dimensions.setFromOuterInline(this.parentLayoutAlgo.availableSpace.getInline());
	
	this.dimensions.setFromBlock(!this.hasExplicitHeight ? 0 : this.getBlockDimension());
}

FlexLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
	this.parentDimensions.setFromBorderInline(
		this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
	this.parentDimensions.setFromBorderBlock(
		this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
	);
	
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

FlexLayoutAlgo.prototype.updateBlockParentDimensions = function(dimensions, DHL) {
	this.parentDimensions.setFromBorderInline(
		this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
	this.parentDimensions.setFromBorderBlock(
		this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
	);
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

FlexLayoutAlgo.prototype.updateFlexParentDimensions = function(dimensions, DHL) {
	this.parentDimensions.setFromBorderInline(
		this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
	this.parentDimensions.setFromBorderBlock(
		this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
	);
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

FlexLayoutAlgo.prototype.updateInlineBlockParentDimensions = function(dimensions, DHL) {
	this.parentDimensions.setFromBorderInline(
		this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
	this.parentDimensions.setFromBorderBlock(
		this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
	);
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}























module.exports = FlexLayoutAlgo;