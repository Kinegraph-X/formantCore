/*
 * @ctor LayoutOffsetsBuffer
 */
 
var ExtensibleInt32Buffer = require('src/_LayoutEngine/ExtensibleInt32Buffer');








/**
 * @constructor LayoutOffsetsBuffer
 * 
 */
var LayoutOffsetsBuffer = function() {
	this.itemSize = this.bufferValuesCount * this.valueSize;
	ExtensibleInt32Buffer.call(this);
	this.objectType = 'LayoutOffsetsBuffer';
}
LayoutOffsetsBuffer.prototype = Object.create(ExtensibleInt32Buffer.prototype)
LayoutOffsetsBuffer.prototype.objectType = 'LayoutOffsetsBuffer';
LayoutOffsetsBuffer.prototype.bufferValuesCount = 4;











module.exports = LayoutOffsetsBuffer;