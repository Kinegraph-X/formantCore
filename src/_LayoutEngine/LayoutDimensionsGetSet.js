/*
 * @ctor LayoutDimensionsGetSet
 */

//var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');







/**
 * @constructor LayoutDimensionsGetSet
 * @param layoutNode {LayoutNode}
 * @param dimensionsBuffer {LayoutDimensionsBuffer}
 */
var LayoutDimensionsGetSet = function(layoutNode, layoutAlgo, dimensionsBuffer) {
	this.relatedUID = layoutNode._UID;
	this.dimensionsBuffer = dimensionsBuffer;
	
	this.summedInlinePaddings = layoutAlgo.getSummedInlinePaddings();
	this.summedBlockPaddings = layoutAlgo.getSummedBlockPaddings();
	this.summedInlineBorders = layoutAlgo.getSummedInlineBorders();
	this.summedBlockBorders = layoutAlgo.getSummedBlockBorders();
	this.summedInlineMargins = layoutAlgo.getSummedInlineMargins();
	this.summedBlockMargins = layoutAlgo.getSummedBlockMargins();
}
LayoutDimensionsGetSet.prototype = {}
LayoutDimensionsGetSet.prototype.objectType = 'LayoutDimensionsGetSet';
LayoutDimensionsGetSet.prototype.valuesList = Object.keys(new LayoutTypes.BoxDimensions());
LayoutDimensionsGetSet.prototype.valuesPositions = (function() {
	var ret = {};
	LayoutDimensionsGetSet.prototype.valuesList.forEach(function(valueName, key) {
		ret[valueName] = key;
	});
	return ret;
})();

/**
 * @method getAtPosForValue
 */
LayoutDimensionsGetSet.prototype.getAtPosForValue = function(valueName) {
	return this.valuesPositions[valueName];
}

/**
 * @method getInline
 */
LayoutDimensionsGetSet.prototype.getInline = function() {
	return this.dimensionsBuffer.getValueAtPos(this.relatedUID, 0);
}

/**
 * @method getBlock
 */
LayoutDimensionsGetSet.prototype.getBlock = function() {
	return this.dimensionsBuffer.getValueAtPos(this.relatedUID, 1);
}

/**
 * @method getBorderInline
 */
LayoutDimensionsGetSet.prototype.getBorderInline = function() {
	return this.dimensionsBuffer.getValueAtPos(this.relatedUID, 2);
}

/**
 * @method getBorderBlock
 */
LayoutDimensionsGetSet.prototype.getBorderBlock = function() {
	return this.dimensionsBuffer.getValueAtPos(this.relatedUID, 3);
}

/**
 * @method getOuterInline
 */
LayoutDimensionsGetSet.prototype.getOuterInline = function() {
	return this.dimensionsBuffer.getValueAtPos(this.relatedUID, 4);
}

/**
 * @method getOuterBlock
 */
LayoutDimensionsGetSet.prototype.getOuterBlock = function() {
	return this.dimensionsBuffer.getValueAtPos(this.relatedUID, 5);
}






/**
 * @method setInline
 */
LayoutDimensionsGetSet.prototype.setInline = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBlock
 */
LayoutDimensionsGetSet.prototype.setBlock = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
}

/**
 * @method setBorderInline
 */
LayoutDimensionsGetSet.prototype.setBorderInline = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
}

/**
 * @method setBorderBlock
 */
LayoutDimensionsGetSet.prototype.setBorderBlock = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
}

/**
 * @method setOuterInline
 */
LayoutDimensionsGetSet.prototype.setOuterInline = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
}

/**
 * @method setOuterBlock
 */
LayoutDimensionsGetSet.prototype.setOuterBlock = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value);
}






/**
 * @method setInline
 */
LayoutDimensionsGetSet.prototype.setFromInline = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value + this.summedInlineBorders);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value + this.summedInlineBorders  + this.summedInlineMargins);
}

/**
 * @method setBlock
 */
LayoutDimensionsGetSet.prototype.setFromBlock = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value + this.summedBlockBorders);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value + this.summedBlockBorders  + this.summedBlockMargins);
}

/**
 * @method setBorderInline
 */
LayoutDimensionsGetSet.prototype.setFromBorderInline = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value + this.summedInlineMargins);
	
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value - this.summedInlineBorders);
}

/**
 * @method setBorderBlock
 */
LayoutDimensionsGetSet.prototype.setFromBorderBlock = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value + this.summedBlockMargins);
	
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value - this.summedBlockBorders);
}

/**
 * @method setOuterInline
 */
LayoutDimensionsGetSet.prototype.setFromOuterInline = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
	
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value - this.summedInlineMargins);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value - this.summedInlineBorders - this.summedInlineMargins);
}

/**
 * @method setOuterBlock
 */
LayoutDimensionsGetSet.prototype.setFromOuterBlock = function(value) {
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value);
	
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value - this.summedBlockMargins);
	this.dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value - this.summedBlockBorders - this.summedBlockMargins);
}













module.exports = LayoutDimensionsGetSet;