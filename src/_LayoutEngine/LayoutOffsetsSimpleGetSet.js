/*
 * @ctor LayoutOffsetsSimpleGetSet
 */

//var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var offsetsBuffer = LayoutTypes.layoutOffsetsBuffer;






/**
 * @constructor LayoutOffsetsSimpleGetSet
 * @param layoutNode {LayoutNode}
 * @param layoutAlgo {mixed LayoutAlgo}
 */
var LayoutOffsetsSimpleGetSet = function(layoutNode, layoutAlgo) {
	this.addValue(layoutNode._UID);
	this.relatedUID = layoutNode._UID;
}
LayoutOffsetsSimpleGetSet.prototype = {}
LayoutOffsetsSimpleGetSet.prototype.objectType = 'LayoutOffsetsSimpleGetSet';
LayoutOffsetsSimpleGetSet.prototype.valuesList = Object.keys(new LayoutTypes.BoxOffsets());
LayoutOffsetsSimpleGetSet.prototype.valuesPositions = (function() {
	var ret = {};
	LayoutOffsetsSimpleGetSet.prototype.valuesList.forEach(function(valueName, key) {
		ret[valueName] = key;
	});
	return ret;
})();

/**
 * @method getAtPosForValue
 */
LayoutOffsetsSimpleGetSet.prototype.getAtPosForValue = function(valueName) {
	return this.valuesPositions[valueName];
}

/**
 * @method addValue
 */
LayoutOffsetsSimpleGetSet.prototype.addValue = function(UID) {
	offsetsBuffer.addValue(UID);
}

/**
 * @method getValues
 */
LayoutOffsetsSimpleGetSet.prototype.getValues = function() {
	var ret = {};
	offsetsBuffer.getValues(this.relatedUID).forEach(function(value, key) {
		ret[this.valuesList[key]] = value;
	}, this);
	return ret;
}

/**
 * @method getValues
 */
LayoutOffsetsSimpleGetSet.prototype.setValues = function(values) {
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
LayoutOffsetsSimpleGetSet.prototype.getInline = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 0);
}

/**
 * @method getBlock
 */
LayoutOffsetsSimpleGetSet.prototype.getBlock = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 1);
}

/**
 * @method getBorderInline
 */
LayoutOffsetsSimpleGetSet.prototype.getMarginInline = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 2);
}

/**
 * @method getBorderBlock
 */
LayoutOffsetsSimpleGetSet.prototype.getMarginBlock = function() {
	return offsetsBuffer.getValueAtPos(this.relatedUID, 3);
}





/**
 * @method setInline
 */
LayoutOffsetsSimpleGetSet.prototype.setInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBlock
 */
LayoutOffsetsSimpleGetSet.prototype.setBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 1, value);
}

/**
 * @method setBorderInline
 */
LayoutOffsetsSimpleGetSet.prototype.setMarginInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 2, value);
}

/**
 * @method setBorderBlock
 */
LayoutOffsetsSimpleGetSet.prototype.setMarginBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 3, value);
}





/**
 * @method setInline
 */
LayoutOffsetsSimpleGetSet.prototype.setFromInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 0, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 2, value);
}

/**
 * @method setBlock
 */
LayoutOffsetsSimpleGetSet.prototype.setFromBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 1, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 3, value);
}

/**
 * @method setBorderInline
 */
LayoutOffsetsSimpleGetSet.prototype.setFromMarginInline = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 2, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBorderBlock
 */
LayoutOffsetsSimpleGetSet.prototype.setFromMarginBlock = function(value) {
	offsetsBuffer.setValueAtPos(this.relatedUID, 3, value);
	offsetsBuffer.setValueAtPos(this.relatedUID, 1, value);
}














module.exports = LayoutOffsetsSimpleGetSet;