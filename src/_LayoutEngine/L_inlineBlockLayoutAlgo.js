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
			&& (this.parentLayoutAlgo.flexDirection === this.flexDirectionsAsConstants.row
				|| this.parentLayoutAlgo.flexDirection === this.flexDirectionsAsConstants.rowReverse)) {
		this.handleEffectiveAlignItems = this.handleEffectiveRowAlignItems;
		this.setFlexDimensions = this.setFlexRowDimensions;
		this.setSelfOffsets = this.setFlexRowSelfOffsets;
		this.setParentDimensions = this.setFlexRowParentDimensions;
		this.updateParentDimensions = this.updateFlexRowParentDimensions;
	}
	else if ((this.isFlexChild
		&& (this.parentLayoutAlgo.flexDirection === this.flexDirectionsAsConstants.column
			|| this.parentLayoutAlgo.flexDirection === this.flexDirectionsAsConstants.columnReverse))) {
			this.handleEffectiveAlignItems = this.handleEffectiveColummAlignItems;
			this.setFlexDimensions = this.setFlexColumnDimensions;
			this.setSelfOffsets = this.setFlexColumnSelfOffsets;
			this.setParentDimensions = this.setFlexColumnParentDimensions;
			this.updateParentDimensions = this.updateFlexColumnParentDimensions;
	}
	else if (this.parentLayoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		this.setFlexDimensions = this.setFlexRowDimensions;
		this.setParentDimensions = this.setFlexRowParentDimensions;
		this.updateParentDimensions = this.updateFlexRowParentDimensions;
	}
	else if (this.parentLayoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.setParentDimensions = this.setFlexColumnParentDimensions;
		this.updateParentDimensions = this.updateBlockParentDimensions;
	}
	
	// The InlineBlock is the only one to test the isFlexChild case
	// => we push to layoutCallbackRegisryItem.firstLevel
	// TODO: Do we need to push the flex-end nodes as firstLevel nodes ?
	// for the horizontal traversal and on-children propagation
	// when a parent node's position changes ?
	//  && this.layoutNode.objectType !== this.layoutNodesAsConstants.FlexEndLayoutNode
	// SEEMS we do need it for now...
	if (this.isFlexChild && this.layoutNode.objectType !== this.layoutNodesAsConstants.FlexEndLayoutNode) {
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
			if (this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row
				|| this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.rowReverse)	
				this.parentLayoutAlgo.resetBlockAvailableSpaceOffset();
		}
	}
	
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	
	this.setSelfDimensions();
	this.setAvailableSpace();
	this.setSelfOffsets();
	this.setParentDimensions();
}

InlineBlockLayoutAlgo.prototype.setFlexRowSelfOffsets = function() {
	if (this.isFlexChild) {
		if (this.layoutNode.isLastChild) {
			if (this.parentLayoutAlgo.cs.getJustifyContent() === 'space-evenly') {
				this.resetInlineAvailableSpaceTempOffset();
				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'setFlexRowEvenlySpacedOffsets');
			}
			if (this.parentLayoutAlgo.cs.getAlignItems() === 'center') {
//				console.log(this.layoutNode.nodeName, this.layoutNode._UID);
//				console.log('CALLED setFlexRowSelfOffsets', this.layoutNode.nodeName, this.parentLayoutAlgo.dimensions.getOuterBlock());
				
				// TODO : refacto for row and column
				this.parentLayoutAlgo.resetBlockAvailableSpace();
				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'handleEffectiveAlignItems');
//				console.log('RECURSION');
				this.recursivelyRowAlignItems(this.flexCtx);
			}
			// Should work but we met a problem with our test-case when trying to implement (flex-child cannot be flex even if declared flex in the CSS)
//			else if (this.parentLayoutAlgo.cs.getAlignItems() === 'flex-end') {
//				console.log('HERE');
//				this.parentLayoutAlgo.resetInlineAvailableSpaceOffset();
//				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'updateFlexRowReverseSiblingsOffsets');
//			}
//			if (this.parentLayoutAlgo.cs.getFlexDirection() === 'row-reverse') {
//				this.parentLayoutAlgo.resetInlineAvailableSpaceOffset();
////				console.log('ROW-REVERSE', this.layoutNode.nodeName, this.layoutNode._UID, this.parentLayoutAlgo.availableSpace.getInline());
//				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'updateFlexRowReverseSiblingsOffsets');
//			}
		}
		else {
//			console.log(this.layoutNode.nodeName, this.parentLayoutAlgo.cs.getFlexDirection());
			this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
			this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
		}
	}
	else {
		this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
		this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
	}
}

