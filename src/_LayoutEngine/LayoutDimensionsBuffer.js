/*
 * @ctor LayoutDimensionsBuffer
 */
 
var ExtensibleInt32Buffer = require('src/_LayoutEngine/ExtensibleInt32Buffer');








/**
 * @constructor LayoutDimensionsBuffer
 * 
 */
var LayoutDimensionsBuffer = function() {
	this.itemSize = this.bufferValuesCount * this.valueSize;
	ExtensibleInt32Buffer.call(this);
	this.objectType = 'LayoutDimensionsBuffer';
}
LayoutDimensionsBuffer.prototype = Object.create(ExtensibleInt32Buffer.prototype)
LayoutDimensionsBuffer.prototype.objectType = 'LayoutDimensionsBuffer';
LayoutDimensionsBuffer.prototype.bufferValuesCount = 6;








module.exports = LayoutDimensionsBuffer;