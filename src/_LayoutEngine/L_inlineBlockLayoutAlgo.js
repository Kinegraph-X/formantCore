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
	
	this.resetInlineAvailableSpaceOffset();
	this.resetBlockAvailableSpaceOffset();
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);

	
}

InlineBlockLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
InlineBlockLayoutAlgo.prototype.objectType = 'InlineBlockLayoutAlgo';

InlineBlockLayoutAlgo.prototype.setAvailableSpace = function(dimensions) {
	if (this.flexDirection === 'row')
		this.availableSpace.inline = dimensions.inline;
	else
		this.availableSpace.block = dimensions.block;
}

InlineBlockLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {
	this.availableSpace.inline -= amountToSubstract;
}

InlineBlockLayoutAlgo.prototype.decrementBlockAvailableSpace = function(amountToSubstract) {
	this.availableSpace.block -= amountToSubstract;
}

InlineBlockLayoutAlgo.prototype.resetInlineAvailableSpaceOffset = function() {
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart');
}

InlineBlockLayoutAlgo.prototype.resetBlockAvailableSpaceOffset = function() {
	this.availableSpace.blockOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart');
}
InlineBlockLayoutAlgo.prototype.getUpToDateRemainingAvailableSpace = function() {
//	console.log(this.layoutNode.dimensions);
	return new CoreTypes.DimensionsPair([
		this.layoutNode._parent.availableSpace.inline - this.layoutNode.dimensions.inline,
		this.layoutNode._parent.availableSpace.block - this.layoutNode.dimensions.block
	]);
}

InlineBlockLayoutAlgo.prototype.setOffsets = function(dimensions) {
	// this.layoutNode.dimensions is actualy computed but _parent.AvailableSpace is not computed yet
	
//	console.log('remainingAvailableSpace', remainingAvailableSpace);
//	console.log('this.layoutNode._parent.layoutAlgo.algoName', this.layoutNode._parent.layoutAlgo.algoName);
//	console.log('this.layoutNode.computedStyle.bufferedValueToString("flexDirection")', this.layoutNode.computedStyle.bufferedValueToString('flexDirection'));
	if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			&& this.layoutNode.computedStyle.bufferedValueToString('flexDirection') === 'row') {
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
			this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset;
			this.layoutNode._parent.availableSpace.inlineOffset += dimensions.inline;
			this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset;
//			console.log(this.layoutNode.offsets);
		}
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			|| this.layoutNode._parent.layoutAlgo.algoName === 'block') {
		this.layoutNode.offsets.blockOffset = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.availableSpace.blockOffset += dimensions.block;
		this.layoutNode.offsets.block -= dimensions.block;
	}
	else {
		this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset;
		this.layoutNode._parent.availableSpace.inlineOffset += dimensions.inline;
		this.layoutNode.offsets.block = this.layoutNode._parent.availableSpace.blockOffset;
	}
}

InlineBlockLayoutAlgo.prototype.setEvenlySpacedOffsets = function(dimensions) {
//	console.log('called setEvenlySpacedOffsets', this.layoutNode.nodeName, 'this.layoutNode.isLastChild', this.layoutNode.isLastChild);
	var remainingAvailableSpace = this.getUpToDateRemainingAvailableSpace();
//	console.log(remainingAvailableSpace);
	this.layoutNode.offsets.inline = this.layoutNode._parent.availableSpace.inlineOffset + remainingAvailableSpace.inline / (this.layoutNode._parent.availableSpace.childCount + 1);
	this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode.offsets.inline + this.layoutNode.dimensions.inline;
}

InlineBlockLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	
	dimensions.inline = this.getInlineDimension();
	var explicitWidth = this.getBlockDimension();
	dimensions.block = explicitWidth;
	this.setAvailableSpace(dimensions);
	
	if (this.layoutNode.computedStyle.bufferedValueToString('boxSizing', 'repr') === 'content-box') {
		if (explicitWidth)
			dimensions.add([summedInlinePaddings, summedBlockPaddings]);
		else
			dimensions.add([0, summedBlockPaddings]);
		// Here inlineAvailableSpace is the same as the already computed available size
			
			
	}
	else
		this.decrementInlineAvailableSpace(summedInlinePaddings);
	
	this.layoutNode._parent.availableSpace.childCount++;
		
//	console.log('this.availableSpace', this.availableSpace);
//	console.log(dimensions);
}

InlineBlockLayoutAlgo.prototype.resetParentAvailableSpace = function() {
	
}

InlineBlockLayoutAlgo.prototype.updateParentAvailableSpace = function(dimensions) {
	if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			&& this.layoutNode.computedStyle.bufferedValueToString('flexDirection') === 'row') {
//		this.layoutNode._parent.layoutAlgo.availableSpace.inlineOffset += dimensions.inline;
//		console.log(this.layoutNode._parent.layoutAlgo.availableSpace);
		this.layoutNode._parent.layoutAlgo.availableSpace.inline -= dimensions.inline;
//		console.log(this.layoutNode._parent.layoutAlgo.availableSpace);
	}
	else if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			|| this.layoutNode._parent.layoutAlgo.algoName === 'block') {
//		this.layoutNode._parent.layoutAlgo.availableSpace.blockOffset += dimensions.block;
		this.layoutNode._parent.layoutAlgo.availableSpace.block -= dimensions.block;
	}
	else {
//		this.layoutNode._parent.layoutAlgo.availableSpace.inlineOffset += dimensions.inline;
		this.layoutNode._parent.layoutAlgo.availableSpace.inline -= dimensions.inline;
	}
}

InlineBlockLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
	
//	console.log('call to update parent dimensions');
	this.updateParentDimensions(dimensions);
	this.updateParentAvailableSpace(dimensions);
//	console.log(dimensions.block);
}

InlineBlockLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {
	
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	// TODO: maybe optimize : this could be achieved with the instanceof keyword => benchmark
//	if (['block', 'flex'].indexOf(this.layoutNode._parent.layoutAlgo.algoName) !== -1) {
	if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			&& this.layoutNode.computedStyle.bufferedValueToString('flexDirection') === 'row') {
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
	else if (this.layoutNode._parent.layoutAlgo.algoName === 'flex'
			|| this.layoutNode._parent.layoutAlgo.algoName === 'block') {
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