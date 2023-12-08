/*
 * @ctor LayoutAvailableSpaceGetSet
 */

//var TypeManager = require('src/core/TypeManager');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var availableSpaceBuffer = LayoutTypes.layoutAvailableSpaceBuffer;





/**
 * @constructor LayoutAvailableSpaceGetSet
 * @param layoutNode {LayoutNode}
 * @param layoutAlgo {mixed LayoutAlgo}
 */
var LayoutAvailableSpaceGetSet = function(layoutNode, layoutAlgo) {
	this.addValue(layoutNode._UID);
	this.relatedUID = layoutNode._UID;
}
LayoutAvailableSpaceGetSet.prototype = {}
LayoutAvailableSpaceGetSet.prototype.objectType = 'LayoutAvailableSpaceGetSet';
LayoutAvailableSpaceGetSet.prototype.valuesList = Object.keys(new LayoutTypes.AvailableSpace());
LayoutAvailableSpaceGetSet.prototype.valuesPositions = (function() {
	var ret = {};
	LayoutAvailableSpaceGetSet.prototype.valuesList.forEach(function(valueName, key) {
		ret[valueName] = key;
	});
	return ret;
})();

/**
 * @method getAtPosForValue
 */
LayoutAvailableSpaceGetSet.prototype.getAtPosForValue = function(valueName) {
	return this.valuesPositions[valueName];
}

/**
 * @method addValue
 */
LayoutAvailableSpaceGetSet.prototype.addValue = function(UID) {
	availableSpaceBuffer.addValue(UID);
}

/**
 * @method getValues
 */
LayoutAvailableSpaceGetSet.prototype.getValues = function() {
	var ret = {};
	availableSpaceBuffer.getValues(this.relatedUID).forEach(function(value, key) {
		ret[this.valuesList[key]] = value;
	}, this);
	return ret;
}

/**
 * @method getValues
 */
LayoutAvailableSpaceGetSet.prototype.setValues = function(values) {
	// TODO: Benchmark id it's visibly faster to use the availableSpaceBuffer.setValues method
	// (Only used by textLayout until now, it should not be measurable)
	for (var valueName in this.valuesPositions) {
		availableSpaceBuffer.setValueAtPos(
			this.relatedUID,
			this.valuesPositions[valueName],
			values[this.valuesPositions[valueName]]
		);
	}
}

/**
 * @method getInline
 */
LayoutAvailableSpaceGetSet.prototype.getInline = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 0);
}

/**
 * @method getBlock
 */
LayoutAvailableSpaceGetSet.prototype.getBlock = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 1);
}

/**
 * @method getInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.getInlineOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 2);
}

/**
 * @method getBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.getBlockOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 3);
}

/**
 * @method getFlexEndInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.getFlexEndInlineOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 4);
}

/**
 * @method getFlexEndBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.getFlexEndBlockOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 5);
}

/**
 * @method getLastInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.getLastInlineOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 6);
}

/**
 * @method getLastBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.getLastBlockOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 7);
}

/**
 * @method getFlexEndLastInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.getFlexEndLastInlineOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 8);
}

/**
 * @method getFlexEndLastBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.getFlexEndLastBlockOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 9);
}

/**
 * @method getTempInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.getTempInlineOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 10);
}

/**
 * @method getTempBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.getTempBlockOffset = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 11);
}

/**
 * @method getChildCount
 */
LayoutAvailableSpaceGetSet.prototype.getChildCount = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 12);
}

/**
 * @method getShouldGrowChildCount
 */
LayoutAvailableSpaceGetSet.prototype.getShouldGrowChildCount = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 13);
}

/**
 * @method getShouldShrinkChildCount
 */
LayoutAvailableSpaceGetSet.prototype.getShouldShrinkChildCount = function() {
	return availableSpaceBuffer.getValueAtPos(this.relatedUID, 14);
}






/**
 * @method setInline
 */
LayoutAvailableSpaceGetSet.prototype.setInline = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 0, value);
}

/**
 * @method setBlock
 */
LayoutAvailableSpaceGetSet.prototype.setBlock = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 1, value);
}

/**
 * @method setInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.setInlineOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 2, value);
}

/**
 * @method setBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.setBlockOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 3, value);
}

/**
 * @method setFlexEndInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.setFlexEndInlineOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 4, value);
}

/**
 * @method setFlexEndBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.setFlexEndBlockOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 5, value);
}

/**
 * @method setLastInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.setLastInlineOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 6, value);
}

/**
 * @method setLastBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.setLastBlockOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 7, value);
}

/**
 * @method setFlexEndLastInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.setFlexEndLastInlineOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 8, value);
}

/**
 * @method setFlexEndLastBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.setFlexEndLastBlockOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 9, value);
}

/**
 * @method setTempInlineOffset
 */
LayoutAvailableSpaceGetSet.prototype.setTempInlineOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 10, value);
}

/**
 * @method setTempBlockOffset
 */
LayoutAvailableSpaceGetSet.prototype.setTempBlockOffset = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 11, value);
}

/**
 * @method setChildCount
 */
LayoutAvailableSpaceGetSet.prototype.setChildCount = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 12, value);
}

/**
 * @method setShouldGrowChildCount
 */
LayoutAvailableSpaceGetSet.prototype.setShouldGrowChildCount = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 13, value);
}

/**
 * @method setShouldShrinkChildCount
 */
LayoutAvailableSpaceGetSet.prototype.setShouldShrinkChildCount = function(value) {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 14, value);
}



/**
 * @method getChildCount
 */
LayoutAvailableSpaceGetSet.prototype.incrementChildCount = function() {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 12, availableSpaceBuffer.getValueAtPos(this.relatedUID, 8) + 1);
}

/**
 * @method getShouldGrowChildCount
 */
LayoutAvailableSpaceGetSet.prototype.incrementShouldGrowChildCount = function() {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 13, availableSpaceBuffer.getValueAtPos(this.relatedUID, 9) + 1);
}

/**
 * @method getShouldShrinkChildCount
 */
LayoutAvailableSpaceGetSet.prototype.incrementShouldShrinkChildCount = function() {
	return availableSpaceBuffer.setValueAtPos(this.relatedUID, 14, availableSpaceBuffer.getValueAtPos(this.relatedUID, 10) + 1);
}













module.exports = LayoutAvailableSpaceGetSet;