/**
 * @constructor ComputedStyleGetter
 * 
 */
 
 
 var CSSProps = require('src/editing/CSSPropertyDescriptors').all;

 
 
 var ComputedStyleGetter = function(layoutAlgo) {
	this.computedStyle = layoutAlgo.layoutNode.computedStyle;
	this.singleFunction(layoutAlgo);
	
//	this.getBoxModelFunctions(layoutAlgo);
//	this.getDimensionsFunctions(layoutAlgo);
//	this.getPaddingFunctions(layoutAlgo);
//	this.getBorderFunctions(layoutAlgo);
//	this.getMarginFunctions(layoutAlgo);
//	
//	this.getFlexFunctions(layoutAlgo);
//	this.getFontFunctions(layoutAlgo);
}
ComputedStyleGetter.prototype = {}
ComputedStyleGetter.prototype.objectType = 'ComputedStyleGetter';

ComputedStyleGetter.prototype.singleFunction = function(layoutAlgo) {
	var boxSizing = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.boxSizing.prototype.propName);
	var width = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.width.prototype.propName);
	var height = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.height.prototype.propName);
	// IS INITIAL VALUE
	var widthIsInitialValue = layoutAlgo.layoutNode.computedStyle.getIsInitialValueAsBool(CSSProps.width.prototype.propName);
	var heightIsInitialValue = layoutAlgo.layoutNode.computedStyle.getIsInitialValueAsBool(CSSProps.height.prototype.propName);
	
	var paddingBlockStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockStart.prototype.propName);
	var paddingInlineEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineEnd.prototype.propName);
	var paddingBlockEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockEnd.prototype.propName);
	var paddingInlineStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineStart.prototype.propName);
	var summedInlinePaddings = paddingInlineStart + paddingInlineEnd;
	var summedBlockPaddings = paddingBlockStart + paddingBlockEnd;
	
	// PARENT VALUES

		var parentPaddingBlockStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockStart.prototype.propName);
		var parentPaddingInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineEnd.prototype.propName);
		var parentPaddingBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockEnd.prototype.propName);
		var parentPaddingInlineStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineStart.prototype.propName);
		
		var parentSummedInlinePaddings = parentPaddingInlineStart + parentPaddingInlineEnd;
		var parentSummedBlockPaddings = parentPaddingBlockStart + parentPaddingBlockEnd;

	var borderBlockStartWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderBlockStartWidth.prototype.propName);
	var borderInlineEndWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderInlineEndWidth.prototype.propName);
	var borderBlockEndWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderBlockEndWidth.prototype.propName);
	var borderInlineStartWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderInlineStartWidth.prototype.propName);
	
	var summedInlineBorders = borderInlineStartWidth + borderInlineEndWidth;
	var summedBlockBorders = borderBlockStartWidth + borderBlockEndWidth;
	
	// PARENT VALUES

		var parentBorderBlockStartWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderBlockStartWidth.prototype.propName);
		var parentBorderInlineEndWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderInlineEndWidth.prototype.propName);
		var parentBorderBlockEndWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderBlockEndWidth.prototype.propName);
		var parentBorderInlineStartWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderInlineStartWidth.prototype.propName);
		
		var parentSummedInlineBorders = parentBorderInlineStartWidth + parentBorderInlineEndWidth;
		var parentSummedBlockBorders = parentBorderBlockStartWidth + parentBorderBlockEndWidth;

	var marginBlockStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginBlockStart.prototype.propName);
	var marginInlineEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginInlineEnd.prototype.propName);
	var marginBlockEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginBlockEnd.prototype.propName);
	var marginInlineStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginInlineStart.prototype.propName);
	
	var marginBlockStartAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginBlockStart.prototype.propName);
	var marginInlineEndAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginInlineEnd.prototype.propName);
	var marginBlockEndAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginBlockEnd.prototype.propName);
	var marginInlineStartAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginInlineStart.prototype.propName);
	
	var summedInlineMargins = marginInlineStart + marginInlineEnd;
	var summedBlockMargins = marginBlockStart + marginBlockEnd;
	
	// PARENT VALUES

		var parentMarginBlockStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginBlockStart.prototype.propName);
		var parentMarginInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginInlineEnd.prototype.propName);
		var parentMarginBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginBlockEnd.prototype.propName);
		var parentMarginInlineStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginInlineStart.prototype.propName);
		
		var parentSummedInlineMargins = parentMarginInlineStart + parentMarginInlineEnd;
		var parentSummedBlockMargins = parentMarginBlockStart + parentMarginBlockEnd;

	var flexDirection = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.flexDirection.prototype.propName);
	var flexGrow = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.flexGrow.prototype.propName);
	var flexShrink = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.flexShrink.prototype.propName);
	var flexBasis = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.flexBasis.prototype.propName);
	
	var justifyContent = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.justifyContent.prototype.propName);
	var alignItems = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.alignItems.prototype.propName);
	
	var fontSize = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.fontSize.prototype.propName);
	var fontFamily = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.fontFamily.prototype.propName);
	var lineHeight = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.lineHeight.prototype.propName);
	
	// VALUES AS STRING
	var fontSizeAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.fontSize.prototype.propName);
	var fontSizeUnitAsString = layoutAlgo.layoutNode.computedStyle.getProp(CSSProps.fontSize.prototype.propName).getUnitAsString();
	
	
	// Single Values
	this.getBoxSizing = function() {
		return boxSizing;
	}

	
	
	// Single Values
	this.getWidth = function() {
		return width;
	}
	
	this.getHeight = function() {
		return height;
	}
	
	
	
	// Single Values
	this.getWidthIsInitialValue = function() {
		return widthIsInitialValue;
	}
	
	this.getHeightIsInitialValue = function() {
		return heightIsInitialValue;
	}

	
	
	// Single Values
	this.getPaddingBlockStart = function() {
		return paddingBlockStart;
	}
	
	this.getPaddingInlineEnd = function() {
		return paddingInlineEnd;
	}
	
	this.getPaddingBlockEnd = function() {
		return paddingBlockEnd;
	}
	
	this.getPaddingInlineStart = function() {
		return paddingInlineStart;
	}
	
	// Summed Values
	this.getSummedInlinePaddings = function() {
		return summedInlinePaddings;
	}
	this.getSummedBlockPaddings = function() {
		return summedBlockPaddings;
	}
	
	

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

	
	
	// Single Values
	this.getBorderBlockStartWidth = function() {
		return borderBlockStartWidth;
	}
	
	this.getBorderInlineEndWidth = function() {
		return borderInlineEndWidth;
	}
	
	this.getBorderBlockEndWidth = function() {
		return borderBlockEndWidth;
	}
	
	this.getBorderInlineStartWidth = function() {
		return borderInlineStartWidth;
	}
	
	// Summed Values
	this.getSummedInlineBorders = function() {
		return summedInlineBorders;
	}
	this.getSummedBlockBorders = function() {
		return summedBlockBorders;
	}
	
	

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

	
	
	// Single Values
	this.getMarginBlockStart = function() {
		return marginBlockStart;
	}
	
	this.getMarginInlineEnd = function() {
		return marginInlineEnd;
	}
	
	this.getMarginBlockEnd = function() {
		return marginBlockEnd;
	}
	
	this.getMarginInlineStart = function() {
		return marginInlineStart;
	}
	
	// Single Values AS STRINGS
	this.getMarginBlockStartAsString = function() {
		return marginBlockStartAsString;
	}
	
	this.getMarginInlineEndAsString = function() {
		return marginInlineEndAsString;
	}
	
	this.getMarginBlockEndAsString = function() {
		return marginBlockEndAsString;
	}
	
	this.getMarginInlineStartAsString = function() {
		return marginInlineStartAsString;
	}
	
	// Summed Values
	this.getSummedInlineMargins = function() {
		return summedInlineMargins;
	}
	this.getSummedBlockMargins = function() {
		return summedBlockMargins;
	}
	
	

		// Single Values
		this.getParentMarginBlockStart = function() {
			return parentMarginBlockStart;
		}
		
		this.getParentMarginInlineEnd = function() {
			return parentMarginInlineEnd;
		}
		
		this.getParentMarginBlockEnd = function() {
			return parentMarginBlockEnd;
		}
		
		this.getParentMarginInlineStart = function() {
			return parentMarginInlineStart;
		}
		
		// Summed Values
		this.getParentSummedInlineMargins = function() {
			return parentSummedInlineMargins;
		}
		this.getParentSummedBlockMargins = function() {
			return parentSummedBlockMargins;
		}

	
	
	// Single Values
	this.getFlexDirection = function() {
		return flexDirection;
	}
	
	this.getFlexGrow = function() {
		return flexGrow;
	}
	
	this.getFlexShrink = function() {
		return flexShrink;
	}
	
	this.getFlexBasis = function() {
		return flexBasis;
	}
	
	
	this.getJustifyContent = function() {
		return justifyContent;
	}
	
	this.getAlignItems = function() {
		return alignItems;
	}

	
	
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
	
	
	
	this.getFontSizeAsString = function() {
		return fontSizeAsString;
	}
	
	
	this.getFontSizeUnitAsString = function() {
		return fontSizeUnitAsString;
	}
}

