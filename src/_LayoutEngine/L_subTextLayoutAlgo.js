/**
 * 
 * constructor TextLayoutAlgo
 *  
 */

var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
//var BaseIntermediateLayoutAlgo = require('src/_LayoutEngine/L_baseIntermediateLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');



//var FontPath = require('src/integrated_libs_&_forks/fontpath_src');

/**
 * @constructor SubTextLayoutAlgo
 * @param {LayoutNode} layoutNode
 * @param {String} textContent
 */
var SubTextLayoutAlgo = function(layoutNode, textContent, parentAvailableSpace) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'SubTextLayoutAlgo';
	this.algoName = 'subText';
	
//	console.log(textContent, layoutNode._parent.nodeName, layoutNode._parent.layoutAlgo.flexCtx._UID);
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);

	this.textContent = textContent;
	this.parentAvailableSpace = parentAvailableSpace;
	this.isMultiline = true;
//	this.localDebugLog('SubTextLayoutAlgo INIT', this.layoutNode.nodeName, ' ');

	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
		this.setParentDimensions = this.setBlockParentDimensions;
	else
		this.setParentDimensions = this.setInlineParentDimensions;
		
	
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.layoutNode.offsets', this.layoutNode.offsets);
}

SubTextLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
SubTextLayoutAlgo.prototype.objectType = 'SubTextLayoutAlgo';

SubTextLayoutAlgo.prototype.executeLayout = function() {
	var bounds = this.setSelfDimensions();
	this.setSelfOffsets();
	this.setParentDimensions();
	
	return bounds;
}

/**
 * @method setSelfOffsets
 * 
 */
SubTextLayoutAlgo.prototype.setSelfOffsets = function() {
	this.offsets.setFromInline(
		this.parentLayoutAlgo.offsets.getMarginInline()
		+ this.parentLayoutAlgo.availableSpace.getInlineOffset()
	);
	this.offsets.setFromBlock(
		this.parentLayoutAlgo.offsets.getMarginBlock()
		+ this.parentLayoutAlgo.availableSpace.getBlockOffset()
		+ (this.cs.getLineHeight() - this.cs.getFontSize() * 1.5)
	);
}

/**
 * @method getSelfDimensions
 * @param {String} textContent
 */
SubTextLayoutAlgo.prototype.getSelfDimensions = function() {
//	console.log(this.getTextDimensions(textContent), this.getAugmentedTextDimensions(textContent));
//	console.log(this.getAugmentedTextDimensions(this.textContent)[0] * 100 / this.getTextWidthCustom(this.textContent));
//	console.log(this.parentLayoutAlgo.availableSpace.getInline());
	
	var bounds = [];
	var lineHeight = this.cs.getLineHeight();
	var blockDimension = lineHeight;
	var remainingTextContent = this.textContent;
	this.layoutNode.textContent = '';
	
	
	bounds = this.getBoundOfTextLine(remainingTextContent, this.parentAvailableSpace);
	this.layoutNode.textContent = this.textContent = bounds[0];
	// Return the remaining text
	bounds.push(remainingTextContent.replace(bounds[0], ''));

	if (this.textContent.length)
		return [bounds[1] * this.textSizeHackFactor, blockDimension, bounds];
	
	return [0, lineHeight, bounds];
}

/**
 * @method setSelfDimensions
 * Updates the global dimensionsBuffer object, with the size of the text retrieved in this.getSelfDimensions
 * 
 */
SubTextLayoutAlgo.prototype.setSelfDimensions = function() {
	var dimensions = this.getSelfDimensions();
	this.dimensions.setFromInline(dimensions[0]);
	this.dimensions.setFromBlock(dimensions[1]);
	return dimensions[2];
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
SubTextLayoutAlgo.prototype.setInlineParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getInline(), 
			this.parentLayoutAlgo.availableSpace.getLastInlineOffset() + this.dimensions.getOuterInline() / this.textSizeHackFactor + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(), 
			this.parentLayoutAlgo.availableSpace.getLastBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
//	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
//	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions();
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
SubTextLayoutAlgo.prototype.setBlockParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getInline(), 
			this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() / this.textSizeHackFactor + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);
//	console.log(this.dimensions.getOuterBlock());
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(), 
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
//	console.log(this.parentLayoutAlgo.layoutNode.nodeName, this.parentDimensions.getOuterBlock());
	
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions();
}








module.exports = SubTextLayoutAlgo;