/**
 * 
 * constructor BaseLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var TextSizeGetter = require('src/core/TextSizeGetter');
var textSizeGetter = new TextSizeGetter();

var ComputedStyleGetter = require('src/_LayoutEngine/ComputedStyleGetter');


/*
 * 
 */
var BaseLayoutAlgo = function(layoutNode) {
	this.objectType = 'BaseLayoutAlgo';
	this.algoName = '';
	this.layoutNode = layoutNode;
	this.availableSpace = this.layoutNode.availableSpace;
	
	ComputedStyleGetter.call(this);
	
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
}

BaseLayoutAlgo.prototype = {};
BaseLayoutAlgo.prototype.objectType = 'BaseLayoutAlgo';

BaseLayoutAlgo.prototype.setAvailableSpace = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
//	var summedInlineBorders = this.getSummedInlineBorders();
//	var summedBlockBorders = this.getSummedBlockBorders();
	this.availableSpace.inline = dimensions.inline - summedInlinePaddings;
	this.availableSpace.block = dimensions.block - summedBlockPaddings;
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth');
	this.availableSpace.blockOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderBlockStartWidth');
}

BaseLayoutAlgo.prototype.resetAvailableSpace = function(dimensions) {
	var summedInlinePaddings = this.getSummedInlinePaddings();
	var summedBlockPaddings = this.getSummedBlockPaddings();
//	var summedInlineBorders = this.getSummedInlineBorders();
//	var summedBlockBorders = this.getSummedBlockBorders();
	this.availableSpace.inline = dimensions.inline - summedInlinePaddings;
	this.availableSpace.block = dimensions.block - summedBlockPaddings;
	this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth');
	this.availableSpace.blockOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderBlockStartWidth');
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
		this.availableSpace.inlineOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth');
	this.availableSpace.lastOffset.inline = this.availableSpace.inlineOffset;
//	console.log(this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart'), this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth'));
}

BaseLayoutAlgo.prototype.resetBlockAvailableSpaceOffset = function(value) {
	if (value)
		this.availableSpace.blockOffset = value;
	else
		this.availableSpace.blockOffset = this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('borderBlockStartWidth');
	this.availableSpace.lastOffset.block = this.availableSpace.blockOffset;
}

BaseLayoutAlgo.prototype.setBlockAvailableSpace = function(amountToSubstract) {}

BaseLayoutAlgo.prototype.setOffsets = function() {}							// virtual

BaseLayoutAlgo.prototype.getDimensions = function() {}						// virtual

BaseLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {}		// virtual

BaseLayoutAlgo.prototype.updateParentAvailableSpace = function(dimensions) {}	// virtual

BaseLayoutAlgo.prototype.setParentDimensions = function(dimensions) {}		// virtual

BaseLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {}	// virtual

BaseLayoutAlgo.prototype.getHasExplicitWidth = function() {
	return !this.layoutNode.computedStyle.getIsInitialValueAsBool('width');
}

BaseLayoutAlgo.prototype.getHasExplicitHeight = function() {
	return !this.layoutNode.computedStyle.getIsInitialValueAsBool('height');
}

BaseLayoutAlgo.prototype.getInlineDimension = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('width');
}

BaseLayoutAlgo.prototype.getBlockDimension = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('height');
}

BaseLayoutAlgo.prototype.getShouldGrow = function() {
	return !!this.layoutNode.computedStyle.bufferedValueToNumber('flexGrow');
}

BaseLayoutAlgo.prototype.getShouldShrink = function() {
	return !!this.layoutNode.computedStyle.bufferedValueToNumber('flexShrink');
}

BaseLayoutAlgo.prototype.getSummedInlineMargins = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginInlineEnd');
}

BaseLayoutAlgo.prototype.getSummedBlockMargins = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('marginBlockEnd');
}

BaseLayoutAlgo.prototype.getSummedInlinePaddings = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineEnd');
}

BaseLayoutAlgo.prototype.getSummedBlockPaddings = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart') + this.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockEnd');
}

BaseLayoutAlgo.prototype.getSummedInlineBorders = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('borderBlockStartWidth') + this.layoutNode.computedStyle.bufferedValueToNumber('borderBlockEndWidth');
}

BaseLayoutAlgo.prototype.getSummedBlockBorders = function() {
	return this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStartWidth') + this.layoutNode.computedStyle.bufferedValueToNumber('borderInlineEndWidth');
}

BaseLayoutAlgo.prototype.getInlineOffsetforAutoMargins = function() {
	if (this.layoutNode.computedStyle.bufferedValueToString('marginInlineStart') === 'auto'
		&& this.layoutNode.computedStyle.bufferedValueToString('marginInlineEnd') === 'auto') {
//		this.layoutNode._parent.layoutAlgo.decrementInlineAvailableSpace(this.layoutNode.dimensions.outerInline);
		return this.layoutNode._parent.availableSpace.inline / 2;
	}
	return 0;
}

BaseLayoutAlgo.prototype.getBlockOffsetforAutoMargins = function() {
	if (this.layoutNode.computedStyle.bufferedValueToString('marginBlockStart') === 'auto'
		&& this.layoutNode.computedStyle.bufferedValueToString('marginBlockEnd') === 'auto') {
//		this.layoutNode._parent.layoutAlgo.decrementBlockAvailableSpace(this.layoutNode.dimensions.outerBlock);
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
	return [textSize[0], this.layoutNode.computedStyle.bufferedValueToNumber('lineHeight')];
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
	return [textSize[0], this.layoutNode.computedStyle.bufferedValueToNumber('lineHeight')];
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

	return this.layoutNode.computedStyle.bufferedValueToString('fontSize')
		+ ' '
		+ this.layoutNode.computedStyle.bufferedValueToString('fontFamily')
}

/**
 * @method getAugmentedFontStyle
 * 
 */
BaseLayoutAlgo.prototype.getAugmentedFontStyle = function() {
	return (this.layoutNode.computedStyle.bufferedValueToNumber('fontSize') + 1).toString()
		+ this.layoutNode.computedStyle.getProp('fontSize').getUnitAsString()
		+ ' '
		+ this.layoutNode.computedStyle.bufferedValueToString('fontFamily')
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

// UTILITY FUNCTIONS: to be used when matching the selectors
BaseLayoutAlgo.prototype.DHLstr = function(DHL) {
	var ret = '';
	for (var i = 0, l = DHL; i < l; i++) {
		ret += '	';
	}
	return ret;
}

BaseLayoutAlgo.prototype.localDebugLog = function() {
	var args = Array.prototype.slice.call(arguments);
	if (args[0] === '')
		args[0] = '--';
	args.splice(3, 0, 'color: #FF7F50;');
	args.splice(2, 0, 'color: #DEB887;');
	args.splice(1, 0, 'color: #00CED1;');
	args.splice(0, 0, '%s %c %s %c %s %c %s');
//	console.log(args);
	console.log.apply(null, args);
}















module.exports = BaseLayoutAlgo;