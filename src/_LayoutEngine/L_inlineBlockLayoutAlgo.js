/**
 * 
 * constructor InlineBlockLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseIntermediateLayoutAlgo = require('src/_LayoutEngine/L_baseIntermediateLayoutAlgo');



/*
 * 
 */
var InlineBlockLayoutAlgo = function(layoutNode) {
	BaseIntermediateLayoutAlgo.call(this, layoutNode);
	this.objectType = 'InlineBlockLayoutAlgo';
	this.algoName = 'inline-block';
	
//	this.localDebugLog('InlineBlockLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	
	if (this.shouldGrow)
		this.parentLayoutAlgo.availableSpace.setShouldGrowChildCount(this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount() + 1);
	if (this.shouldShrink)
		this.parentLayoutAlgo.availableSpace.setShouldShrinkChildCount(this.parentLayoutAlgo.availableSpace.getShouldShrinkChildCount() + 1);

	if (this.isFlexChild
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row) {
		this.setFlexDimensions = this.setFlexRowDimensions;
		this.setSelfOffsets = this.setFlexRowSelfOffsets;
		this.setParentDimensions = this.setFlexRowParentDimensions;
		this.updateParentDimensions = this.updateFlexRowParentDimensions;
	}
	else if ((this.isFlexChild
		&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.column)) {
			this.setFlexDimensions = this.setFlexColumnDimensions;
			this.setSelfOffsets = this.setFlexRowSelfOffsets;
			this.setParentDimensions = this.setFlexColumnParentDimensions;
			this.updateParentDimensions = this.updateFlexColumnParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		this.setFlexDimensions = this.setFlexRowDimensions;
		this.setParentDimensions = this.setFlexRowParentDimensions;
		this.updateParentDimensions = this.updateFlexRowParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.setParentDimensions = this.setFlexColumnParentDimensions;
		this.updateParentDimensions = this.updateBlockParentDimensions;
	}
	
	// Case of isFlexChild: InlineBlock is the only one to test that case
	// => we push to layoutCallbackRegisryItem.firstLevel
	if (this.isFlexChild) {
		var layoutCallbackRegisryItem = TypeManager.layoutCallbacksRegistry.getItem(this.flexCtx._UID);
		layoutCallbackRegisryItem.firstLevel.push(this.layoutNode);
	}

//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

InlineBlockLayoutAlgo.prototype = Object.create(BaseIntermediateLayoutAlgo.prototype);
InlineBlockLayoutAlgo.prototype.objectType = 'InlineBlockLayoutAlgo';

InlineBlockLayoutAlgo.prototype.executeLayout = function() {
	// NEW FORMATTING CONTEXT
	// (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
	if (this.layoutNode.previousSibling) {
		if (this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
			// TODO: Are we sure we were calling the std imp of resetAvailableSpace ?
			// Was there a special imp on the blockLayoutAlgo type ?
			this.parentLayoutAlgo.resetBlockAvailableSpaceOffset();
		}
		else if (this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
			// FIXME: we should not have incremented blockOffset if the parent is flexRow
			// and then, we should not have to reset it
			if (this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)	
				this.parentLayoutAlgo.resetBlockAvailableSpaceOffset();
		}
	}
	
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	
	this.setSelfDimensions();
	this.setAvailableSpace();
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions();
}

InlineBlockLayoutAlgo.prototype.setFlexRowSelfOffsets = function() {
	if (this.layoutNode._parent.computedStyle.bufferedValueToString('justifyContent') === 'space-evenly') {
		if (this.layoutNode.isLastChild) {
			this.resetInlineAvailableSpaceTempOffset();
			this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'setFlexRowEvenlySpacedOffsets');
		} 
	}
	else {
		this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
		this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
	}
}

InlineBlockLayoutAlgo.prototype.setFlexColumnSelfOffsets = function() {
	if (this.layoutNode._parent.computedStyle.bufferedValueToString('justifyContent') === 'space-evenly') {
		if (this.layoutNode.isLastChild) {
			this.resetInlineAvailableSpaceTempOffset();
			this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'setFlexColumnEvenlySpacedOffsets');
		}
	}
	else {
		this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
		this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
	}
}

InlineBlockLayoutAlgo.prototype.setSelfOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
	this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
}

InlineBlockLayoutAlgo.prototype.setSelfOffsetsFromTempOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getTempInlineOffset() + this.getInlineOffsetforAutoMargins());
	this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getTempBlockOffset() + this.getBlockOffsetforAutoMargins());
}

InlineBlockLayoutAlgo.prototype.setFlexRowEvenlySpacedOffsets = function() {
	// FIXME: still needs a math op
	this.setSelfOffsetsFromTempOffsets();
	this.parentLayoutAlgo.availableSpace.setTempInlineOffset(this.parentLayoutAlgo.availableSpace.getTempInlineOffset() + this.dimensions.getOuterInline());
}