/*
 * @method getBoxModelFunctions
 */
ComputedStyleGetter.prototype.getBoxModelFunctions = function(layoutAlgo) {
	
	
	// Single Values
	this.getBoxSizing = function() {
		return boxSizing;
	}
}

/*
 * @method getDimensionsFunctions
 */
ComputedStyleGetter.prototype.getDimensionsFunctions = function(layoutAlgo) {
	var width = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.width.prototype.propName);
	var height = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.height.prototype.propName);
	
	// Single Values
	this.getWidth = function() {
		return width;
	}
	
	this.getHeight = function() {
		return height;
	}
	
	// IS INITIAL VALUE
	var widthIsInitialValue = layoutAlgo.layoutNode.computedStyle.getIsInitialValueAsBool(CSSProps.width.prototype.propName);
	var heightIsInitialValue = layoutAlgo.layoutNode.computedStyle.getIsInitialValueAsBool(CSSProps.height.prototype.propName);
	
	// Single Values
	this.getWidthIsInitialValue = function() {
		return widthIsInitialValue;
	}
	
	this.getHeightIsInitialValue = function() {
		return heightIsInitialValue;
	}
}

/*
 * @method getPaddingFunctions
 */
ComputedStyleGetter.prototype.getPaddingFunctions = function(layoutAlgo) {
	var paddingBlockStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockStart.prototype.propName);
	var paddingInlineEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineEnd.prototype.propName);
	var paddingBlockEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockEnd.prototype.propName);
	var paddingInlineStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineStart.prototype.propName);
	var summedInlinePaddings = paddingInlineStart + paddingInlineEnd;
	var summedBlockPaddings = paddingBlockStart + paddingBlockEnd;
	
	// Single Values
	this.getPaddingBlockStart = function() {
		return paddingBlockStart;
	}
	
	this.getPaddingInlineEnd = function() {
		return paddingInlineEnd;
	}
	
	this.getPaddingBlockEnd = function() {
		return paddingBlockEnd;
	}
	
	this.getPaddingInlineStart = function() {
		return paddingInlineStart;
	}
	
	// Summed Values
	this.getSummedInlinePaddings = function() {
		return summedInlinePaddings;
	}
	this.getSummedBlockPaddings = function() {
		return summedBlockPaddings;
	}
	
	// PARENT VALUES
	if (!layoutAlgo.layoutNode._parent)
		return;
	var parentPaddingBlockStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockStart.prototype.propName);
	var parentPaddingInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineEnd.prototype.propName);
	var parentPaddingBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingBlockEnd.prototype.propName);
	var parentPaddingInlineStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.paddingInlineStart.prototype.propName);
	
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
ComputedStyleGetter.prototype.getBorderFunctions = function(layoutAlgo) {
	var borderBlockStartWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderBlockStartWidth.prototype.propName);
	var borderInlineEndWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderInlineEndWidth.prototype.propName);
	var borderBlockEndWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderBlockEndWidth.prototype.propName);
	var borderInlineStartWidth = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.borderInlineStartWidth.prototype.propName);
	
	var summedInlineBorders = borderInlineStartWidth + borderInlineEndWidth;
	var summedBlockBorders = borderBlockStartWidth + borderBlockEndWidth;
	
	// Single Values
	this.getBorderBlockStartWidth = function() {
		return borderBlockStartWidth;
	}
	
	this.getBorderInlineEndWidth = function() {
		return borderInlineEndWidth;
	}
	
	this.getBorderBlockEndWidth = function() {
		return borderBlockEndWidth;
	}
	
	this.getBorderInlineStartWidth = function() {
		return borderInlineStartWidth;
	}
	
	// Summed Values
	this.getSummedInlineBorders = function() {
		return summedInlineBorders;
	}
	this.getSummedBlockBorders = function() {
		return summedBlockBorders;
	}
	
	// PARENT VALUES
	if (!layoutAlgo.layoutNode._parent)
		return;
	var parentBorderBlockStartWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderBlockStartWidth.prototype.propName);
	var parentBorderInlineEndWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderInlineEndWidth.prototype.propName);
	var parentBorderBlockEndWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderBlockEndWidth.prototype.propName);
	var parentBorderInlineStartWidth = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.borderInlineStartWidth.prototype.propName);
	
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
 * @method getMarginFunctions
 */
