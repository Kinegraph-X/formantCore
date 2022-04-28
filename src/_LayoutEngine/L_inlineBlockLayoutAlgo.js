/**
 * 
 * constructor InlineBlockLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var InlineBlockLayoutAlgo = function(layoutNode, layoutDimensionsBuffer) {
	BaseLayoutAlgo.call(this, layoutNode, layoutDimensionsBuffer);
	this.objectType = 'InlineBlockLayoutAlgo';
	this.algoName = 'inline-block';
	this.localDebugLog('InlineBlockLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	
	if (this.shouldGrow)
		this.layoutNode._parent.availableSpace.shouldGrowChildCount++;
	if (this.shouldShrink)
		this.layoutNode._parent.availableSpace.shouldShrinkChildCount++;

	if ((this.isFlexChild
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		this.setFlexDimensions = this.setFlexRowDimensions;
		this.setParentDimensions = this.setFlexRowParentDimensions;
		this.updateParentDimensions = this.updateFlexRowParentDimensions;
	}
	else if ((this.isFlexChild
		&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.column)) {
			this.setFlexDimensions = this.setFlexColumnDimensions;
			this.setParentDimensions = this.setFlexColumnParentDimensions;
			this.updateParentDimensions = this.updateFlexColumnParentDimensions;
		}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.setParentDimensions = this.setFlexColumnParentDimensions;
		this.updateParentDimensions = this.updateBlockParentDimensions;
	}
	
	// NEW FORMATTING CONTEXT
	// (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
	if (this.layoutNode.previousSibling) {
		if (this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
			this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
			this.layoutNode._parent.layoutAlgo.resetAvailableSpace(this.layoutNode._parent.dimensions);
		}
		else if (this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
			// FIXME: we should not have incremented blockOffset if the parent is flexRow
			// and then, we should not have to reset it
			if (this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)	
				this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceOffset();
			else
				this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		}
	}
	
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setAvailableSpace(this.layoutNode.dimensions);
	
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);
	
	if (this.isFlexChild) {
		var layoutCallbackRegisryItem = TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID);
		layoutCallbackRegisryItem.firstLevel.push(this.layoutNode);
	}
	if (this.isIndirectFlexChild) {
		var layoutCallbackRegisryItem = TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID);
		layoutCallbackRegisryItem.subLevels.push(this.layoutNode);
	}

//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

InlineBlockLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
InlineBlockLayoutAlgo.prototype.objectType = 'InlineBlockLayoutAlgo';

InlineBlockLayoutAlgo.prototype.setSelfOffsets = function(dimensions) {
	// this.layoutNode.dimensions is actualy computed but _parent.AvailableSpace is not computed yet

	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& this.layoutNode._parent.layoutAlgo.flexDirection === 'row') {
		if (this.layoutNode._parent.computedStyle.bufferedValueToString('justifyContent') === 'space-evenly') {
			this.layoutNode._parent.layoutAlgo.resetInlineAvailableSpaceOffset();
			
			if (this.layoutNode.isLastChild) {
				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'setEvenlySpacedOffsets');
				// At last, call the setEvenlySpacedOffsets from here,
				// as the linked list mechanism doesn't allow calling the layout algo
				// (we're still in the Ctor of the layout algo, it isn't yet asigned to a property of the layoutNode)
				this.setEvenlySpacedOffsets(dimensions);
			} 
		}
		else {
			this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + this.layoutNode._parent.offsets.marginInline + this.getInlineOffsetforAutoMargins();
			this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset + this.layoutNode._parent.offsets.marginBlock + this.getBlockOffsetforAutoMargins();
			this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.cs.getMarginInlineStart();
			this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.cs.getMarginBlockStart();
		}
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + this.layoutNode._parent.offsets.marginInline + this.getInlineOffsetforAutoMargins();
		this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset + this.layoutNode._parent.offsets.marginBlock + this.getBlockOffsetforAutoMargins();
		this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.cs.getMarginInlineStart();
		this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.cs.getMarginBlockStart();
	}
	else {
		this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset;
		this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.cs.getMarginInlineStart();
		this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.cs.getMarginBlockStart();
	}
}

InlineBlockLayoutAlgo.prototype.setSelfOffsetsFromTempOffsets = function(dimensions) {
	this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.tempOffset.inline + this.layoutNode._parent.offsets.marginInline;
	this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.tempOffset.block + this.layoutNode._parent.offsets.marginBlock;
	this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.cs.getMarginInlineStart();
	this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.cs.getMarginBlockStart();
}

InlineBlockLayoutAlgo.prototype.setEvenlySpacedOffsets = function(dimensions) {
	var remainingAvailableSpace = this.getUpToDateRemainingAvailableSpace();
	this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + remainingAvailableSpace.inline / (this.layoutNode._parent.availableSpace.childCount + 1);
	this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.offsets.inline + this.layoutNode.dimensions.inline;
}

InlineBlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var DHL = 0;
	
	// FLEX DIMENSIONS
	if (this.isFlexChild && this.layoutNode.isLastChild) {
		this.setFlexDimensions(DHL);
		return;
	}
	
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_pre', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_pre', this.layoutNode.dimensions.block);
	
	dimensions.inline = !this.hasExplicitWidth ? 0 : this.getInlineDimension();
	dimensions.block = !this.hasExplicitHeight ? 0 : this.getBlockDimension();
	
	// NORMAL DIMENSIONS
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	if (this.cs.getBoxSizing() === this.boxModelValuesAsConstants.contentBox) {
		dimensions.add([summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings]);
	}
	else if (!this.hasExplicitWidth) {
		if (!this.hasExplicitHeight)
			dimensions.add([summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([summedInlinePaddings, 0, summedInlinePaddings, 0, summedInlinePaddings, 0]);
	}
	else if (!this.hasExplicitHeight) {
		if (!this.hasExplicitWidth)
			dimensions.add([summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
	}
	
	dimensions.setBorderSize([dimensions.inline, dimensions.block]);
	dimensions.addToBorderSize([summedInlineBorders, summedBlockBorders]);
	dimensions.setOuterSize([dimensions.borderInline, dimensions.borderBlock]);
	dimensions.addToOuterSize([summedInlineMargins, summedBlockMargins]);
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
}

InlineBlockLayoutAlgo.prototype.setFlexRowDimensions = function(DHL) {
	
	this.layoutNode._parent.layoutAlgo.resetInlineAvailableSpaceTempOffset();
	this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceTempOffset();
	
	this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexRowDimensions');
	
	var summedInlineMargins,
		summedInlineBorders,
		summedParentInlinePaddings;
	var currentParent, parentInlineDimensions;
	
	TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID).subLevels.forEach(function(currentNode) {
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent;
			summedParentInlinePaddings = currentParent.layoutAlgo.getSummedInlinePaddings();
			
			parentInlineDimensions = currentParent.dimensions.inline - summedParentInlinePaddings;
			currentParent.layoutAlgo.setAvailableSpace(currentParent.dimensions);
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if ((currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex)
				&& !currentNode.layoutAlgo.hasExplicitWidth) {

				summedInlineBorders = currentNode.layoutAlgo.getSummedInlineBorders();
				summedInlineMargins = currentNode.layoutAlgo.getSummedInlineMargins();
				
				currentNode.dimensions.inline =  parentInlineDimensions - summedInlineBorders;
				currentNode.dimensions.borderInline =  parentInlineDimensions;
				currentNode.dimensions.outerInline =  parentInlineDimensions + summedInlineMargins;
		}

		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets(currentNode.dimensions);
		
		// & UPDATE block PARENT blockOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
			currentParent.layoutAlgo.availableSpace.blockOffset += currentNode.dimensions.outerBlock;
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
			currentParent.layoutAlgo.availableSpace.inlineOffset += currentNode.dimensions.outerBlock;
	}, this);
	
	
	var childCtxList = Object.values(this.flexCtx.childCtxList);
	if (childCtxList.length) {
		childCtxList.forEach(function(childCtx) {
//			console.log(TypeManager.layoutCallbackRegistry.getItem(childCtx._UID).firstLevel);
			TypeManager.layoutCallbackRegistry.getItem(childCtx._UID).firstLevel.forEach(function(currentNode) {
//				console.log(currentNode);
				if (currentParent !== currentNode._parent) {
					currentParent = currentNode._parent;
					currentParent.layoutAlgo.setAvailableSpace(currentParent.dimensions);
				}
				
				// The main task: SET OFFSETS
				currentNode.layoutAlgo.setSelfOffsets(currentNode.dimensions);
				
				// & UPDATE block PARENT blockOFFSET
				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
					currentParent.layoutAlgo.availableSpace.blockOffset += currentNode.dimensions.outerBlock;
				// & UPDATE inline-block PARENT inlineOFFSET
				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
					|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
						&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
					currentParent.layoutAlgo.availableSpace.inlineOffset += currentNode.dimensions.outerBlock;
			}, this);
		}, this);
	}
	
	if (!this.flexCtx._parent)
		TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID).length = 0;
}

InlineBlockLayoutAlgo.prototype.setFlexColumnDimensions = function(DHL) {
	this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceOffset();
	
	this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexColumnDimensions');
	
	var summedInlineMargins,
		summedInlineBorders,
		summedParentInlinePaddings;
	var currentParent, parentInlineDimensions;
	
	TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID).subLevels.forEach(function(currentNode) {
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent
			summedParentInlinePaddings = currentParent.layoutAlgo.getSummedInlinePaddings();
			
			parentInlineDimensions = currentParent.dimensions.inline - summedParentInlinePaddings;
			currentParent.layoutAlgo.setAvailableSpace(currentParent.dimensions);
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			&& !currentNode.layoutAlgo.hasExplicitWidth) {
			
				summedInlineBorders = currentNode.layoutAlgo.getSummedInlineBorders();
				summedInlineMargins = currentNode.layoutAlgo.getSummedInlineMargins();
				
				currentNode.dimensions.inline =  parentInlineDimensions - summedInlineBorders;
				currentNode.dimensions.borderInline =  parentInlineDimensions;
				currentNode.dimensions.outerInline =  parentInlineDimensions + summedInlineMargins;
		}
		
		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets(currentNode.dimensions);
		
		// & UPDATE block PARENT blockOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
			currentParent.layoutAlgo.availableSpace.blockOffset += currentNode.dimensions.outerBlock;
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
			currentParent.layoutAlgo.availableSpace.inlineOffset += currentNode.dimensions.outerBlock;
	}, this);
	
	if (!this.flexCtx._parent)
		TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID).length = 0;
}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexRowDimensions = function(DHL) {
	var dimensions = this.layoutNode.dimensions;
	
	if (!this.layoutNode._parent.availableSpace.shouldGrowChildCount || !(this.cs.getFlexGrow() > 0)) {
		this.setSelfOffsetsFromTempOffsets(dimensions);
		this.layoutNode._parent.availableSpace.tempOffset.inline += dimensions.outerInline;
		return;
	}
	
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	// FIXME: floats are NOT handled by our CSSPropertyBuffer type, and flexGrow may be float
	// For now, it acts like if we had parseInt the number
	var addedInlineDimension = this.cs.getFlexGrow() * (this.layoutNode._parent.availableSpace.inline / this.layoutNode._parent.availableSpace.shouldGrowChildCount);
	
	dimensions.outerInline += addedInlineDimension;
	dimensions.borderInline = dimensions.outerInline - summedInlineMargins;
	dimensions.inline = dimensions.borderInline - summedInlineBorders;
	
	this.setSelfOffsetsFromTempOffsets();
	this.layoutNode._parent.availableSpace.tempOffset.inline += dimensions.outerInline;
}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexColumnDimensions = function(DHL) {
	var dimensions = this.layoutNode.dimensions;
	
	if (!this.layoutNode._parent.availableSpace.shouldGrowChildCount || !(this.cs.getFlexGrow() > 0)) {
		this.setSelfOffsetsFromTempOffsets(dimensions);
		this.layoutNode._parent.availableSpace.tempOffset.inline += dimensions.outerBlock;
		return;
	}
	
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedBlockMargins = this.getSummedBlockMargins();
	// FIXME: floats are NOT handled by our CSSPropertyBuffer type, and flexGrow may be float
	// For now, it acts like if we had parseInt the number
	var addedBlockDimension = this.cs.getFlexGrow() * (this.layoutNode._parent.availableSpace.block / this.layoutNode._parent.availableSpace.shouldGrowChildCount);
	
	dimensions.outerBlock += addedBlockDimension;
	dimensions.borderBlock = dimensions.outerBlock - summedBlockMargins;
	dimensions.block = dimensions.borderBlock - summedBlockBorders
	
	this.setSelfOffsetsFromTempOffsets();
	this.layoutNode._parent.availableSpace.tempOffset.block += dimensions.outerBlock;
}

InlineBlockLayoutAlgo.prototype.setFlexRowParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	if (this.layoutNode._parent.availableSpace.inline < dimensions.outerInline) {
		var summedParentInlineBorders = this.cs.getParentSummedInlineBorders();
		var summedParentInlineMargins = this.cs.getParentSummedInlineMargins();
		var parentInlineDimensions = this.layoutNode._parent.availableSpace.inlineOffset + dimensions.outerInline + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth();
		this.layoutNode._parent.dimensions.inline = parentInlineDimensions - summedParentInlineBorders;
		this.layoutNode._parent.dimensions.borderInline = parentInlineDimensions;
		this.layoutNode._parent.dimensions.outerInline = parentInlineDimensions + summedParentInlineMargins;
	}
	this.layoutNode._parent.availableSpace.inline = this.layoutNode._parent.dimensions.borderInline - (this.layoutNode._parent.availableSpace.inlineOffset + dimensions.outerInline) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth();
	this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var summedParentBlockBorders = this.cs.getParentSummedBlockBorders();
		var summedParentBlockMargins = this.cs.getParentSummedBlockMargins();
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.updateFlexRowSiblingsDimensions(dimensions, DHL);
	
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.setFlexColumnParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var summedParentBlockBorders = this.cs.getParentSummedBlockBorders();
		var summedParentBlockMargins = this.cs.getParentSummedBlockMargins();
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins
	}
	this.layoutNode._parent.availableSpace.block = this.layoutNode._parent.dimensions.borderBlock - (this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth();
	this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
	this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.updateFlexColumnSiblingsDimensions(dimensions, DHL);
	
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	// FIXME: as seen in updateFlexColumnParentDimensions, we've solved the problem we had described just below
	// A Block or a Flex parent may have never seen his inlineOffset updated
	// as we didn't had yet non-zero dimensions : we're inline, and our inlineSize depends on our children
	if (this.layoutNode.previousSibling
		&& (this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline
			|| this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)) {
		var beforeCurrentNode = this.layoutNode, 
			currentNode = this.layoutNode.previousSibling,
			inlineOffset = this.layoutNode.dimensions.outerInline;
		while(currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
			inlineOffset += currentNode.dimensions.outerInline;
			beforeCurrentNode = currentNode;
			currentNode = currentNode.previousSibling;
		}
		if (currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
			inlineOffset += currentNode.dimensions.outerInline + currentNode.layoutAlgo.cs.getPaddingInlineStart() + currentNode.layoutAlgo.cs.getBorderInlineStartWidth();
		
		inlineOffset += beforeCurrentNode.layoutAlgo.cs.getParentPaddingInlineStart() + beforeCurrentNode.layoutAlgo.cs.getParentBorderInlineStartWidth();
		
		this.layoutNode._parent.availableSpace.inline = this.layoutNode._parent.dimensions.borderInline - inlineOffset - this.cs.getParentBorderInlineEndWidth() - this.cs.getParentPaddingInlineEnd();
		this.layoutNode._parent.availableSpace.inlineOffset = inlineOffset;
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	}
	else {
		this.layoutNode._parent.availableSpace.inline -= dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.dimensions.outerInline + this.cs.getParentPaddingInlineStart() + this.cs.getParentBorderInlineStartWidth();
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	}
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
		var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexRowParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentInlineBorders = this.cs.getParentSummedInlineBorders();
	var summedParentInlineMargins = this.cs.getParentSummedInlineMargins();
	
	var summedParentBlockBorders = this.cs.getParentSummedBlockBorders();
	var summedParentBlockMargins = this.cs.getParentSummedBlockMargins();

	var parentInlineDimensions = this.layoutNode._parent.availableSpace.lastOffset.inline + dimensions.outerInline + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth();
	if (this.layoutNode._parent.dimensions.inline < parentInlineDimensions) {
		this.layoutNode._parent.dimensions.inline = parentInlineDimensions - summedParentInlineBorders;
		this.layoutNode._parent.dimensions.borderInline = parentInlineDimensions;
		this.layoutNode._parent.dimensions.outerInline = parentInlineDimensions + summedParentInlineMargins;
	}
	this.layoutNode._parent.availableSpace.inline = this.layoutNode._parent.dimensions.inline - (this.layoutNode._parent.availableSpace.lastOffset.inline + dimensions.outerInline) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth();
	this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode._parent.availableSpace.lastOffset.inline + dimensions.outerInline;
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexColumnParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
		var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
	}
	
	this.layoutNode._parent.availableSpace.block = this.layoutNode._parent.dimensions.borderBlock - (this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth();
	this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);

	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexRowSiblingsDimensions = function(dimensions, DHL) {
	if (this.layoutNode.previousSibling
		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		var summedParentBlockPaddings = this.cs.getParentSummedBlockPaddings();
		var summedBlockBorders, summedBlockMargins;
		
		var currentNode = this.layoutNode,
			currentLayoutAlgo = this;
		while(true) {
			if (currentLayoutAlgo.cs.getHeightIsInitialValue()) {
				summedBlockBorders = currentLayoutAlgo.getSummedBlockBorders();
				summedBlockMargins = currentLayoutAlgo.getSummedBlockMargins();
				
				currentNode.dimensions.outerBlock = Math.max(currentNode._parent.dimensions.block - summedParentBlockPaddings, currentNode.dimensions.outerBlock);
				currentNode.dimensions.borderBlock = currentNode.dimensions.outerBlock - summedBlockMargins;
				currentNode.dimensions.block = currentNode.dimensions.borderBlock - summedBlockBorders;
				
				currentLayoutAlgo.setAvailableSpace(currentNode.dimensions);
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
		var summedInlineBorders, summedInlineMargins;
		
		var currentNode = this.layoutNode,
			currentLayoutAlgo = this;
		while(true) {
			if (currentLayoutAlgo.cs.getWidthIsInitialValue()) {
				summedInlineBorders = currentLayoutAlgo.getSummedInlineBorders();
				summedInlineMargins = currentLayoutAlgo.getSummedInlineMargins();
				
				currentNode.dimensions.outerInline = Math.max(currentNode._parent.dimensions.inline - summedParentInlinePaddings, currentNode.dimensions.outerInline);
				currentNode.dimensions.borderInline = currentNode.dimensions.outerInline - summedInlineMargins;
				currentNode.dimensions.inline = currentNode.dimensions.borderInline - summedInlineBorders;
				
				currentLayoutAlgo.setAvailableSpace(currentNode.dimensions);
			}
			
			currentNode = currentNode.previousSibling;
			currentLayoutAlgo = currentNode ? currentNode.layoutAlgo : null;
			if (!currentNode)	// we're flexChild-only here ||  || currentNode.layoutAlgo.algoName !== this.layoutAlgosAsConstants.inlineBlock)
				break;
		}
	}
}

//InlineBlockLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {
//	
//	var summedInlineMargins = this.getSummedInlineMargins();
//	var summedBlockMargins = this.getSummedBlockMargins();
//	
//	// TODO: maybe optimize : this could be achieved with the instanceof keyword => benchmark
//	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
//			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row) {
//		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
//			this.layoutNode._parent.dimensions.inline += dimensions.inline + summedInlineMargins;
//		}
//		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
//			this.layoutNode._parent.dimensions.block = dimensions.block + summedBlockMargins;
//		}
//	}
//	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
//			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
//		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
//			this.layoutNode._parent.dimensions.inline = dimensions.inline + summedInlineMargins;
//		}
//		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
//			this.layoutNode._parent.dimensions.block += dimensions.block + summedBlockMargins;
//		}
//	}
//	else {
//		if (this.layoutNode._parent.dimensions.inline < dimensions.inline) {
//			this.layoutNode._parent.dimensions.inline += dimensions.inline;
//		}
//		if (this.layoutNode._parent.dimensions.block < dimensions.block) {
//			this.layoutNode._parent.dimensions.block = dimensions.block;
//		}
//	}
//	
//	this.layoutNode._parent.layoutAlgo.updateParentDimensions(dimensions);
//}

























module.exports = InlineBlockLayoutAlgo;