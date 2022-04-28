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
	
	this.setFlexCtx(this, layoutNode._parent.layoutAlgo.flexCtx._UID);
	
	this.localDebugLog('TextLayoutAlgo INIT', this.layoutNode.nodeName, ' ');

	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.flex
			|| this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.block)
		this.setParentDimensions = this.setBlockParentDimensions;
	else
		this.setParentDimensions = this.setInlineParentDimensions;
	
	this.setSelfDimensions(this.layoutNode.dimensions, textContent);
	
	this.setSelfOffsets(this.layoutNode.dimensions);
	this.setParentDimensions(this.layoutNode.dimensions);
	
	if (this.isIndirectFlexChild) {
		var layoutCallbackRegisryItem = TypeManager.layoutCallbackRegistry.getItem(this.flexCtx._UID);
		layoutCallbackRegisryItem.subLevels.push(this.layoutNode);
	}
	
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.availableSpace', this.availableSpace);
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.layoutNode.dimensions', this.layoutNode.dimensions);
//	console.log(this.layoutNode.nodeName, 'text layout algo : this.layoutNode.offsets', this.layoutNode.offsets);
}

TextLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
TextLayoutAlgo.prototype.objectType = 'TextLayoutAlgo';

/**
 * @method setSelfOffsets
 * 
 */
TextLayoutAlgo.prototype.setSelfOffsets = function(dimensions) {
	this.layoutNode.offsets.inline =  this.layoutNode._parent.offsets.marginInline + this.layoutNode._parent.availableSpace.inlineOffset;
	this.layoutNode.offsets.block =  this.layoutNode._parent.offsets.marginBlock + this.layoutNode._parent.availableSpace.blockOffset;
	this.layoutNode.offsets.marginInline =  this.layoutNode.offsets.inline;
	this.layoutNode.offsets.marginBlock =  this.layoutNode.offsets.block;
	
//	this.layoutNode.updateCanvasShapeOffsets();
}

/**
 * @method setSelfDimensions
 * Updates the CoreTypes.DimensionsPair object we pass to it, with the size of the text retrieved in this.getSelfDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 * @param {String} textContent
 */
TextLayoutAlgo.prototype.setSelfDimensions = function(dimensions, textContent) {
//	var summedInlineBorders = this.getSummedInlineBorders();
//	var summedBlockBorders = this.getSummedBlockBorders();
//	var summedInlineMargins = this.getSummedInlineMargins();
//	var summedBlockMargins = this.getSummedBlockMargins();
	
	dimensions.set(this.getSelfDimensions(textContent));
	dimensions.setBorderSize([dimensions.inline, dimensions.block]);
//	dimensions.addToBorderSize([summedInlineBorders, summedBlockBorders]);
	dimensions.setOuterSize([dimensions.borderInline, dimensions.borderBlock]);
//	dimensions.addToOuterSize([summedInlineMargins, summedBlockMargins]);
	
//	this.layoutNode.updateCanvasShapeDimensions();
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
TextLayoutAlgo.prototype.setInlineParentDimensions = function(dimensions) {
	var DHL = 0;
//	var summedParentInlinePaddings = this.layoutNode._parent.layoutAlgo.getSummedInlinePaddings();
	var summedParentBlockPaddings = this.layoutNode._parent.layoutAlgo.getSummedBlockPaddings();
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
//		summedParentInlinePaddings = 0;
		summedParentBlockPaddings = 0;
		if (this.layoutNode._parent.availableSpace.inline < dimensions.outerInline) {
			this.layoutNode._parent.dimensions.inline += dimensions.inline;
			this.layoutNode._parent.dimensions.borderInline += dimensions.borderInline;
			this.layoutNode._parent.dimensions.outerInline += dimensions.outerInline;
			this.layoutNode._parent.availableSpace.inline = 0;
			this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
		}
	}

	var summedParentBlockMargins = this.cs.getParentSummedBlockMargins();
	this.localDebugLog(this.DHLstr(DHL), 'text increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	this.layoutNode._parent.dimensions.block = Math.max(this.layoutNode._parent.dimensions.block, dimensions.block + summedParentBlockPaddings);
	this.layoutNode._parent.dimensions.borderBlock = Math.max(this.layoutNode._parent.dimensions.borderBlock, dimensions.borderBlock + summedParentBlockPaddings);
	this.layoutNode._parent.dimensions.outerBlock = Math.max(this.layoutNode._parent.dimensions.outerBlock, dimensions.outerBlock + summedParentBlockPaddings + summedParentBlockMargins);
	this.layoutNode._parent.availableSpace.block = 0;
	
	this.localDebugLog(this.DHLstr(DHL), 'text increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
	
//	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
}

/**
 * @method setParentDimensions
 * @param {CoreTypes.DimensionsPair} dimensions
 */
TextLayoutAlgo.prototype.setBlockParentDimensions = function(dimensions) {
	var DHL = 0;
	var summedParentInlinePaddings = this.layoutNode._parent.layoutAlgo.getSummedInlinePaddings();
	var summedParentBlockPaddings = this.layoutNode._parent.layoutAlgo.getSummedBlockPaddings();
	
	if (this.layoutNode._parent.layoutAlgo.algoName === this.layoutAlgosAsConstants.inline) {
		summedParentInlinePaddings = 0;
		summedParentBlockPaddings = 0;
		if (this.layoutNode._parent.availableSpace.inline < dimensions.outerInline) {
			this.layoutNode._parent.dimensions.inline += dimensions.inline;
			this.layoutNode._parent.dimensions.borderInline += dimensions.borderInline;
			this.layoutNode._parent.dimensions.outerInline += dimensions.outerInline;
			this.layoutNode._parent.availableSpace.inline = 0;
			this.layoutNode._parent.availableSpace.inlineOffset += dimensions.outerInline;
		}
	}
	
	var summedParentBlockBorders = this.cs.getParentSummedBlockBorders();
	var summedParentBlockMargins = this.cs.getParentSummedBlockMargins();
	this.localDebugLog(this.DHLstr(DHL), 'text increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_pre', this.layoutNode._parent.dimensions.block);
	
	var parentBlockDimensions = this.layoutNode._parent.availableSpace.blockOffset + dimensions.outerBlock + this.cs.getParentPaddingBlockEnd() + this.cs.getParentBorderBlockEndWidth();
	this.layoutNode._parent.dimensions.block = parentBlockDimensions - summedParentBlockBorders;
	this.layoutNode._parent.dimensions.borderBlock = parentBlockDimensions;
	this.layoutNode._parent.dimensions.outerBlock = parentBlockDimensions + summedParentBlockMargins;
	this.layoutNode._parent.availableSpace.block = 0;
	this.localDebugLog(this.DHLstr(DHL), 'text increment parent', this.layoutNode.nodeName, this.layoutNode._parent.nodeName, 'this.layoutNode._parent.dimensions.block_post', this.layoutNode._parent.dimensions.block);
		
//	this.layoutNode._parent.updateCanvasShapeDimensions();
	this.layoutNode._parent.layoutAlgo.updateParentDimensions(this.layoutNode._parent.dimensions, ++DHL);
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






















module.exports = TextLayoutAlgo;