ComputedStyleGetter.prototype.getMarginFunctions = function(layoutAlgo) {	
	var marginBlockStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginBlockStart.prototype.propName);
	var marginInlineEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginInlineEnd.prototype.propName);
	var marginBlockEnd = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginBlockEnd.prototype.propName);
	var marginInlineStart = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.marginInlineStart.prototype.propName);
	
	var marginBlockStartAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginBlockStart.prototype.propName);
	var marginInlineEndAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginInlineEnd.prototype.propName);
	var marginBlockEndAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginBlockEnd.prototype.propName);
	var marginInlineStartAsString = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.marginInlineStart.prototype.propName);
	
	var summedInlineMargins = marginInlineStart + marginInlineEnd;
	var summedBlockMargins = marginBlockStart + marginBlockEnd;
	
	// Single Values
	this.getMarginBlockStart = function() {
		return marginBlockStart;
	}
	
	this.getMarginInlineEnd = function() {
		return marginInlineEnd;
	}
	
	this.getMarginBlockEnd = function() {
		return marginBlockEnd;
	}
	
	this.getMarginInlineStart = function() {
		return marginInlineStart;
	}
	
	// Single Values AS STRINGS
	this.getMarginBlockStartAsString = function() {
		return marginBlockStartAsString;
	}
	
	this.getMarginInlineEndAsString = function() {
		return marginInlineEndAsString;
	}
	
	this.getMarginBlockEndAsString = function() {
		return marginBlockEndAsString;
	}
	
	this.getMarginInlineStartAsString = function() {
		return marginInlineStartAsString;
	}
	
	// Summed Values
	this.getSummedInlineMargins = function() {
		return summedInlineMargins;
	}
	this.getSummedBlockMargins = function() {
		return summedBlockMargins;
	}
	
	// PARENT VALUES
	if (!layoutAlgo.layoutNode._parent)
		return;
	var parentMarginBlockStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginBlockStart.prototype.propName);
	var parentMarginInlineEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginInlineEnd.prototype.propName);
	var parentMarginBlockEnd = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginBlockEnd.prototype.propName);
	var parentMarginInlineStart = layoutAlgo.layoutNode._parent.computedStyle.bufferedValueToNumber(CSSProps.marginInlineStart.prototype.propName);
	
	var parentSummedInlineMargins = parentMarginInlineStart + parentMarginInlineEnd;
	var parentSummedBlockMargins = parentMarginBlockStart + parentMarginBlockEnd;
	
	// Single Values
	this.getParentMarginBlockStart = function() {
		return parentMarginBlockStart;
	}
	
	this.getParentMarginInlineEnd = function() {
		return parentMarginInlineEnd;
	}
	
	this.getParentMarginBlockEnd = function() {
		return parentMarginBlockEnd;
	}
	
	this.getParentMarginInlineStart = function() {
		return parentMarginInlineStart;
	}
	
	// Summed Values
	this.getParentSummedInlineMargins = function() {
		return parentSummedInlineMargins;
	}
	this.getParentSummedBlockMargins = function() {
		return parentSummedBlockMargins;
	}
}

