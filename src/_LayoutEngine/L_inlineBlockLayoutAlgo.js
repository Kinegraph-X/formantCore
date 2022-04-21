/**
 * 
 * constructor InlineBlockLayoutAlgo
 *  
 */


//var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var InlineBlockLayoutAlgo = function(layoutNode) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'InlineBlockLayoutAlgo';
	this.algoName = 'inline-block';
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row) {
		this.setFlexDimensions = this.setFlexRowDimensions;
		this.setParentDimensions = this.setFlexRowParentDimensions;
		this.updateParentDimensions = this.updateFlexParentDimensions;
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.setFlexDimensions = this.setFlexColumnDimensions;
		this.setParentDimensions = this.setFlexColumnParentDimensions;
		this.updateParentDimensions = this.updateBlockParentDimensions;
	}
	
	// NEW FORMATTING CONTEXT
	// (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
	if (this.layoutNode.previousSibling && this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.layoutAlgo.resetAvailableSpace(this.layoutNode._parent.dimensions);
	}
	
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setSelfOffsets();
	this.setParentDimensions(this.layoutNode.dimensions);

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
	
//	console.log('remainingAvailableSpace', remainingAvailableSpace);
//	console.log('this.layoutNode._parent.layoutAlgo.algoName', this.layoutNode._parent.layoutAlgo.algoName);
//	console.log('this.layoutNode.computedStyle.bufferedValueToString("flexDirection")', this.layoutNode.computedStyle.bufferedValueToString('flexDirection'));
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& this.layoutNode._parent.layoutAlgo.flexDirection === 'row') {
//		console.log(this.layoutNode._parent.nodeName, this.layoutNode._parent.computedStyle.bufferedValueToString('justifyContent'));
		if (this.layoutNode._parent.computedStyle.bufferedValueToString('justifyContent') === 'space-evenly') {
			this.layoutNode._parent.layoutAlgo.resetInlineAvailableSpaceOffset();
//			console.log(this.layoutNode._parent.availableSpace.inlineOffset, remainingAvailableSpace.inline, this.layoutNode._parent.availableSpace.childCount);
//			this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + remainingAvailableSpace.inline / (this.layoutNode._parent.availableSpace.childCount + 1);
//			this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.offsets.inline + this.layoutNode.dimensions.inline;
			
//			this.setEvenlySpacedOffsets(dimensions);
			
			if (this.layoutNode.isLastChild) {
				this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'setEvenlySpacedOffsets');
				// At last, call the setEvenlySpacedOffsets from here,
				// as the linked list mechanism doesn't allow calling the layout algo
				// (we're still in the Ctor of the layout algo, it isn't yet asigned to a property of the layoutNode)
				this.setEvenlySpacedOffsets(dimensions);
			}
			
//			console.log('this.layoutNode._parent.availableSpace.inlineOffset', this.layoutNode._parent.availableSpace.inlineOffset);
//			console.log('this.layoutNode.offsets.inline', this.layoutNode.offsets.inline); 
		}
		else {
			this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + this.layoutNode._parent.offsets.marginInline + this.getInlineOffsetforAutoMargins();
			this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset + this.layoutNode._parent.offsets.marginBlock + this.getBlockOffsetforAutoMargins();
			this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart');
			this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart');
//			console.log(this.layoutNode.offsets);
		}
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
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
	
	var explicitWidth = this.getInlineDimension();
	dimensions.inline = explicitWidth === null
		? (this.layoutNode._parent && (this.layoutNode._parent.availableSpace.inline - summedInlineBorders - summedInlineMargins))
			|| dimensions.inline - summedInlineMargins
		: explicitWidth;
	
	var explicitHeight = this.getBlockDimension();
	dimensions.block = explicitHeight;
	
	// NORMAL DIMENSIONS
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing') === 'content-box') {
		if (explicitWidth)
			dimensions.add([summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings, summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
	}
	dimensions.setBorderSize([dimensions.inline, dimensions.block]);
	dimensions.addToBorderSize([summedInlineBorders, summedBlockBorders]);
	dimensions.setOuterSize([dimensions.borderInline, dimensions.borderBlock]);
	dimensions.addToOuterSize([summedInlineMargins, summedBlockMargins]);
		
	if (explicitWidth !== null)
		this.layoutNode._parent.layoutAlgo.decrementInlineAvailableSpace(this.layoutNode.dimensions.outerInline);
	
	// FLEX DIMENSIONS
	if (dimensions.inline === 0 && this.layoutNode.computedStyle.bufferedValueToNumber('flexGrow') > 0) {
		this.setFlexDimensions(DHL);
		return;
	}
	else if (dimensions.block === 0 && this.layoutNode.computedStyle.bufferedValueToNumber('flexGrow') > 0) {
		this.setFlexDimensions(DHL);
		return;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
	
	this.layoutNode.updateCanvasShapeDimensions();
}

InlineBlockLayoutAlgo.prototype.setFlexRowDimensions = function(DHL) {
	if (this.layoutNode.isLastChild) {
		this.layoutNode._parent.layoutAlgo.resetInlineAvailableSpaceOffset();
		this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexRowDimensions');
		this.effectiveSetFlexRowDimensions(DHL);
	}
}

InlineBlockLayoutAlgo.prototype.setFlexColumnDimensions = function(DHL) {
	if (this.layoutNode.isLastChild) {
		this.layoutNode._parent.layoutAlgo.resetBlockAvailableSpaceOffset();
		this.layoutNode.climbChildrenLinkedListAndCallbackLayoutAlgo(null, 'effectiveSetFlexColumnDimensions');
		this.effectiveSetFlexColumnDimensions(DHL);
	}
}

InlineBlockLayoutAlgo.prototype.effectiveSetFlexRowDimensions = function(DHL) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	var dimensions = this.layoutNode.dimensions; 
	dimensions.outerBlock = this.getBlockDimension() + summedBlockBorders + summedBlockMargins;
	dimensions.outerInline = this.layoutNode._parent.availableSpace.inline / this.layoutNode._parent.availableSpace.childCount;
	dimensions.setBorderSize([dimensions.outerInline, dimensions.outerBlock]);
	dimensions.substractFromBorderSize([summedInlineMargins, summedBlockMargins]);
	dimensions.setInnerSize([dimensions.borderInline, dimensions.borderBlock])
	dimensions.substractFromInnerSize([summedInlineBorders, summedBlockBorders]);
	
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing') === 'content-box')
		dimensions.substract([0, summedBlockPaddings, 0, summedBlockPaddings, 0, summedBlockPaddings]);
	
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
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	var dimensions = this.layoutNode.dimensions;
	dimensions.outerInline = this.getInlineDimension() + summedInlineBorders + summedInlineMargins;
	dimensions.outerBlock = this.layoutNode._parent.availableSpace.block / this.layoutNode._parent.availableSpace.childCount;
	dimensions.setBorderSize([dimensions.outerInline, dimensions.outerBlock]);
	dimensions.substractFromBorderSize([summedInlineMargins, summedBlockMargins]);
	dimensions.setInnerSize([dimensions.borderInline, dimensions.borderBlock])
	dimensions.substractFromInnerSize([summedInlineBorders, summedBlockBorders]);
	
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing') === 'content-box')
		dimensions.substract([summedInlinePaddings, 0, summedInlinePaddings, 0, summedInlinePaddings, 0]);
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.inline_post', this.layoutNode.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block set dimensions', this.layoutNode.nodeName, 'this.layoutNode.dimensions.block_post', this.layoutNode.dimensions.block);
	this.layoutNode.updateCanvasShapeDimensions();
	
	this.setSelfOffsets();
	if (!this.layoutNode.isLastChild) {
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	}
}

