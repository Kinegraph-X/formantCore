/**
 * 
 * constructor TextLayoutAlgo
 *  
 */


//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



//var FontPath = require('src/integrated_libs_&_forks/fontpath_src');

/**
 * @constructor TextLayoutAlgo
 * @param {LayoutNode} layoutNode
 * @param {String} textContent
 */
var TextLayoutAlgo = function(layoutNode, textContent, layoutDimensionsBuffer) {
	BaseLayoutAlgo.call(this, layoutNode, layoutDimensionsBuffer);
	this.objectType = 'TextLayoutAlgo';
	this.algoName = 'inline';
	
	this.setRefsToParents(layoutNode);
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	this.textContent = textContent;
	this.localDebugLog('TextLayoutAlgo INIT', this.layoutNode.nodeName, ' ');

	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
		this.setParentDimensions = this.setBlockParentDimensions;
	else
		this.setParentDimensions = this.setInlineParentDimensions;
	
	if (this.isIndirectFlexChild) {
		var layoutCallbackRegisryItem = TypeManager.layoutCallbacksRegistry.getItem(this.flexCtx._UID);
		layoutCallbackRegisryItem.subLevels.push(this.layoutNode);
	}
	
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.layoutNode.offsets', this.layoutNode.offsets);
}

TextLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
TextLayoutAlgo.prototype.objectType = 'TextLayoutAlgo';


TextLayoutAlgo.prototype.executeLayout = function() {
	this.setSelfDimensions();
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions();
}

/**
 * @method setSelfOffsets
 * 
 */
TextLayoutAlgo.prototype.setSelfOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.getInlineOffsetforAutoMargins());
	this.offsets.setFromBlock(this.parentLayoutAlgo.offsets.getMarginBlock() + this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.getBlockOffsetforAutoMargins());
}

/**
 * @method getSelfDimensions
 * @param {String} textContent
 */
TextLayoutAlgo.prototype.getSelfDimensions = function(textContent) {
//	console.log(this.getTextDimensions(textContent), this.getAugmentedTextDimensions(textContent));
	if (textContent.length)
		return this.getAugmentedTextDimensions(textContent);
	
	return [0, this.layoutNode.computedStyle.bufferedValueToNumber('lineHeight')];
}

/**
 * @method setSelfDimensions
 * Updates the global dimensionsBuffer object, with the size of the text retrieved in this.getSelfDimensions
 * 
 */
TextLayoutAlgo.prototype.setSelfDimensions = function() {
	var dimensions = this.getSelfDimensions(this.textContent);
	this.dimensions.setFromInline(dimensions[0]);
	this.dimensions.setFromBlock(dimensions[1]);
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
TextLayoutAlgo.prototype.setInlineParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(), 
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
//	console.log(this.layoutNode.nodeName, this.parentNode.nodeName, this.parentLayoutAlgo.dimensions.getValues());
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions();
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
TextLayoutAlgo.prototype.setBlockParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(), 
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions();
}
























module.exports = TextLayoutAlgo;