InlineBlockLayoutAlgo.prototype.setFlexColumnSelfOffsets = function() {
	if (this.isFlexChild) {
		if (this.layoutNode.isLastChild) {
			if (this.layoutNode._parent.computedStyle.bufferedValueToString('justifyContent') === 'space-evenly') {
				this.resetInlineAvailableSpaceTempOffset();
				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'setFlexColumnEvenlySpacedOffsets');
			}
			
//			if (this.parentLayoutAlgo.cs.getAlignItems() === 'flex-end') {
//				console.log('HERE');
//				this.parentLayoutAlgo.resetInlineAvailableSpaceOffset();
//				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'updateFlexRowReverseSiblingsOffsets');
//			}
		}
		else {
			this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
			this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
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

InlineBlockLayoutAlgo.prototype.setFlexColumnEvenlySpacedOffsets = function() {
	// FIXME: still needs a math op
	this.setSelfOffsetsFromTempOffsets();
	this.parentLayoutAlgo.availableSpace.setTempBlockOffset(this.parentLayoutAlgo.availableSpace.getTempBlockOffset() + this.dimensions.getOuterBlock());
}

InlineBlockLayoutAlgo.prototype.setFlexRowAlignCenterOffsets = function() {
	var availableSpace = this.parentLayoutAlgo.availableSpace.getBlock() - this.dimensions.getOuterBlock();
	var offsetToOffset = availableSpace / 2;

	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getTempBlockOffset() + offsetToOffset);
	this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
}

InlineBlockLayoutAlgo.prototype.setFlexColumnAlignCenterOffsets = function() {
	var availableSpace = this.parentLayoutAlgo.availableSpace.getInline() - this.dimensions.getOuterInline();
	var offsetToOffset = availableSpace / 2;
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getTempInlineOffset() + offsetToOffset);
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
}

InlineBlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var DHL = 0;
	
	// FLEX DIMENSIONS
	if (this.isFlexChild && this.layoutNode.isLastChild) {
		this.setFlexDimensions(DHL);
		return;
	}
	
	if (this.hasExplicitWidth) {
		this.dimensions.setFromBorderInline(this.getInlineDimension());
		//  Before getOffsetsForAutorMargins()
		this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.availableSpace.getInline() - this.dimensions.getOuterInline());
	}
	else {
		this.dimensions.setFromInline(0);
		this.parentLayoutAlgo.availableSpace.setInline(0);
	}
	
	if (this.hasExplicitHeight) {
		this.dimensions.setFromBorderBlock(this.getBlockDimension());
		this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.availableSpace.getBlock() - this.dimensions.getOuterBlock());
	}
	else {
		this.dimensions.setFromBlock(0);
		this.parentLayoutAlgo.availableSpace.setBlock(0);
	}
}

InlineBlockLayoutAlgo.prototype.setFlexRowDimensions = function(DHL) {
//	if (this.layoutNode.isLastChild) {
//		this.parentLayoutAlgo.resetInlineAvailableSpaceOffset();
//		this.parentLayoutAlgo.resetInlineAvailableSpaceTempOffset();
//		this.parentLayoutAlgo.resetBlockAvailableSpaceTempOffset();
//		console.log('SIBLING TRAVERSAL', this.layoutNode._parent.nodeName, this.layoutNode._parent._UID);
//		this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexRowDimensions');
//		
//		// TODO: flex-grow shall conflict with alignItems : center (and other values) => big project is to unify all flex recursinos
//		if (this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount() && (this.cs.getFlexGrow() > 0))
//			this.recursiveSetFlexRowDimensions(this.flexCtx);
//	}
}

