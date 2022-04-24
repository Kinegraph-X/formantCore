/**
 * @constructor ComputedStyleGetter
 * 
 */
 
 
 
 
 
 
 
 
 
 
 var ComputedStyleGetter = function(layoutAlgo) {
	layoutAlgo.cs = {};
	this.computedStyle = layoutAlgo.layoutNode.computedStyle;
	
	this.getPaddingFunctions(layoutAlgo);
	this.getBorderFunctions(layoutAlgo);
	this.getMarginFunctions(layoutAlgo);
	
	this.getFlexFunctions(layoutAlgo);
	this.getFontFunctions(layoutAlgo);
}
ComputedStyleGetter.prototype = {}
ComputedStyleGetter.prototype.objectType = 'ComputedStyleGetter';

/*
 * @method getPaddingFunctions
 */
ComputedStyleGetter.prototype.getPaddingFunctions = function(layoutAlgo) {
	var paddingBlockStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockStart');
	var paddingInlineEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineEnd');
	var paddingBlockEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('paddingBlockEnd');
	var paddingInlineStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('paddingInlineStart');
	
	var summedInlinePaddings = paddingInlineStart + paddingInlineEnd;
	var summedBlockPaddings = paddingBlockStart + paddingBlockEnd;
	
	// Single Values
	layoutAlgo.cs.getPaddingBlockStart = function() {
		return paddingBlockStart;
	}
	
	layoutAlgo.cs.getPaddingInlineEnd = function() {
		return paddingInlineEnd;
	}
	
	layoutAlgo.cs.getPaddingBlockEnd = function() {
		return paddingBlockEnd;
	}
	
	layoutAlgo.cs.getPaddingInlineStart = function() {
		return paddingInlineStart;
	}
	
	// Summed Values
	layoutAlgo.cs.getSummedInlinePaddings = function() {
		return summedInlinePaddings;
	}
	layoutAlgo.cs.getSummedBlockPaddings = function() {
		return summedBlockPaddings;
	}
	
	// PARENT VALUES
	var parentPaddingBlockStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockStart');
	var parentPaddingInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineEnd');
	var parentPaddingBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingBlockEnd');
	var parentPaddingInlineStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('paddingInlineStart');
	
	var parentSummedInlinePaddings = parentPaddingInlineStart + parentPaddingInlineEnd;
	var parentSummedBlockPaddings = parentPaddingBlockStart + parentPaddingBlockEnd;
	
	// Single Values
	layoutAlgo.cs.getParentPaddingBlockStart = function() {
		return parentPaddingBlockStart;
	}
	
	layoutAlgo.cs.getParentPaddingInlineEnd = function() {
		return parentPaddingInlineEnd;
	}
	
	layoutAlgo.cs.getParentPaddingBlockEnd = function() {
		return parentPaddingBlockEnd;
	}
	
	layoutAlgo.cs.getParentPaddingInlineStart = function() {
		return parentPaddingInlineStart;
	}
	
	// Summed Values
	layoutAlgo.cs.getParentSummedInlinePaddings = function() {
		return parentSummedInlinePaddings;
	}
	layoutAlgo.cs.getParentSummedBlockPaddings = function() {
		return parentSummedBlockPaddings;
	}
}

/*
 * @method getBorderFunctions
 */
ComputedStyleGetter.prototype.getBorderFunctions = function(layoutAlgo) {
	var borderBlockStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('borderBlockStart');
	var borderInlineEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('borderInlineEnd');
	var borderBlockEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('borderBlockEnd');
	var borderInlineStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('borderInlineStart');
	
	var summedInlineBorders = borderInlineStart + borderInlineEnd;
	var summedBlockBorders = borderBlockStart + borderBlockEnd;
	
	// Single Values
	layoutAlgo.cs.getBorderBlockStart = function() {
		return borderBlockStart;
	}
	
	layoutAlgo.cs.getBorderInlineEnd = function() {
		return borderInlineEnd;
	}
	
	layoutAlgo.cs.getBorderBlockEnd = function() {
		return borderBlockEnd;
	}
	
	layoutAlgo.cs.getBorderInlineStart = function() {
		return borderInlineStart;
	}
	
	// Summed Values
	layoutAlgo.cs.getSummedInlineBorders = function() {
		return summedInlineBorders;
	}
	layoutAlgo.cs.getSummedBlockBorders = function() {
		return summedBlockBorders;
	}
	
	// PARENT VALUES
	var parentBorderBlockStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockStart');
	var parentBorderInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('borderInlineEnd');
	var parentBorderBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('borderBlockEnd');
	var parentBorderInlineStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('borderInlineStart');
	
	var parentSummedInlineBorders = parentBorderInlineStart + parentBorderInlineEnd;
	var parentSummedBlockBorders = parentBorderBlockStart + parentBorderBlockEnd;
	
	// Single Values
	layoutAlgo.cs.getParentBorderBlockStart = function() {
		return parentBorderBlockStart;
	}
	
	layoutAlgo.cs.getParentBorderInlineEnd = function() {
		return parentBorderInlineEnd;
	}
	
	layoutAlgo.cs.getParentBorderBlockEnd = function() {
		return parentBorderBlockEnd;
	}
	
	layoutAlgo.cs.getParentBorderInlineStart = function() {
		return parentBorderInlineStart;
	}
	
	// Summed Values
	layoutAlgo.cs.getParentSummedInlineBorders = function() {
		return parentSummedInlineBorders;
	}
	layoutAlgo.cs.getParentSummedBlockBorders = function() {
		return parentSummedBlockBorders;
	}
}

