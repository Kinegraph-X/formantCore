/**
 * 
 * constructor TextLayoutAlgo
 *  
 */

var TypeManager = require('src/core/TypeManager');
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
//var BaseIntermediateLayoutAlgo = require('src/_LayoutEngine/L_baseIntermediateLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');
var InlineBlockLayoutAlgo = require('src/_LayoutEngine/L_inlineBlockLayoutAlgo');
var SubTextNode = require('src/_LayoutEngine/L_subTextLayoutNode');



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
	this.multilineBlockDimension = 0;
//	this.localDebugLog('TextLayoutAlgo INIT', this.layoutNode.nodeName, ' ');

	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inlineBlock)
		this.setParentDimensions = this.setBlockParentDimensions;
	else
		this.setParentDimensions = this.setInlineParentDimensions;

//	REDUNDANT
//	if (this.isIndirectFlexChild) {
//		var layoutCallbackRegisryItem = TypeManager.layoutCallbacksRegistry.getItem(this.flexCtx._UID);
//		layoutCallbackRegisryItem.subLevels.push(this.layoutNode);
//	}
	
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
	var bounds = [], inlineSize = 0;
	var lineHeight = this.cs.getLineHeight();
	var parentAvailableSpace = 0;
	var parentOriginalBlockOffset = this.parentLayoutAlgo.availableSpace.getBlockOffset();
	var parentOriginalInlineOffset = this.parentLayoutAlgo.availableSpace.getInlineOffset();
	var remainingTextContent = this.textContent;
	var firstLineForcedOffsetDone = false;
	this.multilineBlockDimension = remainingTextContent ? lineHeight : 0;
	this.layoutNode.textContent = '';
	
	var tab = '';
	var parent = this.layoutNode._parent;
//	console.log(this.textContent, this.layoutNode._UID);
	while(true) {
//		console.log(tab + parent.nodeName, parent._UID, parent.layoutAlgo.availableSpace.getInline())
		if ((
			(parent.layoutAlgo instanceof BlockLayoutAlgo
			|| parent.layoutAlgo instanceof InlineBlockLayoutAlgo)
				&& parent.layoutAlgo.availableSpace.getInline() > 0)
			|| typeof parent._parent === 'undefined')//&& parent.layoutAlgo.dimensions.getBorderInline() !== 0
			break;
		tab += '	';
		parent = parent._parent;
	}
//	console.log(tab + parent.nodeName, parent._UID)

	parentAvailableSpace = parent.layoutAlgo.availableSpace.getInline();
	
	bounds = this.getBoundOfTextLine(remainingTextContent, parentAvailableSpace);
	inlineSize = bounds[1];
	
	this.layoutNode.textContent = this.textContent = bounds[0];
	remainingTextContent = remainingTextContent.replace(bounds[0], '').trimStart();
	
	while(remainingTextContent.length) {
		this.multilineBlockDimension += lineHeight;
		
		if (remainingTextContent.length) {
//			console.log(remainingTextContent.length);
			this.isMultiline = true;
			this.parentLayoutAlgo.resetInlineAvailableSpace();
			this.parentLayoutAlgo.resetInlineAvailableSpaceOffset();
			
			if (!firstLineForcedOffsetDone) {
				this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
				this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + lineHeight);
				firstLineForcedOffsetDone = true;
			}
			
			// the "bounds' property returned from the ctor is a HACK to avoid counting the words 2 times
			bounds = (new SubTextNode(this.layoutNode._parent, remainingTextContent, parentAvailableSpace)).bounds;
			remainingTextContent = bounds[2].trimStart();
		}
	}
	
	// We updated sequentially the blockOffset for each subTextNode,
	// but we haven't defined the offsets of the current textNode yet.
	// => cancel what we've already done if it's been done on the immediate parent
	this.parentLayoutAlgo.setAvailableSpaceOffsets(parentOriginalInlineOffset, parentOriginalBlockOffset);
	
	if (this.textContent.length)
		return [inlineSize * this.textSizeHackFactor, lineHeight];
	
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
		this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() / this.textSizeHackFactor + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
	);
//	console.log('setInlineParentDimensions', this.layoutNode.nodeName, this.parentLayoutAlgo.layoutNode.nodeName, this.parentLayoutAlgo.dimensions.getBlock(), this.dimensions.getOuterBlock());
	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(), 
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.multilineBlockDimension + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	

	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
//	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
//	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());
	
//	console.log(this.parentLayoutAlgo.availableSpace.getBlockOffset());
	this.parentLayoutAlgo.updateParentDimensions('fromText', this.isMultiline);
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
TextLayoutAlgo.prototype.setBlockParentDimensions = function() {
	this.parentDimensions.setFromBorderInline(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderInline(), 
			this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline() / this.textSizeHackFactor + this.cs.getParentPaddingInlineEnd() + this.cs.getParentBorderInlineEndWidth()
		)
	);

	this.parentDimensions.setFromBorderBlock(
		Math.max(
			this.parentLayoutAlgo.dimensions.getBorderBlock(), 
			this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock() + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth()
		)
	);
	
	this.parentLayoutAlgo.availableSpace.setInline(this.parentLayoutAlgo.dimensions.getBorderInline() - (this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline()) - this.cs.getParentPaddingInlineEnd() - this.cs.getParentBorderInlineEndWidth());
	this.parentLayoutAlgo.availableSpace.setLastInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset());
	this.parentLayoutAlgo.availableSpace.setInlineOffset(this.parentLayoutAlgo.availableSpace.getInlineOffset() + this.dimensions.getOuterInline());
	
//	this.parentLayoutAlgo.availableSpace.setBlock(this.parentLayoutAlgo.dimensions.getBorderBlock() - (this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock()) - this.cs.getParentPaddingBlockEnd() - this.cs.getParentBorderBlockEndWidth());
//	this.parentLayoutAlgo.availableSpace.setLastBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset());
//	this.parentLayoutAlgo.availableSpace.setBlockOffset(this.parentLayoutAlgo.availableSpace.getBlockOffset() + this.dimensions.getOuterBlock());

	this.parentLayoutAlgo.updateParentDimensions('fromText', this.isMultiline);
}
























module.exports = TextLayoutAlgo;