/*
 * @method getFlexFunctions
 */
ComputedStyleGetter.prototype.getFlexFunctions = function(layoutAlgo) {
	var flexDirection = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.flexDirection.prototype.propName);
	var flexGrow = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.flexGrow.prototype.propName);
	var flexShrink = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.flexShrink.prototype.propName);
	var flexBasis = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.flexBasis.prototype.propName);
	
	var justifyContent = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.justifyContent.prototype.propName);
	var alignItems = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.alignItems.prototype.propName);
	
	// Single Values
	this.getFlexDirection = function() {
		return flexDirection;
	}
	
	this.getFlexGrow = function() {
		return flexGrow;
	}
	
	this.getFlexShrink = function() {
		return flexShrink;
	}
	
	this.getFlexBasis = function() {
		return flexBasis;
	}
	
	
	this.getJustifyContent = function() {
		return justifyContent;
	}
	
	this.getAlignItems = function() {
		return alignItems;
	}
}

/*
 * @method getFontFunctions
 */
ComputedStyleGetter.prototype.getFontFunctions = function(layoutAlgo) {
	var fontSize = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.fontSize.prototype.propName);
	var fontFamily = layoutAlgo.layoutNode.computedStyle.bufferedValueToString(CSSProps.fontFamily.prototype.propName);
	var lineHeight = layoutAlgo.layoutNode.computedStyle.bufferedValueToNumber(CSSProps.lineHeight.prototype.propName);
	
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











 module.exports = ComputedStyleGetter;