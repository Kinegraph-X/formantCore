/*
 * @ctor LayoutOffsetsGetSet
 */

//var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var offsetsBuffer = LayoutTypes.layoutOffsetsBuffer;






/**
 * @constructor LayoutOffsetsGetSet
 * @param layoutNode {LayoutNode}
 * @param layoutAlgo {mixed LayoutAlgo}
 */
var LayoutOffsetsGetSet = function(layoutNode, layoutAlgo) {
	this.addValue(layoutNode._UID);
	this.relatedUID = layoutNode._UID;
	
	this.marginInlineStart = layoutAlgo.cs.getMarginInlineStart();
	this.marginBlockStart = layoutAlgo.cs.getMarginBlockStart();
	
	this.summedInlinePaddings = layoutAlgo.getSummedInlinePaddings();
	this.summedBlockPaddings = layoutAlgo.getSummedBlockPaddings();
	this.summedInlineBorders = layoutAlgo.getSummedInlineBorders();
	this.summedBlockBorders = layoutAlgo.getSummedBlockBorders();
	this.summedInlineMargins = layoutAlgo.getSummedInlineMargins();
	this.summedBlockMargins = layoutAlgo.getSummedBlockMargins();
}
LayoutOffsetsGetSet.prototype = {}
LayoutOffsetsGetSet.prototype.objectType = 'LayoutOffsetsGetSet';
LayoutOffsetsGetSet.prototype.valuesList = Object.keys(new LayoutTypes.BoxOffsets());
LayoutOffsetsGetSet.prototype.valuesPositions = (function() {
	var ret = {};
	LayoutOffsetsGetSet.prototype.valuesList.forEach(function(valueName, key) {
		ret[valueName] = key;
	});
	return ret;
})();

/**
 * @method getAtPosForValue
 */
LayoutOffsetsGetSet.prototype.getAtPosForValue = function(valueName) {
	return this.valuesPositions[valueName];
}

/**
 * @method addValue
 */
LayoutOffsetsGetSet.prototype.addValue = function(UID) {
	offsetsBuffer.addValue(UID);
}

/**
 * @method getValues
 */
LayoutOffsetsGetSet.prototype.getValues = function() {
	var ret = {};
	offsetsBuffer.getValues(this.relatedUID).forEach(function(value, key) {
		ret[this.valuesList[key]] = value;
	}, this);
	return ret;
}

/**
 * @method getValues
 */
LayoutOffsetsGetSet.prototype.setValues = function(values) {
	// TODO: Benchmark id it's visibly faster to use the offsetsBuffer.setValues method
	// (Only used by textLayout until now, it should not be measurable)
	for (var valueName in this.valuesPositions) {
		offsetsBuffer.setValueAtPos(
			this.relatedUID,
			this.valuesPositions[valueName],
			values[this.valuesPositions[valueName]]
		);
	}
}

/**
 * @method getInline
 */
LayoutOffsetsGetSet.prototype.getInline = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 0);
}

/**
 * @method getBlock
 */
LayoutOffsetsGetSet.prototype.getBlock = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 1);
}

/**
 * @method getBorderInline
 */
LayoutOffsetsGetSet.prototype.getMarginInline = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 2);
}

/**
 * @method getBorderBlock
 */
LayoutOffsetsGetSet.prototype.getMarginBlock = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 3);
}





/**
 * @method setInline
 */
LayoutOffsetsGetSet.prototype.setInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBlock
 */
LayoutOffsetsGetSet.prototype.setBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 1, value);
}

/**
 * @method setBorderInline
 */
LayoutOffsetsGetSet.prototype.setMarginInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 2, value);
}

/**
 * @method setBorderBlock
 */
LayoutOffsetsGetSet.prototype.setMarginBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 3, value);
}





/**
 * @method setInline
 */
LayoutOffsetsGetSet.prototype.setFromInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 0, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 2, value + this.marginInlineStart);
}

/**
 * @method setBlock
 */
LayoutOffsetsGetSet.prototype.setFromBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 1, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 3, value + this.marginBlockStart);
}

/**
 * @method setBorderInline
 */
LayoutOffsetsGetSet.prototype.setFromMarginInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 2, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 0, value - this.marginInlineStart);
}

/**
 * @method setBorderBlock
 */
LayoutOffsetsGetSet.prototype.setFromMarginBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 3, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 1, value - this.marginBlockStart);
}














module.exports = LayoutOffsetsGetSet;