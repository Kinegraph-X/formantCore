/**
 * 
 * constructor BaseLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;
var TextSizeGetter = require('src/core/TextSizeGetter');
var textSizeGetter = new TextSizeGetter();

var ComputedStyleGetter = require('src/_LayoutEngine/ComputedStyleGetter');
var LayoutDimensionsGetSet = require('src/_LayoutEngine/LayoutDimensionsGetSet');


/*
 * 
 */
var BaseLayoutAlgo = function(layoutNode, layoutDimensionsBuffer) {
	this.objectType = 'BaseLayoutAlgo';
	this.algoName = '';
	this.layoutNode = layoutNode;
	this.availableSpace = this.layoutNode.availableSpace;
	this.flexCtx = new LayoutTypes.FlexContext();
	
//	if (this.layoutNode._parent) {
		this.cs = new ComputedStyleGetter(this);
		this.dimensions = new LayoutDimensionsGetSet(layoutNode, this, layoutDimensionsBuffer);
		
		// EXPLICIT DIMENSIONS
		this.hasExplicitWidth = this.getHasExplicitWidth();
		this.hasExplicitHeight = this.getHasExplicitHeight();
		// IS FLEX CHILD
		this.isFlexChild = false;
		this.isIndirectFlexChild = false;
		this.shouldGrow = this.getShouldGrow();
		this.shouldShrink = this.getShouldShrink();
		// PSEUDO-VIRTUAL FUNCTIONS
		this.setFlexDimensions = function() {};
		this.setParentDimensions = function() {};
		this.updateParentDimensions = function() {};
//	}
}

BaseLayoutAlgo.prototype = {};
BaseLayoutAlgo.prototype.objectType = 'BaseLayoutAlgo';

BaseLayoutAlgo.prototype.setFlexCtx = function(layoutAlgo, parentCtxUID) {
	
	if (layoutAlgo.layoutNode._parent.layoutAlgo.isFlexChild || layoutAlgo.layoutNode._parent.layoutAlgo.isIndirectFlexChild) {
		this.isIndirectFlexChild = true;
		this.flexCtx = layoutAlgo.layoutNode._parent.layoutAlgo.flexCtx;
	}
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex) {
		this.isFlexChild = true;
		this.isIndirectFlexChild = false;
		this.flexCtx = layoutAlgo.layoutNode._parent.layoutAlgo.flexCtx;
	}
		
	if (layoutAlgo.algoName === this.layoutAlgosAsConstants.flex) {
		var parentFlexContext = this.layoutNode._parent.layoutAlgo.flexCtx._UID ? this.layoutNode._parent.layoutAlgo.flexCtx : null;
		
		this.flexCtx = new LayoutTypes.FlexContext(
			UIDGenerator.newUID(),
			parentFlexContext
		);
		TypeManager.flexCtxRegistry.setItem(this.flexCtx._UID, this.flexCtx);
		TypeManager.layoutCallbackRegistry.setItem(this.flexCtx._UID, {
			firstLevel : [],
			subLevels : []
		});
		// TODO: reset all layoutCallbackRegistry when no parent flexCtx
	}
	
	if (typeof parentCtxUID !== 'undefined' && parentCtxUID !== this.flexCtx._UID) {
		var parentCtx = TypeManager.flexCtxRegistry.getItem(parentCtxUID);
		parentCtx.childCtxList[this.flexCtx._UID] = this.flexCtx;
	}
}

BaseLayoutAlgo.prototype.setAvailableSpace = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	this.availableSpace.inline = dimensions.inline - summedInlinePaddings;
	this.availableSpace.block = dimensions.block - summedBlockPaddings;
	this.availableSpace.inlineOffset = this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth();
	this.availableSpace.blockOffset = this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth();
}

BaseLayoutAlgo.prototype.resetAvailableSpace = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
	this.availableSpace.inline = dimensions.inline - summedInlinePaddings;
	this.availableSpace.block = dimensions.block - summedBlockPaddings;
	this.availableSpace.inlineOffset = this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth();
	this.availableSpace.blockOffset = this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth();
}

BaseLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {
	this.availableSpace.inline -= amountToSubstract;
}

BaseLayoutAlgo.prototype.decrementBlockAvailableSpace = function(amountToSubstract) {
	this.availableSpace.block -= amountToSubstract;
}

BaseLayoutAlgo.prototype.incrementInlineAvailableSpace = function(amountToAdd) {
	this.availableSpace.inline += amountToSubstract;
}

BaseLayoutAlgo.prototype.incrementBlockAvailableSpace = function(amountToAdd) {
	this.availableSpace.block += amountToSubstract;
}

BaseLayoutAlgo.prototype.resetAvailableSpaceLastOffsets = function() {
	this.availableSpace.lastOffset.inline = this.availableSpace.inline;
	this.availableSpace.lastOffset.block = this.availableSpace.block;
}

BaseLayoutAlgo.prototype.setAvailableSpaceOffsets = function(inlineOffset, blockOffset) {
	this.availableSpace.inlineOffset = inlineOffset;
	this.availableSpace.blockOffset = blockOffset;
	this.availableSpace.lastOffset = new CoreTypes.DimensionsPair([inlineOffset, blockOffset]);
}

BaseLayoutAlgo.prototype.resetInlineAvailableSpaceOffset = function(value) {
	if (value)
		this.availableSpace.inlineOffset = value;
	else
		this.availableSpace.inlineOffset = this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth();
	this.availableSpace.lastOffset.inline = this.availableSpace.inlineOffset;
}

BaseLayoutAlgo.prototype.resetBlockAvailableSpaceOffset = function(value) {
	if (value)
		this.availableSpace.blockOffset = value;
	else
		this.availableSpace.blockOffset = this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth();
	this.availableSpace.lastOffset.block = this.availableSpace.blockOffset;
}

BaseLayoutAlgo.prototype.resetInlineAvailableSpaceTempOffset = function() {
	this.availableSpace.tempOffset.inline = this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth();
}

BaseLayoutAlgo.prototype.resetBlockAvailableSpaceTempOffset = function() {
	this.availableSpace.tempOffset.block = this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth();
}

BaseLayoutAlgo.prototype.setBlockAvailableSpace = function(amountToSubstract) {}

BaseLayoutAlgo.prototype.setOffsets = function() {}							// virtual

BaseLayoutAlgo.prototype.getDimensions = function() {}						// virtual

BaseLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {}		// virtual

BaseLayoutAlgo.prototype.updateParentAvailableSpace = function(dimensions) {}	// virtual

BaseLayoutAlgo.prototype.setParentDimensions = function(dimensions) {}		// virtual

BaseLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {}	// virtual

BaseLayoutAlgo.prototype.getHasExplicitWidth = function() {
	return !this.cs.getWidthIsInitialValue();
}

BaseLayoutAlgo.prototype.getHasExplicitHeight = function() {
	return !this.cs.getHeightIsInitialValue();
}

BaseLayoutAlgo.prototype.getInlineDimension = function() {
	return this.cs.getWidth();
}

BaseLayoutAlgo.prototype.getBlockDimension = function() {
	return this.cs.getHeight();
}

BaseLayoutAlgo.prototype.getShouldGrow = function() {
	return !!this.cs.getFlexGrow();
}

BaseLayoutAlgo.prototype.getShouldShrink = function() {
	return !!this.cs.getFlexShrink();
}

BaseLayoutAlgo.prototype.getSummedInlineMargins = function() {
	return this.cs.getSummedInlineMargins();
}

BaseLayoutAlgo.prototype.getSummedBlockMargins = function() {
	return this.cs.getSummedBlockMargins();
}

BaseLayoutAlgo.prototype.getSummedInlinePaddings = function() {
	return this.cs.getSummedInlinePaddings();
}

BaseLayoutAlgo.prototype.getSummedBlockPaddings = function() {
	return this.cs.getSummedBlockPaddings();
}

BaseLayoutAlgo.prototype.getSummedInlineBorders = function() {
	return this.cs.getSummedInlineBorders();
}

BaseLayoutAlgo.prototype.getSummedBlockBorders = function() {
	return this.cs.getSummedBlockBorders();
}

