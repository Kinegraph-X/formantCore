/**
 * 
 * constructor InlineLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseIntermediateLayoutAlgo = require('src/_LayoutEngine/L_baseIntermediateLayoutAlgo');

//var TextSizeGetter = require('src/core/TextSizeGetter');
//var textSizeGetter = new TextSizeGetter();

//var FontPath = require('src/integrated_libs_&_forks/fontpath_src');

/*
 * 
 */
var InlineLayoutAlgo = function(layoutNode) {
	BaseIntermediateLayoutAlgo.call(this, layoutNode);
	this.objectType = 'InlineLayoutAlgo';
	this.algoName = 'inline';
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	
//	this.localDebugLog('InlineLayoutAlgo INIT', this.layoutNode.nodeName, this.layoutNode._parent.nodeName);
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
		this.setParentDimensions = this.setInlineParentDimensions;
		this.updateParentDimensions = this.updateInlineParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& (this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row
				|| this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.rowReverse)) {
		this.setParentDimensions = this.setInlineParentDimensions;
		this.updateParentDimensions = this.updateFlexParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.setParentDimensions = this.setBlockParentDimensions;
		this.updateParentDimensions = this.updateBlockParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		this.setParentDimensions = this.setInlineBlockParentDimensions;
		this.updateParentDimensions = this.updateInlineBlockParentDimensions;
	}
	
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);
}

InlineLayoutAlgo.prototype = Object.create(BaseIntermediateLayoutAlgo.prototype);
InlineLayoutAlgo.prototype.objectType = 'InlineLayoutAlgo';

InlineLayoutAlgo.prototype.executeLayout = function() {
	// NEW FORMATTING CONTEXT
	// (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
	if (this.layoutNode.previousSibling && this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.parentLayoutAlgo.resetInlineAvailableSpaceOffset();
		this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	}
//	else
//		this.parentLayoutAlgo.resetBlockAvailableSpaceOffset();
		
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	
	this.setSelfDimensions();
	this.setAvailableSpace();
	this.setSelfOffsets();
	this.setParentDimensions();
}

/**
 * @method setSelfOffsets
 * 
 */
InlineLayoutAlgo.prototype.setSelfOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
//	if (this.layoutNode.nodeName === this.relevantNodeNamesAsConstants.input)
//	// Add 1 to the block offset as we compute the height without taking the border in account
//		this.offsets.setFromBlock(1 + this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
//	else
		this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
//	console.log(this.parentLayoutAlgo.offsets.getMarginBlock(), this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
}

InlineLayoutAlgo.prototype.getDimensions = function() {
	if (this.layoutNode.nodeName === this.relevantNodeNamesAsConstants.input) {
		// The MDN doesn't precise which char should be used to count the size of an input of type text
		// We empirically defined that an input with default size holds 20 "a" chars
		var pseudoString = '', dimensions;
		for (var i = 0, l = this.layoutNode.inputLength; i < l; i++) {
			pseudoString += this.subStringsAsConstants.a;
		}
		return this.getAugmentedTextDimensions(pseudoString);
	}
	return [0, 0];
}

InlineLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var dimensions = this.getDimensions();
	this.dimensions.setFromInline(dimensions[0]);
	if (this.layoutNode.nodeName === this.relevantNodeNamesAsConstants.input)
		this.dimensions.setFromBlock(dimensions[1] + 2);
	else
		this.dimensions.setFromBlock(dimensions[1]);
//	console.log(this.layoutNode.nodeName, this.dimensions.getValues());
}

InlineLayoutAlgo.prototype.setInlineParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
	this.parentDimensions.setFromBorderBlock(
		this.max(
			this.parentLayoutAlgo.dimensions.getBlock(), 
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	console.log('inline update Inline', this.layoutNode.nodeName, this.dimensions.getOuterBlock(), this.parentDimensions.getOuterBlock());
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions();
}

InlineLayoutAlgo.prototype.setBlockParentDimensions = function() {
//	this.parentDimensions.setFromBorderInline(
//		this.max(
//			this.parentLayoutAlgo.dimensions.getInline(),
//			this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
//		)
//	);
//	console.log('inlinesetBlockParentDimensions', this.layoutNode.nodeName, this.parentLayoutAlgo.layoutNode.nodeName, this.dimensions.getOuterBlock());
	this.parentDimensions.setFromBorderBlock(
		this.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
//	console.log(this.parentLayoutAlgo.availableSpace.getInlineOffset(), this.parentLayoutAlgo.availableSpace.getInline())
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
//	console.log('inlineLayoutAlgo setBlockParentDimensions', this.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getInlineOffset(), this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineLayoutAlgo.prototype.setInlineBlockParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		this.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(),
			this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
//	console.log('inlinesetBlockParentDimensions', this.layoutNode.nodeName, this.parentLayoutAlgo.layoutNode.nodeName, this.dimensions.getOuterBlock());
	this.parentDimensions.setFromBorderBlock(
		this.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(),
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
//	console.log(this.parentLayoutAlgo.availableSpace.getInlineOffset(), this.parentLayoutAlgo.availableSpace.getInline())
//	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
//	console.log('inlineLayoutAlgo setBlockParentDimensions', this.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getInlineOffset(), this.dimensions.getOuterInline());
	
//	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineLayoutAlgo.prototype.updateInlineParentDimensions = function() {
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
//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineLayoutAlgo.prototype.updateBlockParentDimensions = function(fromText, fromMultiline) {
//	console.log('inline update block', fromMultiline);

//	this.parentDimensions.setFromBorderInline(
//		Math.max(
//			this.parentLayoutAlgo.dimensions.getInline(),
//			this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
//		)
//	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
//	console.log('fromMultiline', fromMultiline)
	if (!fromMultiline) {
		this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	}
	
//	if (this.parentLayoutAlgo.isFlexChild) {
//		this.parentLayoutAlgo.resetBlockAvailableSpace();
//		console.log('inlineLayoutAlgo updateBlockParentDimensions', this.layoutNode.nodeName, this.layoutNode.textContent);
//		this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'handleEffectiveAlignItems');
//	 }
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineLayoutAlgo.prototype.updateInlineBlockParentDimensions = function(fromText, fromMultiline) {
	
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
	
//	console.log('inline update InlineBlock', this.layoutNode.nodeName, this.parentDimensions.getOuterInline());
	// Optimization : if we have a second line of text, the inner text nodes shall behave as block nodes => don't update inline offset
	// (Then we won't have to reset it elsewhere)
	if (!fromMultiline) {
		this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	}
	
//	if (this.parentLayoutAlgo.isFlexChild) {
////		this.parentLayoutAlgo.resetBlockAvailableSpace();
////		console.log('inlineLayoutAlgo updateBlockParentDimensions', this.layoutNode.nodeName, this.layoutNode.textContent);
//		this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'handleEffectiveAlignItems');
//	 }
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineLayoutAlgo.prototype.updateFlexParentDimensions = function(fromText, fromMultiline) {
//	this.parentDimensions.setFromBorderInline(
//		Math.max(
//			this.parentLayoutAlgo.dimensions.getInline(),
//			this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
//		)
//	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
//	console.log('inline update flex', this.layoutNode.nodeName, this.dimensions.getOuterBlock(), this.parentDimensions.getOuterBlock());
	if (!fromMultiline) {
		this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	}
	
	this.parentLayoutAlgo.updateParentDimensions();
}






















module.exports = InlineLayoutAlgo;