InlineBlockLayoutAlgo.prototype.resetParentAvailableSpace = function() {
	
}

//InlineBlockLayoutAlgo.prototype.updateParentAvailableSpace = function(dimensions) {
//	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
//			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row) {
//		this.layoutNode._parent.layoutAlgo.availableSpace.inline -= dimensions.inline;
//	}
//	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
//			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
//		this.layoutNode._parent.layoutAlgo.availableSpace.block -= dimensions.block;
//	}
//	else {
//		this.layoutNode._parent.layoutAlgo.availableSpace.inline -= dimensions.inline;
//	}
//}

InlineBlockLayoutAlgo.prototype.setFlexRowParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
//	var summedParentInlineBorders = this.layoutNode._parent.layoutAlgo.getSummedInlineBorders();
	var summedParentBlockBorders = this.layoutNode._parent.layoutAlgo.getSummedBlockBorders();
//	var summedParentInlineMargins = this.layoutNode._parent.layoutAlgo.getSummedInlineMargins();
	var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
	
//	if (this.layoutNode._parent.dimensions.inline < dimensions.outerInline) {
//		var parentInlineDimensions = this.layoutNode._parent.availableSpace.inlineOffset + dimensions.outerInline + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderInlineEndWidth');
//		this.layoutNode._parent.dimensions.inline = parentInlineDimensions - summedParentInlineBorders;
//		this.layoutNode._parent.dimensions.borderInline = parentInlineDimensions;
//		this.layoutNode._parent.dimensions.outerInline = parentInlineDimensions + summedParentInlineMargins;
		this.layoutNode._parent.availableSpace.lastOffset.inline = this.layoutNode._parent.availableSpace.inlineOffset;
		this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
//	}
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
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd') + this.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
		this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
		this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
		this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins
		this.layoutNode._parent.availableSpace.block = 0;
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += dimensions.outerBlock;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline-block increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
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

InlineBlockLayoutAlgo.prototype.getInlineDimension = function() {
//	console.log(this.layoutNode.computedStyle.getPosForProp('width') * this.layoutNode.computedStyle.itemSize, this.layoutNode.computedStyle._buffer);
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('width'));
	return this.layoutNode.computedStyle.bufferedValueToNumber('width');
}

InlineBlockLayoutAlgo.prototype.getBlockDimension = function() {
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('height'));
	return this.layoutNode.computedStyle.bufferedValueToNumber('height');
}

InlineBlockLayoutAlgo.prototype.getMargins = function() {
	
}

InlineBlockLayoutAlgo.prototype.getInlineMargins = function() {
	
}

InlineBlockLayoutAlgo.prototype.getSummedInlineMargins = function() {
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('marginLeft'));
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineEnd');
}

InlineBlockLayoutAlgo.prototype.getBlockMargins = function() {
	
}

InlineBlockLayoutAlgo.prototype.getSummedBlockMargins = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockEnd');
}

InlineBlockLayoutAlgo.prototype.getPaddings = function() {
	
}

InlineBlockLayoutAlgo.prototype.getSummedInlinePaddings = function() {
		return this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineEnd');
}

InlineBlockLayoutAlgo.prototype.getSummedBlockPaddings = function() {
		return this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockEnd');
}
























module.exports = InlineBlockLayoutAlgo;