BaseLayoutAlgo.prototype.getInlineOffsetforAutoMargins = function() {
	if (this.cs.getMarginInlineStartAsString() === this.keywordsAsConstants.auto
		&& this.cs.getMarginInlineEndAsString() === this.keywordsAsConstants.auto) {
		return this.layoutNode._parent.availableSpace.inline / 2;
	}
	return 0;
}

BaseLayoutAlgo.prototype.getBlockOffsetforAutoMargins = function() {
	if (this.cs.getMarginBlockStartAsString() === this.keywordsAsConstants.auto
		&& this.cs.getMarginBlockEndAsString() === this.keywordsAsConstants.auto) {
		return this.layoutNode._parent.availableSpace.block / 2;
	}
	return 0;
}

/**
 * @method getTextDimensions
 * @param {String} textContent
 */
BaseLayoutAlgo.prototype.getTextDimensions = function(textContent) {
//	console.log(this.getFontStyle());
	if (!textContent.length)
		return [0, 0];
	var textSize = textSizeGetter.getTextSizeDependingOnStyle(
			textContent,
			this.getFontStyle()
		);
	return [textSize[0], this.cs.getLineHeight()];
}

/**
 * @method getAugmentedTextDimensions
 * @param {String} textContent
 */
BaseLayoutAlgo.prototype.getAugmentedTextDimensions = function(textContent) {
//	console.log(this.getAugmentedFontStyle());
	if (!textContent.length)
		return [0, 0];
	var textSize = textSizeGetter.getTextSizeDependingOnStyle(
			textContent,
			this.getAugmentedFontStyle()
		);
	return [textSize[0], this.cs.getLineHeight()];
}

/**
 * @method getFontStyle
 * 
 */
BaseLayoutAlgo.prototype.getFontStyle = function() {
	// Should be 13px, as accounted by the browser,
	// but effective size in canvas differs from effective size in the browser.
	// As we're only interested by the size in the canvas,
	// let's assume the fontSize needs to be augmented by 1 px

	return this.cs.getFontSizeAsString()
		+ ' '
		+ this.cs.getFontFamily()
}

/**
 * @method getAugmentedFontStyle
 * 
 */
BaseLayoutAlgo.prototype.getAugmentedFontStyle = function() {
	return (this.cs.getFontSize() + 1).toString()
		+ this.cs.getFontSizeUnitAsString()
		+ ' '
		+ this.cs.getFontFamily()
}

BaseLayoutAlgo.prototype.layoutAlgosAsConstants = {
	inline : 'inline',
	block : 'block',
	inlineBlock : 'inline-block',
	flex : 'flex',
	text : 'text',
	none : 'none'
}

BaseLayoutAlgo.prototype.flexDirectionsAsConstants = {
	row : 'row',
	column : 'column'
}

BaseLayoutAlgo.prototype.boxModelValuesAsConstants = {
	contentBox : 'content-box',
	borderBox : 'border-box'
}

BaseLayoutAlgo.prototype.keywordsAsConstants = {
	auto : 'auto'
}

BaseLayoutAlgo.prototype.relevantNodeNamesAsConstants = {
	input : 'input'
}

BaseLayoutAlgo.prototype.subStringsAsConstants = {
	a : 'a'
}

// UTILITY FUNCTIONS: to be used when matching the selectors
BaseLayoutAlgo.prototype.DHLstr = function(DHL) {
	var ret = '';
	for (var i = 0, l = DHL; i < l; i++) {
		ret += '	';
	}
	return ret;
}

BaseLayoutAlgo.prototype.localDebugLog = function() {
//	var args = Array.prototype.slice.call(arguments);
//	if (args[0] === '')
//		args[0] = '--';
//	args.splice(3, 0, 'color: #FF7F50;');
//	args.splice(2, 0, 'color: #DEB887;');
//	args.splice(1, 0, 'color: #00CED1;');
//	args.splice(0, 0, '%s %c %s %c %s %c %s');
////	console.log(args);
//	console.log.apply(null, args);
}















module.exports = BaseLayoutAlgo;