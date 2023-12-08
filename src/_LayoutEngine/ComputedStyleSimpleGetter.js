/**
 * @constructor ComputedStyleSimpleGetter
 * 
 */
 
 
 var CSSProps = require('src/editing/CSSPropertyDescriptors').all;

 
 
 var ComputedStyleSimpleGetter = function(layoutAlgo) {
	this.computedStyle = layoutAlgo.layoutNode.computedStyle;
	
	this.getPaddingFunctions(layoutAlgo);
	this.getBorderFunctions(layoutAlgo);
	this.getFontFunctions(layoutAlgo);
}
ComputedStyleSimpleGetter.prototype = {}
ComputedStyleSimpleGetter.prototype.objectType = 'ComputedStyleSimpleGetter';


/*
 * @method getPaddingFunctions
 */
ComputedStyleSimpleGetter.prototype.getPaddingFunctions = function(layoutAlgo) {
	
	var parentPaddingBlockStart = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.paddingBlockStart.prototype.propName);
	var parentPaddingInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.paddingInlineEnd.prototype.propName);
	var parentPaddingBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.paddingBlockEnd.prototype.propName);
	var parentPaddingInlineStart = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.paddingInlineStart.prototype.propName);
	
	var parentSummedInlinePaddings = parentPaddingInlineStart + parentPaddingInlineEnd;
	var parentSummedBlockPaddings = parentPaddingBlockStart + parentPaddingBlockEnd;
	
	// Single Values
	this.getParentPaddingBlockStart = function() {
		return parentPaddingBlockStart;
	}
	
	this.getParentPaddingInlineEnd = function() {
		return parentPaddingInlineEnd;
	}
	
	this.getParentPaddingBlockEnd = function() {
		return parentPaddingBlockEnd;
	}
	
	this.getParentPaddingInlineStart = function() {
		return parentPaddingInlineStart;
	}
	
	// Summed Values
	this.getParentSummedInlinePaddings = function() {
		return parentSummedInlinePaddings;
	}
	this.getParentSummedBlockPaddings = function() {
		return parentSummedBlockPaddings;
	}
}

/*
 * @method getBorderFunctions
 */
ComputedStyleSimpleGetter.prototype.getBorderFunctions = function(layoutAlgo) {
	
	var parentBorderBlockStartWidth = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.borderBlockStartWidth.prototype.propName);
	var parentBorderInlineEndWidth = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.borderInlineEndWidth.prototype.propName);
	var parentBorderBlockEndWidth = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.borderBlockEndWidth.prototype.propName);
	var parentBorderInlineStartWidth = layoutAlgo.layoutNode._parent.computedStyle.fastBufferedValueToNumber(CSSProps.borderInlineStartWidth.prototype.propName);
	
	var parentSummedInlineBorders = parentBorderInlineStartWidth + parentBorderInlineEndWidth;
	var parentSummedBlockBorders = parentBorderBlockStartWidth + parentBorderBlockEndWidth;
	
	// Single Values
	this.getParentBorderBlockStartWidth = function() {
		return parentBorderBlockStartWidth;
	}
	
	this.getParentBorderInlineEndWidth = function() {
		return parentBorderInlineEndWidth;
	}
	
	this.getParentBorderBlockEndWidth = function() {
		return parentBorderBlockEndWidth;
	}
	
	this.getParentBorderInlineStartWidth = function() {
		return parentBorderInlineStartWidth;
	}
	
	// Summed Values
	this.getParentSummedInlineBorders = function() {
		return parentSummedInlineBorders;
	}
	this.getParentSummedBlockBorders = function() {
		return parentSummedBlockBorders;
	}
}



/*
 * @method getFontFunctions
 */
ComputedStyleSimpleGetter.prototype.getFontFunctions = function(layoutAlgo) {
	var fontSize = layoutAlgo.layoutNode.computedStyle.fastBufferedValueToNumber(CSSProps.fontSize.prototype.propName);
	var fontFamily = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.fontFamily.prototype.propName);
	var lineHeight = layoutAlgo.layoutNode.computedStyle.fastBufferedValueToNumber(CSSProps.lineHeight.prototype.propName);
	
	// Single Values
	this.getFontSize = function() {
		return fontSize;
	}
	
	this.getFontFamily = function() {
		return fontFamily;
	}
	
	this.getLineHeight = function() {
		return lineHeight;
	}
	
	// VALUES AS STRING
	var fontSizeAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.fontSize.prototype.propName);
	var fontSizeUnitAsString = layoutAlgo.layoutNode.computedStyle.getProp(CSSProps.fontSize.prototype.propName).getUnitAsString();
	
	this.getFontSizeAsString = function() {
		return fontSizeAsString;
	}
	
	
	this.getFontSizeUnitAsString = function() {
		return fontSizeUnitAsString;
	}
}











 module.exports = ComputedStyleSimpleGetter;