InlineBlockLayoutAlgo.prototype.setFlexRowEvenlySpacedOffsets = function() {
	// FIXME: still needs a math op
	this.setSelfOffsetsFromTempOffsets();
	this.parentLayoutAlgo.availableSpace.setTempBlockOffset(this.parentLayoutAlgo.availableSpace.getTempBlockOffset() + this.dimensions.getOuterBlock());
}

InlineBlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var DHL = 0;
	
	// FLEX DIMENSIONS
	if (this.isFlexChild && this.layoutNode.isLastChild) {
		this.setFlexDimensions(DHL);
		return;
	}
	
	if (this.hasExplicitWidth) {
		this.dimensions.setFromInline(this.getInlineDimension());
		//  Before getOffsetsForAutorMargins()
		this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.availableSpace.getInline() - this.dimensions.getOuterInline());
	}
	else {
		this.dimensions.setFromInline(0);
		this.parentLayoutAlgo.availableSpace.setInline(0);
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

InlineBlockLayoutAlgo.prototype.setFlexRowDimensions = function(DHL) {
	this.parentLayoutAlgo.resetInlineAvailableSpaceTempOffset();
	this.parentLayoutAlgo.resetBlockAvailableSpaceTempOffset();
	
	this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexRowDimensions');
	
	this.recursiveSetFlexRowDimensions(this.flexCtx);
}

InlineBlockLayoutAlgo.prototype.recursiveSetFlexRowDimensions = function(flexCtx) {
	
	var currentParent, parentInlineDimensions;
	TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.forEach(function(currentNode) {
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent;
			
			parentInlineDimensions = currentParent.layoutAlgo.dimensions.getInline() - currentParent.layoutAlgo.getSummedInlinePaddings();
			currentParent.layoutAlgo.setAvailableSpace();
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if ((currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex)
				&& !currentNode.layoutAlgo.hasExplicitWidth)
				currentNode.layoutAlgo.dimensions.setFromOuterInline(parentInlineDimensions);

		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets();
		
		// & UPDATE block PARENT blockOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
			currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
			currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
	}, this);
	
	
	var childCtxList = Object.values(flexCtx.childCtxList);
	if (childCtxList.length) {
		childCtxList.forEach(function(childCtx) {
			TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).firstLevel.forEach(function(currentNode) {
				if (currentParent !== currentNode._parent) {
					currentParent = currentNode._parent;
					currentParent.layoutAlgo.setAvailableSpace();
				}
				
				// The main task: SET OFFSETS
				currentNode.layoutAlgo.setSelfOffsets();
				
				// & UPDATE block PARENT blockOFFSET
				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
					currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
				// & UPDATE inline-block PARENT inlineOFFSET
				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
					|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
						&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
					currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
			}, this);
			
			if (TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).subLevels.length
				|| Object.values(childCtx.childCtxList).length)
				this.recursiveSetFlexRowDimensions(childCtx);
		}, this);
	}
	
	if (!flexCtx._parent) {
		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).firstLevel.length = 0;
		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.length = 0;
	}
}

InlineBlockLayoutAlgo.prototype.setFlexColumnDimensions = function() {
	this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceOffset();
	
	this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexColumnDimensions');
	
	this.recursiveSetFlexColumnDimensions(this.flexCtx);
}

