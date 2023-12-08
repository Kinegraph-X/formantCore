/**
 * 
 * constructor FlexLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseIntermediateLayoutAlgo = require('src/_LayoutEngine/L_baseIntermediateLayoutAlgo');



/*
 * 
 */
var FlexLayoutAlgo = function(layoutNode) {
	BaseIntermediateLayoutAlgo.call(this, layoutNode);
	this.objectType = 'FlexLayoutAlgo';
	this.algoName = 'flex';
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
//	console.log(this.layoutNode.nodeName, this.isIndirectFlexChild, this.flexCtx._UID, TypeManager.layoutCallbacksRegistry.getItem(this.flexCtx._UID));
	
//	this.localDebugLog('FlexLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	this.flexDirection = this.layoutNode.computedStyle.bufferedValueToString('flexDirection');
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline)
		console.warn('Layout forbidden structure: Found a block-flow element inside an inline-flow element.')
		
	this.setParentDimensions = this.setGenericParentDimensions;
	
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
			maxBlockSize = Math.max(currentNode.layoutAlgo.dimensions.getOuterBlock(), maxBlockSize);
			currentNode = currentNode.previousSibling;
		}
		// This is a new Block Formatting Context (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
		this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + maxBlockSize);
		this.parentLayoutAlgo.resetInlineAvailableSpace();
	}
		
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'flex layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

FlexLayoutAlgo.prototype = Object.create(BaseIntermediateLayoutAlgo.prototype);
FlexLayoutAlgo.prototype.objectType = 'FlexLayoutAlgo';

FlexLayoutAlgo.prototype.executeLayout = function() {
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.resetInlineAvailableSpace();
	
	this.setSelfDimensions();
	this.setAvailableSpace();
	
	this.resetInlineAvailableSpaceOffset();
	this.resetBlockAvailableSpaceOffset();
	
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions();
}

FlexLayoutAlgo.prototype.setSelfOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
	this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
}

FlexLayoutAlgo.prototype.setSelfDimensions = function() {
	if (this.hasExplicitWidth)
		this.dimensions.setFromInline(this.getInlineDimension());
	else
		this.dimensions.setFromOuterInline(this.parentLayoutAlgo.availableSpace.getInline());
	
	this.dimensions.setFromBlock(!this.hasExplicitHeight ? 0 : this.getBlockDimension());
//	console.error('SET SELF DIMENSIONS', this.layoutNode.nodeName, this.layoutNode._UID, this.layoutNode._parent.nodeName, this.layoutNode._parent._UID, this.parentLayoutAlgo.dimensions.getBorderInline(), this.parentLayoutAlgo.availableSpace.getFlexEndInlineOffset());
}

FlexLayoutAlgo.prototype.setGenericParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(),
			this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(),
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

FlexLayoutAlgo.prototype.updateBlockParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(),
			this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
//	console.log(
//		this.layoutNode.nodeName,
//		this.parentLayoutAlgo.availableSpace.getLastBlockOffset(),
//		this.dimensions.getOuterBlock(),
//		this.cs.getParentPaddingBlockEnd(),
//		this.cs.getParentBorderBlockEndWidth(),
//		this.parentDimensions.getBlock()
//	);
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

FlexLayoutAlgo.prototype.updateFlexParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(),
			this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

FlexLayoutAlgo.prototype.updateInlineBlockParentDimensions = function() {
	
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(),
			this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
//	console.log(this.layoutNode.nodeName, this.layoutNode._UID, this.parentLayoutAlgo.availableSpace.getLastInlineOffset(), this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}























module.exports = FlexLayoutAlgo;