InlineBlockLayoutAlgo.prototype.recursiveSetFlexRowDimensions = function(flexCtx) {
	var currentParent, parentInlineDimensions, seenParents = new Set();
	TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.forEach(function(currentNode) {
//		console.log(currentNode.nodeName, currentNode.textContent);
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent;
			
			parentInlineDimensions = currentParent.layoutAlgo.dimensions.getInline() - currentParent.layoutAlgo.getSummedInlinePaddings();
			
			// Because of subTextNodes being added at the end of the flex ctx
			// we have to be careful when resetting availableSpace : reset only once per parent
			if (!seenParents.has(currentParent)) {
				seenParents.add(currentParent);
				currentParent.layoutAlgo.setAvailableSpace();
			}
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if ((currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex)
				&& !currentNode.layoutAlgo.hasExplicitWidth)
				currentNode.layoutAlgo.dimensions.setFromOuterInline(
					Math.max(
						currentNode.layoutAlgo.dimensions.getOuterInline(),
						parentInlineDimensions
					)
				);

		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets();
		
		//currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
		//	|| currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
		// & UPDATE block PARENT blockOFFSET & textNodes for multiline text
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.column)
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.text
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.subText) {
//			if (currentParent.nodeName === 'li')
//				console.log(currentNode.nodeName, currentNode._UID, currentNode.layoutAlgo.textContent, currentNode.layoutAlgo.algoName, this.layoutAlgosAsConstants.subText, currentParent.layoutAlgo.availableSpace.getBlockOffset());
//			console.log(currentNode.nodeName, currentNode.textContent, currentParent.layoutAlgo.availableSpace.getBlockOffset(), currentNode.layoutAlgo.dimensions.getOuterBlock());
			currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
		}
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row)
			currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
	}, this);
	
	
	var childCtxList = Object.values(flexCtx.childCtxList);
	seenParents = new Set();
	if (childCtxList.length) {
		childCtxList.forEach(function(childCtx) {
			TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).firstLevel.forEach(function(currentNode) {
				if (currentParent !== currentNode._parent) {
					currentParent = currentNode._parent;
					if (!seenParents.has(currentParent)) {
						seenParents.add(currentParent);
						currentParent.layoutAlgo.setAvailableSpace();
					}
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
	
//	if (!flexCtx._parent) {
//		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).firstLevel.length = 0;
//		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.length = 0;
//	}
}

InlineBlockLayoutAlgo.prototype.setFlexColumnDimensions = function() {
//	if (this.layoutNode.isLastChild) {
//		this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceOffset();
		
//		this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexColumnDimensions');
//		
//		// TODO: flex-grow shall conflict with alignItems : center (and other values) => big project is to unify all flex recursinos
//		if (this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount() && (this.cs.getFlexGrow() > 0))
//			this.recursiveSetFlexColumnDimensions(this.flexCtx);
//	}
}

InlineBlockLayoutAlgo.prototype.recursiveSetFlexColumnDimensions = function(flexCtx) {
	var currentParent, parentInlineDimensions, seenParents = new Set();
	TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.forEach(function(currentNode) {
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent
			parentInlineDimensions = currentParent.layoutAlgo.dimensions.getInline() - currentParent.layoutAlgo.getSummedInlinePaddings();
			
			// Because of subTextNodes being added at the end of the flex ctx
			// we have to be careful when resetting availableSpace : reset only once per parent
			if (!seenParents.has(currentParent)) {
				seenParents.add(currentParent);
				currentParent.layoutAlgo.setAvailableSpace();
			}
		}
		
		// Re-Adapt the inline size of every block child which has no explicit width
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			&& !currentNode.layoutAlgo.hasExplicitWidth) {
				currentNode.layoutAlgo.dimensions.setFromOuterInline(
					Math.max(
						currentNode.layoutAlgo.dimensions.getOuterInline(),
						parentInlineDimensions
					)
				);
		}
		
		// The main task: SET OFFSETS
		currentNode.layoutAlgo.setSelfOffsets();
		
		// & UPDATE block PARENT blockOFFSET
				// & UPDATE block PARENT blockOFFSET & textNodes for multiline text
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row)
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.text
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.subText) {
			currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
		}
		// & UPDATE inline-block PARENT inlineOFFSET
		if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
			currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
	}, this);
	
	var childCtxList = Object.values(flexCtx.childCtxList);
	seenParents = new Set();
	if (childCtxList.length) {
		childCtxList.forEach(function(childCtx) {
			TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).firstLevel.forEach(function(currentNode) {
				if (currentParent !== currentNode._parent) {
					currentParent = currentNode._parent;
					if (!seenParents.has(currentParent)) {
						seenParents.add(currentParent);
						currentParent.layoutAlgo.setAvailableSpace();
					}
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
	
//	if (!flexCtx._parent) {
//		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).firstLevel.length = 0;
//		TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.length = 0;
//	}
		
}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexRowDimensions = function() {
	if (!this.parentLayoutAlgo.availableSpace.getShouldGrowChildCount() || !(this.cs.getFlexGrow() > 0)) {
//		console.log('effectiveSetFlexRowDimensions', this.layoutNode.nodeName, this.layoutNode._UID, this.parentLayoutAlgo.availableSpace.getTempInlineOffset())
		this.setSelfOffsetsFromTempOffsets();
		this.parentLayoutAlgo.availableSpace.setTempInlineOffset(this.parentLayoutAlgo.availableSpace.getTempInlineOffset() + this.dimensions.getOuterInline());
		
		console.log('sibling', this.layoutNode.nodeName, this.layoutNode._UID);
//		// Re-Adapt the inline size of every flex-child which has no explicit width
//		if (!this.hasExplicitWidth) {
//				this.dimensions.setFromBorderInline(
//					Math.max(
//						this.dimensions.getBorderInline(),
//						this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
//					)
//				);
//		}
		return;
	}
	
	// FIXME (MAYBE SOMEDAY): floats are NOT handled by our CSSPropertyBuffer type, and flexGrow may be float
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
		this.setSelfOffsetsFromTempOffsets();
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

InlineBlockLayoutAlgo.prototype.setFlexRowParentDimensions = function() {
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
	
//	if (this.layoutNode.nodeName === 'flex-end')
//		console.log('flex-end', this.layoutNode._UID, this.parentDimensions.getBorderInline());
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
//	console.log('inlineBlock parentLayoutAlgo.availableSpace.setInlineOffset', this.parentLayoutAlgo.availableSpace.getInlineOffset(), this.dimensions.getOuterInline())
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
	this.updateFlexRowSiblingsDimensions();
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineBlockLayoutAlgo.prototype.setFlexColumnParentDimensions = function() {
	this.parentDimensions.setFromBorderBlock(
		this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
	);
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
//	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
//	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.updateFlexColumnSiblingsDimensions();
	this.parentLayoutAlgo.updateParentDimensions();
}




InlineBlockLayoutAlgo.prototype.updateBlockParentDimensions = function() {
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
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineBlockLayoutAlgo.prototype.updateFlexRowParentDimensions = function(DHL) {
	
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(),
			this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
	
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
//	if (this.layoutNode.nodeName === 'ul')
//		console.log('updateFlexRowParentDimensions ul', this.layoutNode._UID, this.parentLayoutAlgo.availableSpace.getLastInlineOffset(), this.dimensions.getOuterInline(), this.parentDimensions.getOuterInline());
	
//	if (this.parentLayoutAlgo.cs.getFlexDirection() === 'row-reverse') {
//		this.parentLayoutAlgo.availableSpace.setFlexEndLastInlineOffset(this.parentLayoutAlgo.availableSpace.getFlexEndInlineOffset());
//		this.parentLayoutAlgo.availableSpace.setFlexEndInlineOffset(this.parentLayoutAlgo.availableSpace.getFlexEndInlineOffset() - this.dimensions.getOuterInline());
//		// Re-set offsets if we are in reverse order, as we didn't have the correct parent offsets, nor the correct parent dimensions
//		this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getFlexEndInlineOffset() - this.dimensions.getBorderInline() - this.getInlineOffsetforAutoMargins());
//		this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
//	}
//	else {
		this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline());
		this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());		
//	}
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());

//	console.log('updateFlexRowParentDimensions', this.layoutNode.nodeName, this.parentLayoutAlgo.availableSpace.getInlineOffset(), this.dimensions.getOuterInline())

//	if (this.layoutNode.nodeName === 'h4') {
//		console.log('update tree-branck from h4 updateDimensions', this.parentLayoutAlgo.availableSpace.getInlineOffset(), this.dimensions.getOuterInline(), this.cs.getParentPaddingInlineEnd(), this.cs.getParentBorderInlineEndWidth());
//		console.log('update tree-branck from h4', this.dimensions.getOuterInline(), this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline())
//	}
	
	this.parentLayoutAlgo.updateParentDimensions();
}

InlineBlockLayoutAlgo.prototype.updateFlexColumnParentDimensions = function(DHL) {
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(),
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock());
	
//	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
//	this.localDebugLog(this.DHLstr(DHL), 'inline-block update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);

	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineBlockLayoutAlgo.prototype.updateFlexRowSiblingsDimensions = function(DHL) {
	if (this.layoutNode.previousSibling
		&& this.parentLayoutAlgo.cs.getAlignItems() === 'stretch'
		&& this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock) {
		
//		console.log('updateFlexRowSiblingsDimensions');
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

InlineBlockLayoutAlgo.prototype.updateFlexColumnSiblingsDimensions = function(DHL) {
	if (this.layoutNode.previousSibling
		&& this.parentLayoutAlgo.cs.getAlignItems() === 'stretch'
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

InlineBlockLayoutAlgo.prototype.handleEffectiveRowAlignItems = function() {
//	console.log(this.parentLayoutAlgo.availableSpace.getBlock(), this.dimensions.getOuterBlock());
	
	this.setFlexRowAlignCenterOffsets();
//	console.log(
//		this.layoutNode.nodeName,
//		this.layoutNode._UID,
//		this.parentLayoutAlgo.layoutNode.nodeName,
//		this.parentLayoutAlgo.layoutNode._UID,
//		'parent dimensions',
//		this.parentLayoutAlgo.dimensions.getOuterBlock(),
//		'block offset',
//		this.parentLayoutAlgo.availableSpace.getBlockOffset(),
//		'availableSpace',
//		availableSpace,
//		offsetToOffset
//	);
//	console.log(this.layoutNode._UID, this.offsets.getBlock());
	
	this.parentLayoutAlgo.availableSpace.setBlockOffset(
		this.parentLayoutAlgo.availableSpace.getTempBlockOffset()
		+ Math.max(
			this.parentLayoutAlgo.availableSpace.getBlockOffset(),
			this.dimensions.getOuterBlock()
		)
	);
	
//	if (!TypeManager.debugFlexCtx[this.layoutNode._UID])
//		TypeManager.debugFlexCtx[this.layoutNode._UID] = [0];
		
//	TypeManager.debugFlexCtx[this.layoutNode._UID]++;
}

InlineBlockLayoutAlgo.prototype.handleEffectiveColumnAlignItems = function() {
	this.setFlexColumnAlignCenterOffsets();
	
	this.parentLayoutAlgo.availableSpace.setInlineOffset(
		this.parentLayoutAlgo.availableSpace.getTempInlineOffset()
		+ Math.max(
			this.parentLayoutAlgo.availableSpace.getInlineOffset(),
			this.dimensions.getOuterInline()
		)
	);
	
//	this.recursivelyColumnAlignItems(this.flexCtx);
}

InlineBlockLayoutAlgo.prototype.recursivelyRowAlignItems = function(flexCtx) {
//	console.log('	flexCtx', flexCtx._UID, TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID));
	var currentParent, seenParents = new Set();
	TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.forEach(function(currentNode) {
//		console.log('		', this.layoutNode.nodeName, this.layoutNode._UID, currentNode.nodeName,  currentNode._UID);
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent;
			
			// Because of subTextNodes being added at the end of the flex ctx
			// we have to be careful when resetting availableSpace : reset only once per parent
			if (!seenParents.has(currentParent)) {
				seenParents.add(currentParent);
				currentParent.layoutAlgo.resetAvailableSpace();
			}
		}
		
//		if (currentNode._UID === '8')
//			return;
		
		// Use this step in a hacky way to resize block & flex nodes after their container has grown
		// Re-Adapt the inline size of every flex-child which has no explicit width
		if ((currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
				|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex)
			&& !currentNode.layoutAlgo.hasExplicitWidth) {
//			console.log('block child', currentNode.nodeName, currentNode._UID, currentNode._parent.nodeName, currentNode._parent._UID);
//			console.log(currentNode.layoutAlgo.parentLayoutAlgo.availableSpace.getInline());
			currentNode.layoutAlgo.dimensions.setFromOuterInline(
				Math.max(
					currentNode.layoutAlgo.dimensions.getOuterInline(),
					currentNode.layoutAlgo.parentLayoutAlgo.availableSpace.getInline()
				)
			);
		}
		
		// MAIN TASK : SET OFFSETS
		if (currentParent.layoutAlgo.cs.getAlignItems() === 'center')
			currentNode.layoutAlgo.setFlexRowAlignCenterOffsets();
		else
			currentNode.layoutAlgo.setSelfOffsets();
		
		// & UPDATE block PARENT blockOFFSET & textNodes for multiline text
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.column)
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.text
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.subText) {
			currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
		}
	}, this);
	
	var childCtxList = Object.values(flexCtx.childCtxList);
	seenParents = new Set();
	if (childCtxList.length) {
		childCtxList.forEach(function(childCtx) {
			TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).firstLevel.forEach(function(currentNode) {
				if (currentParent !== currentNode._parent) {
					currentParent = currentNode._parent;
					if (!seenParents.has(currentParent)) {
						seenParents.add(currentParent);
						currentParent.layoutAlgo.resetAvailableSpace();
					}
				}
				
				// The main task: SET OFFSETS
				
				if (currentParent.layoutAlgo.cs.getAlignItems() === 'center')
					currentNode.layoutAlgo.setFlexRowAlignCenterOffsets();
				else
					currentNode.layoutAlgo.setSelfOffsets();
					
				if (currentParent.layoutAlgo.cs.getFlexDirection() === 'row-reverse')
					currentNode.layoutAlgo.updateFlexRowReverseSiblingsOffsets() 
					
				// & UPDATE block PARENT blockOFFSET
				if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
					|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
					|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
						&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.column)
					|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.text
					|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.subText)
					currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
				// & UPDATE inline-block PARENT inlineOFFSET
				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
					|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
						&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
					currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
			}, this);
			
			if (TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).subLevels.length
				|| Object.values(childCtx.childCtxList).length) {
//				console.log(childCtx._UID);
				this.recursivelyRowAlignItems(childCtx);
			}
		}, this);
	}
}

InlineBlockLayoutAlgo.prototype.recursivelyColumnAlignItems = function(flexCtx) {
	var currentParent, seenParents = new Set();
	TypeManager.layoutCallbacksRegistry.getItem(flexCtx._UID).subLevels.forEach(function(currentNode) {
		if (currentParent !== currentNode._parent) {
			currentParent = currentNode._parent;
			
			// Because of subTextNodes being added at the end of the flex ctx
			// we have to be careful when resetting availableSpace : reset only once per parent
			if (!seenParents.has(currentParent)) {
				seenParents.add(currentParent);
				currentParent.layoutAlgo.resetBlockAvailableSpace();
			}
		}

		currentNode.layoutAlgo.setSelfOffsets();
		
		if (currentParent.layoutAlgo.cs.getFlexDirection() === 'row-reverse')
			currentNode.layoutAlgo.updateFlexRowReverseSiblingsOffsets() 
		
		// & UPDATE block PARENT blockOFFSET & textNodes for multiline text
		if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
				&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.column)
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.text
			|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.subText) {
			currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
		}
	}, this);
	
//	var childCtxList = Object.values(flexCtx.childCtxList);
//	seenParents = new Set();
//	if (childCtxList.length) {
//		childCtxList.forEach(function(childCtx) {
//			TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).firstLevel.forEach(function(currentNode) {
//				if (currentParent !== currentNode._parent) {
//					currentParent = currentNode._parent;
//					if (!seenParents.has(currentParent)) {
//						seenParents.add(currentParent);
//						currentParent.layoutAlgo.setAvailableSpace();
//					}
//				}
//				
//				// The main task: SET OFFSETS
//				currentNode.layoutAlgo.setSelfOffsets();
//				
//				// & UPDATE block PARENT blockOFFSET
//				if (currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
//					|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
//					|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
//						&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.column)
//					|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.text
//					|| currentNode.layoutAlgo.algoName === this.layoutAlgosAsConstants.subText)
//					currentParent.layoutAlgo.availableSpace.setBlockOffset(currentParent.layoutAlgo.availableSpace.getBlockOffset() + currentNode.layoutAlgo.dimensions.getOuterBlock());
//				// & UPDATE inline-block PARENT inlineOFFSET
//				if (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock
//					|| (currentParent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
//						&& currentParent.layoutAlgo.cs.getFlexDirection() === this.flexDirectionsAsConstants.row))
//					currentParent.layoutAlgo.availableSpace.setInlineOffset(currentParent.layoutAlgo.availableSpace.getInlineOffset() + currentNode.layoutAlgo.dimensions.getOuterInline());
//			}, this);
//			if (TypeManager.layoutCallbacksRegistry.getItem(childCtx._UID).subLevels.length
//				|| Object.values(childCtx.childCtxList).length)
//				this.recursivelyColumnAlignItems(childCtx);
//		}, this);
//	}
}

InlineBlockLayoutAlgo.prototype.updateFlexRowReverseSiblingsOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getFlexEndInlineOffset() - this.dimensions.getBorderInline() - this.cs.getMarginInlineEnd());
	this.parentLayoutAlgo.availableSpace.setFlexEndInlineOffset(this.parentLayoutAlgo.availableSpace.getFlexEndInlineOffset() - this.dimensions.getOuterInline());
	
//	console.log('UPDATE SIBLING', this.layoutNode.nodeName, this.layoutNode._UID, this.layoutNode._parent.nodeName, this.layoutNode._parent._UID, this.parentLayoutAlgo.dimensions.getBorderInline(), this.parentLayoutAlgo.availableSpace.getFlexEndInlineOffset());
}





















module.exports = InlineBlockLayoutAlgo;