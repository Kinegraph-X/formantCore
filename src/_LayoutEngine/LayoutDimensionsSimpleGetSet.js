/*
 * @ctor LayoutSimpleDimensionsGetSet
 */

//var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var dimensionsBuffer = LayoutTypes.layoutDimensionsBuffer;






/**
 * @constructor LayoutSimpleDimensionsGetSet
 * @param layoutNode {LayoutNode}
 * @param layoutAlgo {LayoutLago}
 */
var LayoutSimpleDimensionsGetSet = function(layoutNode, layoutAlgo) {
	this.addValue(layoutNode._UID);
	this.relatedUID = layoutNode._UID;
}
LayoutSimpleDimensionsGetSet.prototype = {}
LayoutSimpleDimensionsGetSet.prototype.objectType = 'LayoutSimpleDimensionsGetSet';
LayoutSimpleDimensionsGetSet.prototype.valuesList = Object.keys(new LayoutTypes.BoxDimensions());
LayoutSimpleDimensionsGetSet.prototype.valuesPositions = (function() {
	var ret = {};
	LayoutSimpleDimensionsGetSet.prototype.valuesList.forEach(function(valueName, key) {
		ret[valueName] = key;
	});
	return ret;
})();

/**
 * @method getAtPosForValue
 */
LayoutSimpleDimensionsGetSet.prototype.getAtPosForValue = function(valueName) {
	return this.valuesPositions[valueName];
}

/**
 * @method addValue
 */
LayoutSimpleDimensionsGetSet.prototype.addValue = function(UID) {
	dimensionsBuffer.addValue(UID);
}

/**
 * @method getValues
 */
LayoutSimpleDimensionsGetSet.prototype.getValues = function() {
	var ret = {};
	dimensionsBuffer.getValues(this.relatedUID).forEach(function(value, key) {
		ret[this.valuesList[key]] = value;
	}, this);
	return ret;
}

/**
 * @method getValues
 */
LayoutSimpleDimensionsGetSet.prototype.setValues = function(values) {
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
LayoutSimpleDimensionsGetSet.prototype.getInline = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 0);
}

/**
 * @method getBlock
 */
LayoutSimpleDimensionsGetSet.prototype.getBlock = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 1);
}

/**
 * @method getBorderInline
 */
LayoutSimpleDimensionsGetSet.prototype.getBorderInline = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 2);
}

/**
 * @method getBorderBlock
 */
LayoutSimpleDimensionsGetSet.prototype.getBorderBlock = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 3);
}

/**
 * @method getOuterInline
 */
LayoutSimpleDimensionsGetSet.prototype.getOuterInline = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 4);
}

/**
 * @method getOuterBlock
 */
LayoutSimpleDimensionsGetSet.prototype.getOuterBlock = function() {
	return dimensionsBuffer.getValueAtPos(this.relatedUID, 5);
}






/**
 * @method setInline
 */
LayoutSimpleDimensionsGetSet.prototype.setInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBlock
 */
LayoutSimpleDimensionsGetSet.prototype.setBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
}

/**
 * @method setBorderInline
 */
LayoutSimpleDimensionsGetSet.prototype.setBorderInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
}

/**
 * @method setBorderBlock
 */
LayoutSimpleDimensionsGetSet.prototype.setBorderBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
}

/**
 * @method setOuterInline
 */
LayoutSimpleDimensionsGetSet.prototype.setOuterInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
}

/**
 * @method setOuterBlock
 */
LayoutSimpleDimensionsGetSet.prototype.setOuterBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value);
}






/**
 * @method setInline
 */
LayoutSimpleDimensionsGetSet.prototype.setFromInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
}

/**
 * @method setBlock
 */
LayoutSimpleDimensionsGetSet.prototype.setFromBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value );
}

/**
 * @method setBorderInline
 */
LayoutSimpleDimensionsGetSet.prototype.setFromBorderInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBorderBlock
 */
LayoutSimpleDimensionsGetSet.prototype.setFromBorderBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
}

/**
 * @method setOuterInline
 */
LayoutSimpleDimensionsGetSet.prototype.setFromOuterInline = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 4, value);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 2, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setOuterBlock
 */
LayoutSimpleDimensionsGetSet.prototype.setFromOuterBlock = function(value) {
	dimensionsBuffer.setValueAtPos(this.relatedUID, 5, value);
	
	dimensionsBuffer.setValueAtPos(this.relatedUID, 3, value);
	dimensionsBuffer.setValueAtPos(this.relatedUID, 1, value);
}













module.exports = LayoutSimpleDimensionsGetSet;