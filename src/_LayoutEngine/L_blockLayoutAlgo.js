/**
 * 
 * constructor BlockLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
var BaseIntermediateLayoutAlgo = require('src/_LayoutEngine/L_baseIntermediateLayoutAlgo');



/*
 * 
 */
var BlockLayoutAlgo = function(layoutNode) {
	BaseIntermediateLayoutAlgo.call(this, layoutNode);
	this.objectType = 'BlockLayoutAlgo';
	this.algoName = 'block';
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	
//	this.localDebugLog('BlockLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline)
		console.warn('Layout forbidden structure:', this.layoutNode._parent.nodeName, '>', this.layoutNode.nodeName, 'Found a block-flow element inside an inline-flow element.')

	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		this.setParentDimensions = this.setBlockParentDimensions;
		this.updateParentDimensions = this.updateInlineBlockParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.setParentDimensions = this.setBlockParentDimensions;
		this.updateParentDimensions = this.updateBlockParentDimensions;
	}
	
//	console.log(this.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getInline());
	
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

BlockLayoutAlgo.prototype = Object.create(BaseIntermediateLayoutAlgo.prototype);
BlockLayoutAlgo.prototype.objectType = 'BlockLayoutAlgo';

BlockLayoutAlgo.prototype.executeLayout = function() {
//	console.log(this.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getInline());
	// NEW FORMATTING CONTEXT
	// Here, we must traverse all the previous inline siblings to get the max block size
	if (this.layoutNode.previousSibling && this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
		var maxBlockSize = 0, currentNode = this.layoutNode.previousSibling;
		while(currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
			maxBlockSize = Math.max(currentNode.layoutAlgo.dimensions.getOuterBlock(), maxBlockSize);
			currentNode = currentNode.previousSibling;
		}
		// This is a new Block Formatting Context (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
		this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + maxBlockSize);
	}
	
//	console.log(this.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getInline());
	this.parentLayoutAlgo.resetInlineAvailableSpace();
	
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	
//	console.log('blockLayoutAlgo execute Layout', this.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getBlockOffset())
	this.setSelfDimensions();
	this.setAvailableSpace();
	this.setSelfOffsets();
	this.setParentDimensions();
}

BlockLayoutAlgo.prototype.setSelfOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
	this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
}

BlockLayoutAlgo.prototype.setSelfDimensions = function() {
	if (this.hasExplicitWidth) {
		this.dimensions.setFromInline(this.getInlineDimension());
		//  Before getOffsetsForAutorMargins()
		this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.availableSpace.getInline() - this.dimensions.getOuterInline());
	}
	else {
		this.dimensions.setFromOuterInline(
//			Math.max(
//				this.dimensions.getOuterInline(),
				this.parentLayoutAlgo.availableSpace.getInline()
//			)
		);
		this.parentLayoutAlgo.availableSpace.setInline(0);
//		console.log(this.layoutNode.nodeName,
//					this.layoutNode._parent.nodeName,
//					this.parentLayoutAlgo.availableSpace.getInline(),
//					this.dimensions.getOuterInline());
	}
	
	if (this.hasExplicitHeight) {
		this.dimensions.setFromBlock(this.getBlockDimension());
		this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.availableSpace.getBlock() - this.dimensions.getOuterBlock());
	}
	else {
		this.dimensions.setFromBlock(0);
		this.parentLayoutAlgo.availableSpace.setBlock(0);
	}
}

BlockLayoutAlgo.prototype.setBlockParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(),
			this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
//	console.log(this.layoutNode.nodeName, this.dimensions.getOuterBlock());
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(),
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
//	if (this.layoutNode.nodeName === 'li')
//		console.log('li setBlockParentDimensions', this.parentLayoutAlgo.layoutNode.nodeName, this.parentDimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
//	if (this.isLastChild) {
//		console.log('blockLayoutAlgo updateBlockParentDimensions', this.layoutNode.nodeName, this.layoutNode.textContent);
//		this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'handleEffectiveAlignItems');
//	 }
	
	this.parentLayoutAlgo.updateParentDimensions();
}

BlockLayoutAlgo.prototype.updateBlockParentDimensions = function() {
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
//	console.log(this.parentLayoutAlgo.layoutNode.nodeName, this.parentDimensions.getOuterBlock());

//	console.log('blockLayoutAlgo updateBlockParentDimensions', this.layoutNode.nodeName, this.parentLayoutAlgo.layoutNode.nodeName, this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
//	console.log(this.parentLayoutAlgo.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.updateParentDimensions();
}

BlockLayoutAlgo.prototype.updateInlineBlockParentDimensions = function() {
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
	
//	console.log('blockUpdateInlineBlockParentDimensions', this.layoutNode.nodeName, this.dimensions.getOuterBlock());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

















module.exports = BlockLayoutAlgo;