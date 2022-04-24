/**
 * 
 * constructor InlineBlockLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var InlineBlockLayoutAlgo = function(layoutNode) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'InlineBlockLayoutAlgo';
	this.algoName = 'inline-block';
	this.localDebugLog('InlineBlockLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex)
		this.isFlexChild = true;
	if (this.layoutNode._parent.layoutAlgo.isFlexChild || this.layoutNode._parent.layoutAlgo.isIndirectFlexChild)
		this.isIndirectFlexChild = true;
		
	if (this.shouldGrow)
		this.layoutNode._parent.availableSpace.shouldGrowChildCount++;
	if (this.shouldShrink)
		this.layoutNode._parent.availableSpace.shouldShrinkChildCount++;
	
//	console.log(this.layoutNode._parent.layoutAlgo.algoName);

	if ((this.isFlexChild
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		this.setFlexDimensions = this.setFlexRowDimensions;
		this.setParentDimensions = this.setFlexRowParentDimensions;
		this.updateParentDimensions = this.updateFlexRowParentDimensions;
	}
	else if ((this.isFlexChild
		&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.column)) {
//			this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
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
		// FIXME: we should not have incremented blockOffset if the parent is flexRow
		// and then, we should not have to reset it
		else if (this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
//			&& this.layoutNode._parent.computedStyle.bufferedValueToString('flexDirection') === this.flexDirectionsAsConstants.row) {
			this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceOffset();
//			this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		}
	}
	
//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : parent.availableSpace', this.layoutNode._parent.availableSpace);
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setAvailableSpace(this.layoutNode.dimensions);
	
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);
	
	if (this.isIndirectFlexChild)
		TypeManager.layoutCallbackRegistry.setItem(this.layoutNode._UID, this.layoutNode);

//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'inline-block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);

}

InlineBlockLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
InlineBlockLayoutAlgo.prototype.objectType = 'InlineBlockLayoutAlgo';

InlineBlockLayoutAlgo.prototype.getUpToDateRemainingAvailableSpace = function() {
//	console.log(this.layoutNode.dimensions);
	return new CoreTypes.DimensionsPair([
		this.layoutNode._parent.availableSpace.inline - this.layoutNode.dimensions.inline,
		this.layoutNode._parent.availableSpace.block - this.layoutNode.dimensions.block
	]);
}

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
			this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart');
			this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart');
		}
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
//		console.log(this.layoutNode.nodeName, 'setSelfOffsets', this.layoutNode._parent.availableSpace);
		this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + this.layoutNode._parent.offsets.marginInline + this.getInlineOffsetforAutoMargins();
		this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset + this.layoutNode._parent.offsets.marginBlock + this.getBlockOffsetforAutoMargins();
		this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart');
		this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart');
	}
	else {
		this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset;
		this.layoutNode._parent.availableSpace.inlineOffset += dimensions.inline;
		this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset;
	}
	
	this.layoutNode.updateCanvasShapeOffsets();
}

InlineBlockLayoutAlgo.prototype.setEvenlySpacedOffsets = function(dimensions) {
//	console.log('called setEvenlySpacedOffsets', this.layoutNode.nodeName, 'this.layoutNode.isLastChild', this.layoutNode.isLastChild);
	var remainingAvailableSpace = this.getUpToDateRemainingAvailableSpace();
	
	console.log('called setEvenlySpacedOffsets', remainingAvailableSpace);
	this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + remainingAvailableSpace.inline / (this.layoutNode._parent.availableSpace.childCount + 1);
	this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.offsets.inline + this.layoutNode.dimensions.inline;
	
	this.layoutNode.updateCanvasShapeOffsets();
}

InlineBlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var DHL = 0;
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
//	console.log();
	if (this.hasExplicitWidth)
		this.layoutNode._parent.layoutAlgo.decrementInlineAvailableSpace(this.layoutNode.dimensions.outerInline);
	if (this.hasExplicitHeight)
		this.layoutNode._parent.layoutAlgo.decrementBlockAvailableSpace(this.layoutNode.dimensions.outerBlock);
	
	// FLEX DIMENSIONS
	if (this.isFlexChild && this.layoutNode.isLastChild) {
//		if (!dimensions.inline) {
			this.setFlexDimensions(DHL);
			return;
//		}
//		else if (!dimensions.block) {
//			this.setFlexDimensions(DHL);
//			return;
//		}
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
	
	this.layoutNode.updateCanvasShapeDimensions();
}

InlineBlockLayoutAlgo.prototype.setFlexRowDimensions = function(DHL) {

	this.layoutNode._parent.layoutAlgo.resetInlineAvailableSpaceOffset();
//	this.layoutNode._parent.layoutAlgo.resetAvailableSpaceLastOffsets();

//	this.restrictFlexRowAvailableSpace();
	this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexRowDimensions');
	
	var summedInlineMargins,
		summedInlineBorders,
		summedParentInlinePaddings;
	var currentNode, currentParent, parentInlineDimensions;
	
	for (var itemUID in TypeManager.layoutCallbackRegistry.cache) {
		currentNode = TypeManager.layoutNodesRegistry.cache[itemUID];
		
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent
			
			summedParentInlinePaddings = currentParent.layoutAlgo.getSummedInlinePaddings();
			parentInlineDimensions = currentParent.dimensions.inline - summedParentInlinePaddings;

			currentParent.layoutAlgo.setAvailableSpace(currentParent.dimensions);
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			&& !currentNode.layoutAlgo.hasExplicitWidth) {
			
			if (currentNode.dimensions.inline < parentInlineDimensions) {
				summedInlineBorders = currentNode.layoutAlgo.getSummedInlineBorders();
				summedInlineMargins = currentNode.layoutAlgo.getSummedInlineMargins();
				
				currentNode.dimensions.inline =  parentInlineDimensions - summedInlineBorders;
				currentNode.dimensions.borderInline =  parentInlineDimensions;
				currentNode.dimensions.outerInline =  parentInlineDimensions + summedInlineMargins;
				currentNode.updateCanvasShapeDimensions();
			}
		}
		
		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets(currentNode.dimensions);
		
		// & UPDATE block PARENT blockOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
			currentParent.layoutAlgo.availableSpace.blockOffset += currentNode.dimensions.outerBlock;
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
			currentParent.layoutAlgo.availableSpace.inlineOffset += currentNode.dimensions.outerBlock;
	}
	
	// The last task: effectiveSetFlexRowDimensions ONE LAST TIME, for the current inlineBlock node
	this.effectiveSetFlexRowDimensions(DHL);
}

InlineBlockLayoutAlgo.prototype.setFlexColumnDimensions = function(DHL) {
//	this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceOffset();
	
	this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexColumnDimensions');
	
	var summedInlineMargins,
		summedInlineBorders,
		summedParentInlinePaddings;
	var currentNode, currentParent, parentInlineDimensions;
	
	for (var itemUID in TypeManager.layoutCallbackRegistry.cache) {
		currentNode = TypeManager.layoutNodesRegistry.cache[itemUID];
		
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent
			
			summedParentInlinePaddings = currentParent.layoutAlgo.getSummedInlinePaddings();
			parentInlineDimensions = currentParent.dimensions.inline - summedParentInlinePaddings;

			currentParent.layoutAlgo.setAvailableSpace(currentParent.dimensions);
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			&& !currentNode.layoutAlgo.hasExplicitWidth) {
			
			if (currentNode.dimensions.inline < parentInlineDimensions) {
				summedInlineBorders = currentNode.layoutAlgo.getSummedInlineBorders();
				summedInlineMargins = currentNode.layoutAlgo.getSummedInlineMargins();
				
				currentNode.dimensions.inline =  parentInlineDimensions - summedInlineBorders;
				currentNode.dimensions.borderInline =  parentInlineDimensions;
				currentNode.dimensions.outerInline =  parentInlineDimensions + summedInlineMargins;
				currentNode.updateCanvasShapeDimensions();
			}
		}
		
		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets(currentNode.dimensions);
		
		// & UPDATE block PARENT blockOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
			currentParent.layoutAlgo.availableSpace.blockOffset += currentNode.dimensions.outerBlock;
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
			currentParent.layoutAlgo.availableSpace.inlineOffset += currentNode.dimensions.outerBlock;
	}
	
	this.effectiveSetFlexColumnDimensions(DHL);
}

//InlineBlockLayoutAlgo.prototype.restrictFlexRowAvailableSpace = function(DHL) {
//	if (this.layoutNode.previousSibling
//		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
//		
//		var currentNode = this.layoutNode;
//		currentNode.layoutAlgo = new BaseLayoutAlgo(this.layoutNode);
//		currentNode.layoutAlgo.shouldGrow = this.shouldGrow;
//		while(true) {
////			console.log('currentNode.layoutAlgo.shouldGrow', currentNode.nodeName, currentNode.layoutAlgo.shouldGrow, currentNode.computedStyle.bufferedValueToNumber('flexGrow'));
//			if (!currentNode.layoutAlgo.shouldGrow)
//				currentNode._parent.availableSpace.inline -= currentNode.dimensions.outerInline;
//			
//			currentNode = currentNode.previousSibling;
//			if (!currentNode || !currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
//				break;
//		}
//	}
//}
//
//InlineBlockLayoutAlgo.prototype.restrictFlexColumnAvailableSpace = function(DHL) {
//	if (this.layoutNode.previousSibling
//		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
//		
//		var currentNode = this.layoutNode;
//		currentNode.layoutAlgo = new BaseLayoutAlgo(this.layoutNode);
//		currentNode.layoutAlgo.shouldGrow = this.shouldGrow;
//		while(true) {
//			if (!currentNode.shouldGrow)
//				this.layoutNode._parent.availableSpace.block -= currentNode.dimensions.outerblock;
//			currentNode = currentNode.previousSibling;
//			if (!currentNode || !currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
//				break;
//		}
//	}
//}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexRowDimensions = function(DHL) {
	// FIXME: FlexGrow-n- size depends on the size of the "dimensionned" children
	// 
	// => ie. flexChildren which have larger dimensionned children
	// weigh more in the computation of each relative flexGrow-n- size.
	// The supplementary "allocated" size to each flexChild at the same level should be the same
	var dimensions = this.layoutNode.dimensions;
	
	if (!this.layoutNode._parent.availableSpace.shouldGrowChildCount
		|| !(this.layoutNode.computedStyle.bufferedValueToNumber('flexGrow') > 0)) {
		this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
		this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
		this.layoutNode.updateCanvasShapeDimensions();
		
		this.setSelfOffsets(dimensions);
		if (!this.layoutNode.isLastChild) {
			this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
			this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
		}
		return;
	}
	
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	// FIXME: floats are NOT handled by our CSSPropertyBuffer type, and flexGrow may be float
	// For now, it acts like if we had parseInt the number
	dimensions.outerInline += this.layoutNode.computedStyle.bufferedValueToNumber('flexGrow') * (this.layoutNode._parent.availableSpace.inline / this.layoutNode._parent.availableSpace.shouldGrowChildCount);
	dimensions.borderInline = dimensions.outerInline - summedInlineMargins;
	dimensions.inline = dimensions.borderInline - summedInlineBorders
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
	this.layoutNode.updateCanvasShapeDimensions();
	
	this.setSelfOffsets();
	if (!this.layoutNode.isLastChild) {
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
		this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
	}
}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexColumnDimensions = function(DHL) {
	var dimensions = this.layoutNode.dimensions; 
	if (this.hasExplicitHeight || !(this.layoutNode.computedStyle.bufferedValueToNumber('flexGrow') > 0)) {
		this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
		this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
		this.layoutNode.updateCanvasShapeDimensions();
		
		this.setSelfOffsets(dimensions);
		if (!this.layoutNode.isLastChild) {
			this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
			this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		}
		return;
	}
	
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedBlockMargins = this.getSummedBlockMargins();

	dimensions.outerBlock = this.layoutNode.computedStyle.bufferedValueToNumber('flexGrow') * this.layoutNode._parent.availableSpace.block / this.layoutNode._parent.availableSpace.childCount;
	dimensions.borderBlock = dimensions.outerBlock - summedBlockMargins;
	dimensions.block = dimensions.borderBlock - summedBlockBorders
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
	this.layoutNode.updateCanvasShapeDimensions();
	
	this.setSelfOffsets();
	if (!this.layoutNode.isLastChild) {
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	}
}

InlineBlockLayoutAlgo.prototype.setFlexRowParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
	this.layoutNode._parent.availableSpace.inline -= dimensions.outerInline;
	this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
	
	if (this.layoutNode._parent.dimensions.block < dimensions.outerBlock) {
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.setFlexColumnParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
//	console.log(this.layoutNode.nodeName, 'setFlexColumnParentDimensions', this.layoutNode._parent.availableSpace.block, dimensions.outerBlock);
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins
		this.layoutNode._parent.availableSpace.block = 0;
	}
	
	this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
	this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	
//	console.log(this.layoutNode.nodeName, 'setFlexColumnParentDimensions', this.layoutNode._parent.availableSpace);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	
	this.updateFlexColumnSiblingsDimensions(dimensions, DHL);
	
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
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
			inlineOffset += currentNode.dimensions.outerInline + currentNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + currentNode.computedStyle.bufferedValueToNumber('borderInlineStart');
		
		
		inlineOffset += beforeCurrentNode._parent.computedStyle.bufferedValueToNumber('paddingInlineStart') + beforeCurrentNode._parent.computedStyle.bufferedValueToNumber('borderInlineStart');
		
		this.layoutNode._parent.availableSpace.inline = this.layoutNode._parent.dimensions.borderInline - inlineOffset - this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineEnd');
		this.layoutNode._parent.availableSpace.inlineOffset = inlineOffset;
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	}
	else {
		this.layoutNode._parent.availableSpace.inline -= dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.dimensions.outerInline + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderInlineStart');
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	}
	
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
	
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
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexRowParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
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
			inlineOffset += currentNode.dimensions.outerInline + currentNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + currentNode.computedStyle.bufferedValueToNumber('borderInlineStart');
		
		
		inlineOffset += beforeCurrentNode._parent.computedStyle.bufferedValueToNumber('paddingInlineStart') + beforeCurrentNode._parent.computedStyle.bufferedValueToNumber('borderInlineStart');
		
		this.layoutNode._parent.availableSpace.inline = this.layoutNode._parent.dimensions.borderInline - inlineOffset - this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineEnd');
		this.layoutNode._parent.availableSpace.inlineOffset = inlineOffset;
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	}
	else {
		this.layoutNode._parent.availableSpace.inline -= dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.dimensions.outerInline + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderInlineStart');
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
	}
	
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
	
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
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
	
	this.updateFlexRowSiblingsDimensions(dimensions, DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexColumnParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	// A Block or a Flex parent may have never seen his inlineOffset updated
	// as we didn't had yet non-zero dimensions : we're inline, and our inlineSize depends on our children
//	if (this.layoutNode.previousSibling
//		&& (this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline
//			|| this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)) {
//		var beforeCurrentNode = this.layoutNode, 
//			currentNode = this.layoutNode.previousSibling,
//			inlineOffset = this.layoutNode.dimensions.outerInline;
//		while(currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
//			inlineOffset += currentNode.dimensions.outerInline;
//			beforeCurrentNode = currentNode;
//			currentNode = currentNode.previousSibling;
//		}
//		if (currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
//			inlineOffset += currentNode.dimensions.outerInline + currentNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + currentNode.computedStyle.bufferedValueToNumber('borderInlineStart');
//		
//		
//		inlineOffset += beforeCurrentNode._parent.computedStyle.bufferedValueToNumber('paddingInlineStart') + beforeCurrentNode._parent.computedStyle.bufferedValueToNumber('borderInlineStart');
//		
//		this.layoutNode._parent.availableSpace.inline = this.layoutNode._parent.dimensions.borderInline - inlineOffset - this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineEnd');
//		this.layoutNode._parent.availableSpace.inlineOffset = inlineOffset;
//		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
//	}
//	else {
//		this.layoutNode._parent.availableSpace.inline -= dimensions.outerInline;
//		this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.dimensions.outerInline + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderInlineStart');
//		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
//	}
	console.log(this.layoutNode.nodeName, 'updateFlexColumnParentDimensions', this.layoutNode._parent.availableSpace.block, dimensions.outerBlock);
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
	
	if (this.layoutNode._parent.dimensions.block < parentBlockDimensions) {
		var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
		var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.blockOffset = this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock;
	}
	
//	console.log(this.layoutNode.nodeName, 'updateFlexColumnParentDimensions', this.layoutNode._parent.availableSpace);
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexRowSiblingsDimensions = function(dimensions, DHL) {
	if (this.layoutNode.previousSibling
		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		var summedParentBlockPaddings = this.layoutNode._parent.layoutAlgo.getSummedBlockPaddings();
		var summedBlockBorders, summedBlockMargins;
		
		var currentNode = this.layoutNode;
		while(currentNode && currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
			if (currentNode.computedStyle.getIsInitialValue('height')) {
				summedBlockBorders = currentNode.layoutAlgo.getSummedBlockBorders();
				summedBlockMargins = currentNode.layoutAlgo.getSummedBlockMargins();
				
				currentNode.dimensions.outerBlock = Math.max(currentNode._parent.dimensions.block - summedParentBlockPaddings, currentNode.dimensions.outerBlock);
				currentNode.dimensions.borderBlock = currentNode.dimensions.outerBlock - summedBlockMargins;
				currentNode.dimensions.block = currentNode.dimensions.borderBlock - summedBlockBorders;
				
				currentNode.layoutAlgo.setAvailableSpace(currentNode.dimensions);
//				currentNode.layoutAlgo.resetAvailableSpaceLastOffsets();
				
				currentNode.updateCanvasShapeDimensions();
			}
			
			currentNode = currentNode.previousSibling;
		}
	}
}

InlineBlockLayoutAlgo.prototype.updateFlexColumnSiblingsDimensions = function(dimensions, DHL) {
	if (this.layoutNode.previousSibling
		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		var summedParentInlinePaddings = this.layoutNode._parent.layoutAlgo.getSummedInlinePaddings();
		var summedInlineBorders, summedInlineMargins;
		
		var currentNode = this.layoutNode;
		currentNode.layoutAlgo = new BaseLayoutAlgo(this.layoutNode);
		while(true) {
			if (currentNode.computedStyle.getIsInitialValue('width')) {
				summedInlineBorders = currentNode.layoutAlgo.getSummedInlineBorders();
				summedInlineMargins = currentNode.layoutAlgo.getSummedInlineMargins();
				
				currentNode.dimensions.outerInline = Math.max(currentNode._parent.dimensions.inline - summedParentInlinePaddings, currentNode.dimensions.outerInline);
				currentNode.dimensions.borderInline = currentNode.dimensions.outerInline - summedInlineMargins;
				currentNode.dimensions.inline = currentNode.dimensions.borderInline - summedInlineBorders;
				
				currentNode.layoutAlgo.setAvailableSpace(currentNode.dimensions);
//				currentNode.layoutAlgo.resetAvailableSpaceLastOffsets();
				
				currentNode.updateCanvasShapeDimensions();
			}
			
			currentNode = currentNode.previousSibling;
			if (!currentNode || currentNode.layoutAlgo.algoName !== this.layoutAlgosAsConstants.inlineBlock)
				break;
		}
	}
}

InlineBlockLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {
	
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	// TODO: maybe optimize : this could be achieved with the instanceof keyword => benchmark
//	if (['block', 'flex'].indexOf(this.layoutNode._parent.layoutAlgo.algoName) !== -1) {
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row) {
//			console.log('InlineBlockLayoutAlgo', 'flex parent found');
//			console.log('InlineBlockLayoutAlgo', 'flex parent found', this.layoutNode._parent.dimensions.block);
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
			this.layoutNode._parent.dimensions.inline += dimensions.inline + summedInlineMargins;
		}
		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
			this.layoutNode._parent.dimensions.block = dimensions.block + summedBlockMargins;
//			console.log('InlineBlockLayoutAlgo', 'flex parent blockMargin', summedBlockMargins);
		}
//		console.log('InlineBlockLayoutAlgo', 'flex parent found: row', this.layoutNode._parent.dimensions.block);
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline + summedInlineMargins) {
			this.layoutNode._parent.dimensions.inline = dimensions.inline + summedInlineMargins;
		}
		if (this.layoutNode._parent.dimensions.block < dimensions.block + summedBlockMargins) {
			this.layoutNode._parent.dimensions.block += dimensions.block + summedBlockMargins;
		}
//		console.log('InlineBlockLayoutAlgo', 'flex parent found: column', this.layoutNode._parent.dimensions.block);
	}
	else {
		if (this.layoutNode._parent.dimensions.inline < dimensions.inline) {
			this.layoutNode._parent.dimensions.inline += dimensions.inline;
		}
		if (this.layoutNode._parent.dimensions.block < dimensions.block) {
			this.layoutNode._parent.dimensions.block = dimensions.block;
		}
	}
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	
//	console.log('may update parent dimensions',  this.layoutNode._parent.dimensions.block, this.layoutNode.dimensions.block + inlineMargins);
//	console.log('update parent dimensions', this.layoutNode._parent.nodeName, this.layoutNode._parent.dimensions.block);

	this.layoutNode._parent.layoutAlgo.updateParentDimensions(dimensions);
}

//InlineBlockLayoutAlgo.prototype.getInlineDimension = function() {
////	console.log(this.layoutNode.computedStyle.getPosForProp('width') * this.layoutNode.computedStyle.itemSize, this.layoutNode.computedStyle._buffer);
////	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('width'));
//	return this.layoutNode.computedStyle.bufferedValueToNumber('width');
//}

//InlineBlockLayoutAlgo.prototype.getBlockDimension = function() {
////	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('height'));
//	return this.layoutNode.computedStyle.bufferedValueToNumber('height');
//}


























module.exports = InlineBlockLayoutAlgo;