InlineBlockLayoutAlgo.prototype.recursiveSetFlexColumnDimensions = function(flexCtx) {
	
	
	var currentParent, parentInlineDimensions;
	TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.forEach(function(currentNode) {
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent
			
			parentInlineDimensions = currentParent.layoutAlgo.dimensions.getInline() - currentParent.layoutAlgo.getSummedInlinePaddings();
			currentParent.layoutAlgo.setAvailableSpace(currentParent.dimensions);
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			&& !currentNode.layoutAlgo.hasExplicitWidth)
			currentNode.layoutAlgo.dimensions.setFromOuterInline(parentInlineDimensions);
		
		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets();
		
		// & UPDATE block PARENT blockOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
			currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
			currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
	}, this);
	
	var childCtxList = Object.values(flexCtx.childCtxList);
	if (childCtxList.length) {
		childCtxList.forEach(function(childCtx) {
			TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).firstLevel.forEach(function(currentNode) {
				if (currentParent !== currentNode._parent) {
					currentParent = currentNode._parent;
					currentParent.layoutAlgo.setAvailableSpace();
				}
				
				// The main task: SET OFFSETS
				currentNode.layoutAlgo.setSelfOffsets();
				
				// & UPDATE block PARENT blockOFFSET
				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
					currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
				// & UPDATE inline-block PARENT inlineOFFSET
				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
					|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
						&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
					currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
			}, this);
			if (TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).subLevels.length
				|| Object.values(childCtx.childCtxList).length)
				this.recursiveSetFlexColumnDimensions(childCtx);
		}, this);
	}
	
	if (!flexCtx._parent) {
		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).firstLevel.length = 0;
		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.length = 0;
	}
		
}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexRowDimensions = function() {
	if (!this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount() || !(this.cs.getFlexGrow() > 0)) {
		this.setSelfOffsetsFromTempOffsets();
		this.parentLayoutAlgo.availableSpace.setTempInlineOffset(this.parentLayoutAlgo.availableSpace.getTempInlineOffset() + this.dimensions.getOuterInline());
		return;
	}
	
	// FIXME: floats are NOT handled by our CSSPropertyBuffer type, and flexGrow may be float
	// For now, it acts like if we had parseInt the number
	this.dimensions.setFromOuterInline(
		this.dimensions.getOuterInline()
		 + this.cs.getFlexGrow() * (this.parentLayoutAlgo.availableSpace.getInline() / this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount())
	);
	
	this.setSelfOffsetsFromTempOffsets();
	this.parentLayoutAlgo.availableSpace.setTempInlineOffset(this.parentLayoutAlgo.availableSpace.getTempInlineOffset() + this.dimensions.getOuterInline());
}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexColumnDimensions = function(DHL) {
	if (!this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount() || !(this.cs.getFlexGrow() > 0)) {
		this.setSelfOffsetsFromTempOffsets(dimensions);
		this.parentLayoutAlgo.availableSpace.setTempBlockOffset(this.parentLayoutAlgo.availableSpace.getTempBlockOffset() + this.dimensions.getOuterBlock());
		return;
	}
	
	// FIXME: floats are NOT handled by our CSSPropertyBuffer type, and flexGrow may be float
	// For now, it acts like if we had parseInt the number
	this.dimensions.setFromOuterBlock(
		this.dimensions.getOuterBlock()
		 + this.cs.getFlexGrow() * (this.parentLayoutAlgo.availableSpace.getBlock() / this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount())
	);
	
	this.setSelfOffsetsFromTempOffsets();
	this.parentLayoutAlgo.availableSpace.setTempBlockOffset(this.parentLayoutAlgo.availableSpace.getTempBlockOffset() + this.dimensions.getOuterBlock());
}

InlineBlockLayoutAlgo.prototype.setFlexRowParentDimensions = function(dimensions) {
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
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
	this.updateFlexRowSiblingsDimensions();
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineBlockLayoutAlgo.prototype.setFlexColumnParentDimensions = function(dimensions) {
	this.parentDimensions.setFromBorderBlock(
		this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
	);
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.updateFlexColumnSiblingsDimensions(dimensions, DHL);
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineBlockLayoutAlgo.prototype.updateBlockParentDimensions = function() {
//	this.parentDimensions.setFromBorderInline(
//		this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
//	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineBlockLayoutAlgo.prototype.updateFlexRowParentDimensions = function(dimensions, DHL) {
//	this.parentDimensions.setFromBorderInline(
//		this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
//	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineBlockLayoutAlgo.prototype.updateFlexColumnParentDimensions = function(dimensions, DHL) {
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);

	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexRowSiblingsDimensions = function(dimensions, DHL) {
	if (this.layoutNode.previousSibling
		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		var summedParentBlockPaddings = this.cs.getParentSummedBlockPaddings();
		
		var currentNode = this.layoutNode,
			currentLayoutAlgo = this;
		while(true) {
			if (!currentLayoutAlgo.hasExplicitHeight) {
				currentNode.layoutAlgo.dimensions.setFromOuterBlock(Math.max(currentNode._parent.layoutAlgo.dimensions.getBlock() - summedParentBlockPaddings, currentNode.layoutAlgo.dimensions.getOuterBlock()));
				currentLayoutAlgo.setAvailableSpace();
			}
			
			currentNode = currentNode.previousSibling;
			currentLayoutAlgo = currentNode ? currentNode.layoutAlgo : null;
			if (!currentNode)	// we're flexChild-only here || currentNode.layoutAlgo.algoName !== this.layoutAlgosAsConstants.inlineBlock)
				break;
		}
	}
}

InlineBlockLayoutAlgo.prototype.updateFlexColumnSiblingsDimensions = function(dimensions, DHL) {
	if (this.layoutNode.previousSibling
		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		var summedParentInlinePaddings = this.cs.getParentSummedInlinePaddings();
		
		var currentNode = this.layoutNode,
			currentLayoutAlgo = this;
		while(true) {
			if (!currentLayoutAlgo.hasExplicitWidth) {
				currentNode.layoutAlgo.dimensions.setFromOuterInline(Math.max(currentNode._parent.layoutAlgo.dimensions.getInline() - summedParentInlinePaddings, currentNode.layoutAlgo.dimensions.getOuterInline()));
				currentLayoutAlgo.setAvailableSpace();
			}
			
			currentNode = currentNode.previousSibling;
			currentLayoutAlgo = currentNode ? currentNode.layoutAlgo : null;
			if (!currentNode)	// we're flexChild-only here ||  || currentNode.layoutAlgo.algoName !== this.layoutAlgosAsConstants.inlineBlock)
				break;
		}
	}
}






















module.exports = InlineBlockLayoutAlgo;