/*
 * @method getMarginFunctions
 */
ComputedStyleGetter.prototype.getMarginFunctions = function(layoutAlgo) {	
	var marginBlockStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('marginBlockStart');
	var marginInlineEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('marginInlineEnd');
	var marginBlockEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('marginBlockEnd');
	var marginInlineStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('marginInlineStart');
	
	var summedInlineMargins = marginInlineStart + marginInlineEnd;
	var summedBlockMargins = marginBlockStart + marginBlockEnd;
	
	// Single Values
	layoutAlgo.cs.getMarginBlockStart = function() {
		return marginBlockStart;
	}
	
	layoutAlgo.cs.getMarginInlineEnd = function() {
		return marginInlineEnd;
	}
	
	layoutAlgo.cs.getMarginBlockEnd = function() {
		return marginBlockEnd;
	}
	
	layoutAlgo.cs.getMarginInlineStart = function() {
		return marginInlineStart;
	}
	
	// Summed Values
	layoutAlgo.cs.getSummedInlineMargins = function() {
		return summedInlineMargins;
	}
	layoutAlgo.cs.getSummedBlockMargins = function() {
		return summedBlockMargins;
	}
	
	// PARENT VALUES
	var parentMarginBlockStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('marginBlockStart');
	var parentMarginInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('marginInlineEnd');
	var parentMarginBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('marginBlockEnd');
	var parentMarginInlineStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber('marginInlineStart');
	
	var parentSummedInlineMargins = parentMarginInlineStart + parentMarginInlineEnd;
	var parentSummedBlockMargins = parentMarginBlockStart + parentMarginBlockEnd;
	
	// Single Values
	layoutAlgo.cs.getParentMarginBlockStart = function() {
		return parentMarginBlockStart;
	}
	
	layoutAlgo.cs.getParentMarginInlineEnd = function() {
		return parentMarginInlineEnd;
	}
	
	layoutAlgo.cs.getParentMarginBlockEnd = function() {
		return parentMarginBlockEnd;
	}
	
	layoutAlgo.cs.getParentMarginInlineStart = function() {
		return parentMarginInlineStart;
	}
	
	// Summed Values
	layoutAlgo.cs.getParentSummedInlineMargins = function() {
		return parentSummedInlineMargins;
	}
	layoutAlgo.cs.getParentSummedBlockMargins = function() {
		return parentSummedBlockMargins;
	}
}

/*
 * @method getFlexFunctions
 */
ComputedStyleGetter.prototype.getFlexFunctions = function(layoutAlgo) {
	var flexDirection = layoutAlgo.layoutNode.computedStyle.bufferedValueToString('flexDirection');
	var flexGrow = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('flexGrow');
	var flexShrink = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('flexShrink');
	var flexBasis = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('flexBasis');
	
	var justifyContent = layoutAlgo.layoutNode.computedStyle.bufferedValueToString('justifyContent');
	var alignItems = layoutAlgo.layoutNode.computedStyle.bufferedValueToString('alignItems');
	
	// Single Values
	layoutAlgo.cs.getFlexDirection = function() {
		return flexDirection;
	}
	
	layoutAlgo.cs.getFlexGrow = function() {
		return flexGrow;
	}
	
	layoutAlgo.cs.getFlexShrink = function() {
		return flexShrink;
	}
	
	layoutAlgo.cs.getFlexBasis = function() {
		return flexBasis;
	}
	
	
	layoutAlgo.cs.getJustifyContent = function() {
		return justifyContent;
	}
	
	layoutAlgo.cs.getAlignItems = function() {
		return alignItems;
	}
}

/*
 * @method getFontFunctions
 */
ComputedStyleGetter.prototype.getFontFunctions = function(layoutAlgo) {
	var fontSize = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('fontSize');
	var fontFamily = layoutAlgo.layoutNode.computedStyle.bufferedValueToString('fontFamily');
	var lineHeight = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber('lineHeight');
	
	// Single Values
	layoutAlgo.cs.getFontSize = function() {
		return fontSize;
	}
	
	layoutAlgo.cs.getFontFamily = function() {
		return fontFamily;
	}
	
	layoutAlgo.cs.getLineHeight = function() {
		return lineHeight;
	}
}











 module.exports = ComputedStyleGetter;