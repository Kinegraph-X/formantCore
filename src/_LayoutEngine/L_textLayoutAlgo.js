/**
 * 
 * constructor TextLayoutAlgo
 *  
 */


//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
//var BaseIntermediateLayoutAlgo = require('src/_LayoutEngine/L_baseIntermediateLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');
var SubTextNode = require('src/_LayoutEngine/L_subTextNode');



//var FontPath = require('src/integrated_libs_&_forks/fontpath_src');

/**
 * @constructor TextLayoutAlgo
 * @param {LayoutNode} layoutNode
 * @param {String} textContent
 */
var TextLayoutAlgo = function(layoutNode, textContent) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'TextLayoutAlgo';
	this.algoName = 'text';
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	this.textContent = textContent;
	this.isMultiline = false;
//	this.localDebugLog('TextLayoutAlgo INIT', this.layoutNode.nodeName, ' ');

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
	this.setSelfOffsets();
	this.setParentDimensions();
}

/**
 * @method setSelfOffsets
 * 
 */
TextLayoutAlgo.prototype.setSelfOffsets = function() {
	this.offsets.setFromInline(this.parentLayoutAlgo.offsets.getMarginInline() + this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.offsets.setFromBlock(
		this.parentLayoutAlgo.offsets.getMarginBlock()
		+ this.parentLayoutAlgo.availableSpace.getBlockOffset()
		+ (this.cs.getLineHeight() - this.cs.getFontSize() * 1.5)
	);
}

/**
 * @method getSelfDimensions
 * 
 */
TextLayoutAlgo.prototype.getSelfDimensions = function() {
//	console.log(this.getTextDimensions(textContent), this.getAugmentedTextDimensions(textContent));
//	console.log(this.getAugmentedTextDimensions(this.textContent)[0] * 100 / this.getTextWidthCustom(this.textContent));
//	console.log(this.parentLayoutAlgo.availableSpace.getInline());
	
	
	// HACK: handling of multiline text. Implementation to be continued... 
	// With line-feed nodes, allowing us to support justified and centered text
	var bounds = [], longestLineInlineSize = 0;
	var lineHeight = this.cs.getLineHeight();
	var blockDimension = lineHeight;
	var parentAvailableSpace = 0;
	var remainingTextContent = this.textContent;
	this.layoutNode.textContent = '';
	
	var tab = '';
	var parent = this.layoutNode._parent;
//	console.log(this.textContent, this.layoutNode._UID);
	while(parent) {
//		console.log(tab + parent.nodeName, parent._UID, parent.layoutAlgo.availableSpace.getInline())
		if (parent.layoutAlgo instanceof BlockLayoutAlgo
			)//&& parent.layoutAlgo.dimensions.getBorderInline() !== 0
			break;
		tab += '	';
		parent = parent._parent;
	}
//	console.log(tab + parent.nodeName, parent._UID)

	parentAvailableSpace = parent.layoutAlgo.availableSpace.getInline();
	
	bounds = this.getBoundOfTextLine(remainingTextContent, parentAvailableSpace);
	longestLineInlineSize = bounds[1];
	
	this.layoutNode.textContent = this.textContent = bounds[0];	
	remainingTextContent = remainingTextContent.replace(bounds[0], '').trimStart();
	
	while(remainingTextContent.length) {
		blockDimension += lineHeight;
		
		if (remainingTextContent.length) {
			this.isMultiline = true;
			parent.layoutAlgo.resetInlineAvailableSpace();
			parent.layoutAlgo.resetInlineAvailableSpaceOffset();
			
			parent.layoutAlgo.availableSpace.setLastBlockOffset(parent.layoutAlgo.availableSpace.getBlockOffset());
			parent.layoutAlgo.availableSpace.setBlockOffset(parent.layoutAlgo.availableSpace.getBlockOffset() + lineHeight);
			
			parentAvailableSpace = parent.layoutAlgo.availableSpace.getInline();

			// the "bounds' property returned from the ctor is a HACK to avoid counting the words 2 times
			bounds = (new SubTextNode(parent, remainingTextContent)).bounds;
			remainingTextContent = bounds[2].trimStart();
		}
	}
	
	if (this.textContent.length)
		return [longestLineInlineSize * this.textSizeHackFactor, lineHeight];
	
	return [0, lineHeight];
}

/**
 * @method setSelfDimensions
 * Updates the global dimensionsBuffer object, with the size of the text retrieved in this.getSelfDimensions
 * 
 */
TextLayoutAlgo.prototype.setSelfDimensions = function() {
	var dimensions = this.getSelfDimensions();
	this.dimensions.setFromInline(dimensions[0]);
	this.dimensions.setFromBlock(dimensions[1]);
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
TextLayoutAlgo.prototype.setInlineParentDimensions = function() {
//	console.log('text set inline', this.isMultiline);
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
	
//	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
//	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions(this.isMultiline);
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
TextLayoutAlgo.prototype.setBlockParentDimensions = function() {
//	this.parentDimensions.setFromBorderInline(
//		this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
//	);
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBlock(), 
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
//	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
//	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions();
}
























module.exports = TextLayoutAlgo;