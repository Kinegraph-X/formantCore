/**
 * 
 * constructor BaseLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var UIDGenerator = require('src/core/UIDGenerator').NodeUIDGenerator;
var TextSizeGetter = require('src/core/TextSizeGetter');
var textSizeGetter = new TextSizeGetter();

var ComputedStyleGetter = require('src/_LayoutEngine/ComputedStyleFastGetter');
var LayoutAvailableSpaceGetSet = require('src/_LayoutEngine/LayoutAvailableSpaceGetSet');
var LayoutDimensionsGetSet = require('src/_LayoutEngine/LayoutDimensionsGetSet');
var LayoutOffsetsGetSet = require('src/_LayoutEngine/LayoutOffsetsGetSet');
var testArray = new DataView(new ArrayBuffer(8));

/*
 * 
 */
var BaseLayoutAlgo = function(layoutNode) {
	this.objectType = 'BaseLayoutAlgo';
	this.algoName = '';
	this.layoutNode = layoutNode;
	
	this.flexCtx = new LayoutTypes.FlexContext();
	this.textSizeHackFactor = 1.021;
}

BaseLayoutAlgo.prototype = {};
BaseLayoutAlgo.prototype.objectType = 'BaseLayoutAlgo';


BaseLayoutAlgo.prototype.setRefsToParents = function(layoutNode) {
	this.parentNode = layoutNode._parent;
	this.parentLayoutAlgo = layoutNode._parent.layoutAlgo;
	this.parentDimensions = layoutNode._parent.layoutAlgo.dimensions;
}

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
		TypeManager.layoutCallbacksRegistry.setItem(this.flexCtx._UID, {
			firstLevel : [],
			subLevels : []
		});
		// TODO: reset all layoutCallbacksRegistry when no parent flexCtx
	}
	
	if (this.isIndirectFlexChild) {
		var layoutCallbackRegisryItem;
		if (this.algoName === this.layoutAlgosAsConstants.flex) {
			// CAUTION: Here is flexCtx._parent._UID assigned: only case where is indirect flexChild but is flexContext-host
			layoutCallbackRegisryItem = TypeManager.layoutCallbacksRegistry.getItem(this.flexCtx._parent._UID);
		}
		else
			layoutCallbackRegisryItem = TypeManager.layoutCallbacksRegistry.getItem(this.flexCtx._UID);
		layoutCallbackRegisryItem.subLevels.push(this.layoutNode);
	}
	
	if (typeof parentCtxUID !== 'undefined' && parentCtxUID !== this.flexCtx._UID) {
		var parentCtx = TypeManager.flexCtxRegistry.getItem(parentCtxUID);
		parentCtx.childCtxList[this.flexCtx._UID] = this.flexCtx;
	}
}


BaseLayoutAlgo.prototype.setAvailableSpace = function() {
	this.availableSpace.setInline(this.dimensions.getInline() - this.getSummedInlinePaddings());
	this.availableSpace.setBlock(this.dimensions.getBlock() - this.getSummedBlockPaddings());
	this.availableSpace.setInlineOffset(this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth());
	this.availableSpace.setBlockOffset(this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth());
}

BaseLayoutAlgo.prototype.resetAvailableSpace = function() {
	this.setAvailableSpace();
}


BaseLayoutAlgo.prototype.resetInlineAvailableSpace = function() {
	this.availableSpace.setInline(this.dimensions.getInline() - this.getSummedInlinePaddings());
	this.availableSpace.setInlineOffset(this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth());
}

BaseLayoutAlgo.prototype.resetBlockAvailableSpace = function() {
	this.availableSpace.setBlock(this.dimensions.getBlock() - this.getSummedBlockPaddings());
	this.availableSpace.setBlockOffset(this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth());
}


BaseLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {
	this.availableSpace.setInline(this.availableSpace.getInline() - amountToSubstract);
}

BaseLayoutAlgo.prototype.decrementBlockAvailableSpace = function(amountToSubstract) {
	this.availableSpace.setBlock(this.availableSpace.getBlock() - amountToSubstract);
}

BaseLayoutAlgo.prototype.incrementInlineAvailableSpace = function(amountToAdd) {
	this.availableSpace.setInline(this.availableSpace.getInline() + amountToAdd);
}

BaseLayoutAlgo.prototype.incrementBlockAvailableSpace = function(amountToAdd) {
	this.availableSpace.setBlock(this.availableSpace.getBlock() + amountToAdd);
}

