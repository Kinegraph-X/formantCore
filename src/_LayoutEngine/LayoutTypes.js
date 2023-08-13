/*
 * @typedef LayoutTypes
 */
 
// var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');

var LayoutAvailableSpaceBuffer = require('src/_LayoutEngine/LayoutAvailableSpaceBuffer');
var LayoutDimensionsBuffer = require('src/_LayoutEngine/LayoutDimensionsBuffer');
var LayoutOffsetsBuffer = require('src/_LayoutEngine/LayoutOffsetsBuffer');

var layoutAvailableSpaceBuffer = new LayoutAvailableSpaceBuffer();
var layoutDimensionsBuffer = new LayoutDimensionsBuffer();
var layoutOffsetsBuffer = new LayoutOffsetsBuffer();
 
 
var LayoutTypes = {};



var AvailableSpace = function(initialValues) {
	CoreTypes.DimensionsPair.call(this, initialValues);

	this.inlineOffset = (initialValues && initialValues[2]) || 0;
	this.blockOffset = (initialValues && initialValues[3]) || 0;
	this.lastInlineOffset = 0;
	this.lastBlockOffset = 0;
	this.tempInlineOffset = 0;
	this.tempBlockOffset = 0;
	
	this.childCount = 0;
	this.shouldGrowChildCount = 0;
	this.shouldShrinkChildCount = 0;
}
AvailableSpace.prototype = Object.create(CoreTypes.DimensionsPair.prototype);
AvailableSpace.prototype.objectType = 'AvailableSpace';










var BoxDimensions = function(initialValues) {
	this.inline = initialValues ? initialValues[0] : 0;
	this.block = initialValues ? initialValues[1] : 0;
	this.borderInline = initialValues ? initialValues[2] : 0;
	this.borderBlock = initialValues ? initialValues[3] : 0;
	this.outerInline = initialValues ? initialValues[4] : 0;
	this.outerBlock = initialValues ? initialValues[5] : 0;
}
BoxDimensions.prototype = {};
BoxDimensions.prototype.objectType = 'BoxDimensions';

BoxDimensions.prototype.set = function(valuesSixt) {
	this.inline = valuesSixt[0] || 0;
	this.block = valuesSixt[1] || 0;
	this.borderInline = valuesSixt[2] || 0;
	this.borderBlock = valuesSixt[3] || 0;
	this.outerInline = valuesSixt[4] || 0;
	this.outerBlock = valuesSixt[5] || 0;
	return this;
}
BoxDimensions.prototype.setInnerSize = function(valuesPair) {
	this.inline = valuesPair[0] || 0;
	this.block = valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.setBorderSize = function(valuesPair) {
	this.borderInline = valuesPair[0] || 0;
	this.borderBlock = valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.setOuterSize = function(valuesPair) {
	this.outerInline = valuesPair[0] || 0;
	this.outerBlock = valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.add = function(valuesSixt) {
	this.inline += valuesSixt[0] || 0;
	this.block += valuesSixt[1] || 0;
	this.borderInline += valuesSixt[2] || 0;
	this.borderBlock += valuesSixt[3] || 0;
	this.outerInline += valuesSixt[4] || 0;
	this.outerBlock += valuesSixt[5] || 0;
	return this;
}
BoxDimensions.prototype.addToInnerSize = function(valuesPair) {
	this.inline += valuesPair[0] || 0;
	this.block += valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.addToBorderSize = function(valuesPair) {
	this.borderInline += valuesPair[0] || 0;
	this.borderBlock += valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.addToOuterSize = function(valuesPair) {
	this.outerInline += valuesPair[0] || 0;
	this.outerBlock += valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.substract = function(valuesSixt) {
	this.inline -= valuesSixt[0] || 0;
	this.block -= valuesSixt[1] || 0;
	this.borderInline -= valuesSixt[2] || 0;
	this.borderBlock -= valuesSixt[3] || 0;
	this.outerInline -= valuesSixt[4] || 0;
	this.outerBlock -= valuesSixt[5] || 0;
	return this;
}
BoxDimensions.prototype.substractFromInnerSize = function(valuesPair) {
	this.inline -= valuesPair[0] || 0;
	this.block -= valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.substractFromBorderSize = function(valuesPair) {
	this.borderInline -= valuesPair[0] || 0;
	this.borderBlock -= valuesPair[1] || 0;
	return this;
}
BoxDimensions.prototype.substractFromOuterSize = function(valuesPair) {
	this.outerInline -= valuesPair[0] || 0;
	this.outerBlock -= valuesPair[1] || 0;
	return this;
}









var BoxOffsets = function(initialValues) {
	this.inline = initialValues ? initialValues[0] : 0;
	this.block = initialValues ? initialValues[1] : 0;
	this.marginInline = initialValues ? initialValues[2] : 0;
	this.marginBlock = initialValues ? initialValues[3] : 0;
}
BoxOffsets.prototype = {};
BoxOffsets.prototype.objectType = 'BoxOffsets';

BoxOffsets.prototype.set = function(valuesQuart) {
	this.inline = valuesQuart[0] || 0;
	this.block = valuesQuart[1] || 0;
	this.borderInline = valuesQuart[2] || 0;
	this.borderBlock = valuesQuart[3] || 0;
	return this;
}
BoxOffsets.prototype.setMarginOffsets = function(valuesPair) {
	this.marginInline = valuesPair[0] || 0;
	this.marginBlock = valuesPair[1] || 0;
	return this;
}

BoxOffsets.prototype.add = function(valuesQuart) {
	this.inline += valuesQuart[0] || 0;
	this.block += valuesQuart[1] || 0;
	this.marginInline += valuesQuart[2] || 0;
	this.marginBlock += valuesQuart[3] || 0;
	return this;
}
BoxOffsets.prototype.addToMarginOffsets = function(valuesPair) {
	this.marginInline += valuesPair[0] || 0;
	this.marginBlock += valuesPair[1] || 0;
	return this;
}
BoxOffsets.prototype.substract = function(valuesQuart) {
	this.inline -= valuesQuart[0] || 0;
	this.block -= valuesQuart[1] || 0;
	this.marginInline -= valuesQuart[2] || 0;
	this.marginBlock -= valuesQuart[3] || 0;
	return this;
}
BoxOffsets.prototype.substractFromMarginOffsets = function(valuesPair) {
	this.marginInline -= valuesPair[0] || 0;
	this.marginBlock -= valuesPair[1] || 0;
	return this;
}











var FlexContext = function(ctxUID, parentCtx) {
	this._UID = ctxUID;
	this._parent = parentCtx || null;
	this.childCtxList = {};
}
FlexContext.prototype = {};
FlexContext.prototype.objectType = 'FlexContext';












console.log(layoutAvailableSpaceBuffer);






LayoutTypes.AvailableSpace = AvailableSpace;
LayoutTypes.BoxDimensions = BoxDimensions;
LayoutTypes.BoxOffsets = BoxOffsets;
LayoutTypes.FlexContext = FlexContext;

LayoutTypes.layoutAvailableSpaceBuffer = layoutAvailableSpaceBuffer;
LayoutTypes.layoutDimensionsBuffer = layoutDimensionsBuffer;
LayoutTypes.layoutOffsetsBuffer = layoutOffsetsBuffer;

module.exports = LayoutTypes;