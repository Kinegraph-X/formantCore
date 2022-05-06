/*
 * @ctor LayoutAvailableSpaceBuffer
 */
 
var ExtensibleInt32Buffer = require('src/_LayoutEngine/ExtensibleInt32Buffer');








/**
 * @constructor LayoutAvailableSpaceBuffer
 * 
 */
var LayoutAvailableSpaceBuffer = function() {
	this.itemSize = this.bufferValuesCount * this.valueSize;
	ExtensibleInt32Buffer.call(this);
	this.objectType = 'LayoutAvailableSpaceBuffer';
}
LayoutAvailableSpaceBuffer.prototype = Object.create(ExtensibleInt32Buffer.prototype)
LayoutAvailableSpaceBuffer.prototype.objectType = 'LayoutAvailableSpaceBuffer';
LayoutAvailableSpaceBuffer.prototype.bufferValuesCount = 11;











module.exports = LayoutAvailableSpaceBuffer;