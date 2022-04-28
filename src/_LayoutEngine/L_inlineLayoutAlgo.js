/**
 * 
 * constructor InlineLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');

//var TextSizeGetter = require('src/core/TextSizeGetter');
//var textSizeGetter = new TextSizeGetter();

//var FontPath = require('src/integrated_libs_&_forks/fontpath_src');

/*
 * 
 */
var InlineLayoutAlgo = function(layoutNode, layoutDimensionsBuffer) {
	BaseLayoutAlgo.call(this, layoutNode, layoutDimensionsBuffer);
	this.objectType = 'InlineLayoutAlgo';
	this.algoName = 'inline';
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	
	this.localDebugLog('InlineLayoutAlgo INIT', this.layoutNode.nodeName, ' ');
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline)
		this.updateParentDimensions = this.updateInlineParentDimensions;
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			&& this.layoutNode._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)
		this.updateParentDimensions = this.updateFlexParentDimensions;
	else if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
		this.updateParentDimensions = this.updateBlockParentDimensions;
		
	// NEW FORMATTING CONTEXT
	// (https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html#normal-flow)
	if (this.layoutNode.previousSibling && this.layoutNode.previousSibling.layoutAlgo.algoName === this.layoutAlgosAsConstants.block) {
		this.layoutNode._parent.availableSpace.lastOffset.block = this.layoutNode._parent.availableSpace.blockOffset;
		this.layoutNode._parent.layoutAlgo.resetAvailableSpace(this.layoutNode._parent.dimensions);
	}
	
	this.setSelfDimensions(this.layoutNode.dimensions);
	this.setAvailableSpace(this.layoutNode.dimensions);
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);
	
	if (this.isIndirectFlexChild) {
		var layoutCallbackRegisryItem = TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID);
		layoutCallbackRegisryItem.subLevels.push(this.layoutNode);
	}
	
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'block layout algo : this.layoutNode.offsets', this.layoutNode.offsets);
}

InlineLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
InlineLayoutAlgo.prototype.objectType = 'InlineLayoutAlgo';

InlineLayoutAlgo.prototype.resetAvailableSpace = function(dimensions) {
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth');
}

/**
 * @method setSelfOffsets
 * 
 */
InlineLayoutAlgo.prototype.setSelfOffsets = function() {
	this.layoutNode.offsets.inline =  this.layoutNode._parent.offsets.marginInline + this.layoutNode._parent.availableSpace.inlineOffset;
	this.layoutNode.offsets.block =  this.layoutNode._parent.offsets.marginBlock + this.layoutNode._parent.availableSpace.blockOffset;
	this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline;
	this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block;
	
//	this.layoutNode.updateCanvasShapeOffsets();
}

InlineLayoutAlgo.prototype.getDimensions = function() {
	if (this.layoutNode.nodeName === this.relevantNodeNamesAsConstants.input) {
		// The MDN doesn't precise which char should be used to count the size of an input of type text
		// We empirically defined that an input with default size holds 20 "a" chars
		var pseudoString = '', dimensions;
		for (var i = 0, l = this.layoutNode.inputLength; i < l; i++)
			pseudoString += this.subStringsAsConstants.a;
		dimensions = this.getTextDimensions(pseudoString);
		// The border of an input is for now forced here, as we have no mean to retrieve the user-agent stylesheets
		dimensions = [dimensions[0], dimensions[1], dimensions[0], dimensions[1], dimensions[0], dimensions[1]];
		return dimensions;
	}
	return [0, 0];
}

InlineLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {
	var summedInlineBorders = this.getSummedInlineBorders();
	var summedBlockBorders = this.getSummedBlockBorders();
	var summedInlineMargins = this.getSummedInlineMargins();
	var summedBlockMargins = this.getSummedBlockMargins();
	
	dimensions.set(this.getDimensions());
	dimensions.setBorderSize([dimensions.borderInline, dimensions.borderBlock]);
	dimensions.addToBorderSize([summedInlineBorders, summedBlockBorders]);
	dimensions.setOuterSize([dimensions.borderInline, dimensions.borderBlock]);
	dimensions.addToOuterSize([summedInlineMargins, summedBlockMargins]);
//	
//	this.layoutNode.availableSpace.inlineOffset += this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth');
//	this.layoutNode.availableSpace.blockOffset += this.layoutNode.computedStyle.bufferedValueToNumber('borderBlockStartWidth');
//	this.layoutNode.updateCanvasShapeDimensions();
}