BaseLayoutAlgo.prototype.resetAvailableSpaceLastOffsets = function() {
	this.availableSpace.setLastInlineOffset(this.availableSpace.getInlineOffset());
	this.availableSpace.setLastBlockOffset(this.availableSpace.getBlockOffset());
}

BaseLayoutAlgo.prototype.setAvailableSpaceOffsets = function(inlineOffset, blockOffset) {
	this.availableSpace.setInlineOffset(inlineOffset);
	this.availableSpace.setBlockOffset(blockOffset);
	this.availableSpace.setLastInlineOffset(inlineOffset);
	this.availableSpace.setLastBlockOffset(blockOffset);
}

BaseLayoutAlgo.prototype.resetInlineAvailableSpaceOffset = function(value) {
	this.availableSpace.setInlineOffset(this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth());
	this.availableSpace.setLastInlineOffset(this.availableSpace.getInlineOffset());
}

BaseLayoutAlgo.prototype.resetBlockAvailableSpaceOffset = function(value) {
	this.availableSpace.setBlockOffset(this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth());
	this.availableSpace.setLastBlockOffset(this.availableSpace.getBlockOffset());
}

BaseLayoutAlgo.prototype.resetInlineAvailableSpaceTempOffset = function() {
	this.availableSpace.setTempInlineOffset(this.cs.getPaddingInlineStart() + this.cs.getBorderInlineStartWidth());
}

BaseLayoutAlgo.prototype.resetBlockAvailableSpaceTempOffset = function() {
	this.availableSpace.setTempBlockOffset(this.cs.getPaddingBlockStart() + this.cs.getBorderBlockStartWidth());
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
		return this.parentLayoutAlgo.availableSpace.getInline() / 2;
	}
	return 0;
}

BaseLayoutAlgo.prototype.getBlockOffsetforAutoMargins = function() {
	if (this.cs.getMarginBlockStartAsString() === this.keywordsAsConstants.auto
		&& this.cs.getMarginBlockEndAsString() === this.keywordsAsConstants.auto) {
		return this.parentLayoutAlgo.availableSpace.getBlock() / 2;
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
	return [textSize[0] * 1.021, this.cs.getLineHeight()]; // - textSize[0] / 84
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
	return (this.cs.getFontSize()).toString()		//  + 1
		+ this.cs.getFontSizeUnitAsString()
		+ ' '
		+ this.cs.getFontFamily()
}

/**
 * @method getTextWidthCustom
 * @param {String} textContent
 */
BaseLayoutAlgo.prototype.getTextWidthCustom = function(textContent) {
	if (!textContent.length)
		return 0;
	
	var fontSizeBuffer = TypeManager.fontSizeBuffersCache.cache[this.cs.getFontSize() + 'px ' + this.cs.getFontFamily()];
	
	var words = textContent.split(' ');
	var wordSize = 0;
	var totalSize = words.reduce(function(acc, word, key) {
		wordSize = fontSizeBuffer.getWidthOfWord(word);
		return key !== words.length - 1 ? fontSizeBuffer.getWidthOfSpace() + acc + wordSize : acc + wordSize;
	}, 0)
	
	return totalSize * this.textSizeHackFactor;
}

/**
 * @method getTextWidthCustom
 * @param {String} textContent
 */
BaseLayoutAlgo.prototype.getBoundOfTextLine = function(textContent, maxWidth) {
	var fontSizeBuffer = TypeManager.fontSizeBuffersCache.cache[this.cs.getFontSize() + 'px ' + this.cs.getFontFamily()];
	var wordSize = 0, totalSize = 0, returnedSize = 0, i = 0;
	
	var words = textContent.split(' ');
//	console.log(words, maxWidth);
	var wordList = [];
	
	while (i < words.length) {
		wordSize = fontSizeBuffer.getWidthOfWord(words[i]);
		totalSize += i !== words.length - 1 ? fontSizeBuffer.getWidthOfSpace() + wordSize : wordSize
		if (totalSize > maxWidth)
			break;
		wordList.push(words[i]);
		returnedSize = totalSize;
//		console.log(wordList);
		i++;
	}
	
	return [wordList.join(' '), returnedSize];
}







/**
 * @method max
 * 
 */
BaseLayoutAlgo.prototype.max = function(value1, value2) {
	testArray.setInt32(0, value2);
	testArray.setInt32(4, value1);
	return testArray.getInt32(+(value1 > value2) * 4);
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