/*
 * @ctor LayoutDimensionsGetSet
 */

//var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var dimensionsBuffer = LayoutTypes.layoutDimensionsBuffer;






/**
 * @constructor LayoutDimensionsGetSet
 * @param layoutNode {LayoutNode}
 * @param dimensionsBuffer {LayoutDimensionsBuffer}
 */
var LayoutDimensionsGetSet = function(layoutNode, layoutAlgo) {
	this.addValue(layoutNode._UID);
	this.relatedUID = layoutNode._UID;
	
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
 * @method addValue
 */
LayoutDimensionsGetSet.prototype.addValue = function(UID) {
	dimensionsBuffer.addValue(UID);
}

/**
 * @method getValues
 */
LayoutDimensionsGetSet.prototype.getValues = function() {
	var ret = {};
	dimensionsBuffer.getValues(this.relatedUID).forEach(function(value, key) {
		ret[this.valuesList[key]] = value;
	}, this);
	return ret;
}

/**
 * @method getValues
 */
LayoutDimensionsGetSet.prototype.setValues = function(values) {
	// TODO: Benchmark id it's visibly faster to use the dimensionsBuffer.setValues method
	// (Only used by textLayout until now, it should not be measurable)
	for (var valueName in this.valuesPositions) {
		dimensionsBuffer.setValueAtPos(
			this.relatedUID,
			this.valuesPositions[valueName],
			values[this.valuesPositions[valueName]]
		);
	}
}

/**
 * @method getInline
 */
LayoutDimensionsGetSet.prototype.getInline = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 0);
}

/**
 * @method getBlock
 */
LayoutDimensionsGetSet.prototype.getBlock = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 1);
}

/**
 * @method getBorderInline
 */
LayoutDimensionsGetSet.prototype.getBorderInline = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 2);
}

/**
 * @method getBorderBlock
 */
LayoutDimensionsGetSet.prototype.getBorderBlock = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 3);
}

/**
 * @method getOuterInline
 */
LayoutDimensionsGetSet.prototype.getOuterInline = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 4);
}

/**
 * @method getOuterBlock
 */
LayoutDimensionsGetSet.prototype.getOuterBlock = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 5);
}






/**
 * @method setInline
 */
LayoutDimensionsGetSet.prototype.setInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBlock
 */
LayoutDimensionsGetSet.prototype.setBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
}

/**
 * @method setBorderInline
 */
LayoutDimensionsGetSet.prototype.setBorderInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
}

/**
 * @method setBorderBlock
 */
LayoutDimensionsGetSet.prototype.setBorderBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
}

/**
 * @method setOuterInline
 */
LayoutDimensionsGetSet.prototype.setOuterInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
}

/**
 * @method setOuterBlock
 */
LayoutDimensionsGetSet.prototype.setOuterBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value);
}






/**
 * @method setInline
 */
LayoutDimensionsGetSet.prototype.setFromInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value + this.summedInlineBorders);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value + this.summedInlineBorders  + this.summedInlineMargins);
}

/**
 * @method setBlock
 */
LayoutDimensionsGetSet.prototype.setFromBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value + this.summedBlockBorders);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value + this.summedBlockBorders  + this.summedBlockMargins);
}

/**
 * @method setBorderInline
 */
LayoutDimensionsGetSet.prototype.setFromBorderInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value + this.summedInlineMargins);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value - this.summedInlineBorders);
}

/**
 * @method setBorderBlock
 */
LayoutDimensionsGetSet.prototype.setFromBorderBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value + this.summedBlockMargins);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value - this.summedBlockBorders);
}

/**
 * @method setOuterInline
 */
LayoutDimensionsGetSet.prototype.setFromOuterInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value - this.summedInlineMargins);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value - this.summedInlineBorders - this.summedInlineMargins);
}

/**
 * @method setOuterBlock
 */
LayoutDimensionsGetSet.prototype.setFromOuterBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value - this.summedBlockMargins);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value - this.summedBlockBorders - this.summedBlockMargins);
}













module.exports = LayoutDimensionsGetSet;