InlineLayoutAlgo.prototype.setParentDimensions = function(dimensions) {
	var DHL = 0;
	this.localDebugLog(this.DHLstr(DHL), 'inline increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	
	if (this.layoutNode._parent.availableSpace.inline < dimensions.outerInline) {
		this.layoutNode._parent.dimensions.inline += dimensions.inline;
		this.layoutNode._parent.dimensions.borderInline += dimensions.borderInline;
		this.layoutNode._parent.dimensions.outerInline += dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inline = 0;
		this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
	}
	
	this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();
		this.localDebugLog(this.DHLstr(DHL), 'inline increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
		this.layoutNode._parent.dimensions.block = Math.max(this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.block, this.layoutNode._parent.dimensions.block);
		this.layoutNode._parent.dimensions.borderBlock = Math.max(this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.borderBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth(), this.layoutNode._parent.dimensions.borderBlock);
		this.layoutNode._parent.dimensions.outerBlock = Math.max(this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth() + summedParentBlockMargins, this.layoutNode._parent.dimensions.outerBlock);
		this.layoutNode._parent.availableSpace.block = 0;
		this.localDebugLog(this.DHLstr(DHL), 'inline increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	
//	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineLayoutAlgo.prototype.updateInlineParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	console.log('updateInlineParentDimensions');
	if (this.layoutNode._parent.dimensions.inline < dimensions.outerInline) {
		this.layoutNode._parent.dimensions.inline = dimensions.inline;
		this.layoutNode._parent.dimensions.borderInline = dimensions.borderInline;
		this.layoutNode._parent.dimensions.outerInline = dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inline = 0;
		this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode._parent.availableSpace.lastOffset.inline + dimensions.outerInline;
	}
	this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
//	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
	
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
}

InlineLayoutAlgo.prototype.updateBlockParentDimensions = function(dimensions, DHL) {
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_pre', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	if (this.layoutNode._parent.dimensions.inline < dimensions.outerInline) {
		this.layoutNode._parent.dimensions.inline = dimensions.inline;
		this.layoutNode._parent.dimensions.borderInline = dimensions.borderInline;
		this.layoutNode._parent.dimensions.outerInline = dimensions.outerInline;
		this.layoutNode._parent.availableSpace.inline = 0;
		this.layoutNode._parent.availableSpace.inlineOffset = this.layoutNode._parent.availableSpace.lastOffset.inline + dimensions.outerInline;
	}
	
	// FIXME: we shall increment way too many times if we have more than one textNode inside
	this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
	
	if (this.layoutNode._parent.availableSpace.block < dimensions.outerBlock) {
		var summedParentBlockMargins = this.layoutNode._parent.layoutAlgo.getSummedBlockMargins();

		this.layoutNode._parent.dimensions.block = Math.max(this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.block, this.layoutNode._parent.dimensions.block);
		this.layoutNode._parent.dimensions.borderBlock = Math.max(this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.borderBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth(), this.layoutNode._parent.dimensions.borderBlock);
		this.layoutNode._parent.dimensions.outerBlock = Math.max(this.layoutNode._parent.availableSpace.lastOffset.block + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth() + summedParentBlockMargins, this.layoutNode._parent.dimensions.outerBlock);
		this.layoutNode._parent.availableSpace.block = 0;
	}
	
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.inline_post', this.layoutNode._parent.dimensions.inline);
	this.localDebugLog(this.DHLstr(DHL), 'inline update parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
//	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

InlineLayoutAlgo.prototype.updateFlexParentDimensions = function(outerDimensions) {
	
}






















module.exports = InlineLayoutAlgo;