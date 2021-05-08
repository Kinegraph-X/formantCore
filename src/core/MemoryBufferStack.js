/**
 * constructor MemoryBufferStack
 */

var TypeManager = require('src/core/TypeManager');




var MemoryBufferStack = function(itemSize, itemCount, isAbsoluteSize) {
	this.objectType = 'MemoryBufferStack';
	
	this.itemSize = itemSize;
	this._byteLength = 0;
	this._buffer = new Uint8Array(itemSize * itemCount);
	this.occupancy = new Uint8Array(itemSize * itemCount / 8);
}

MemoryBufferStack.prototype = Object.create(Uint8Array.prototype);
MemoryBufferStack.prototype.objectType = 'MemoryBufferStack';

MemoryBufferStack.eightBitsMasks = [
	0x01,
	0x02,
	0x04,
	0x08,
	0x10,
	0x20,
	0x40,
	0x80
]

MemoryBufferStack.prototype.getOffsetForBuffer = function(bufferIndex) {

	return bufferIndex * this.itemSize;
}

MemoryBufferStack.prototype.set = function(val, offset) {
	// offsets for occupancy map
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	if (this._buffer.byteLength >= offset) {
		console.warn('MemoryBufferStack', 'Setting a value at an offset longer than the buffer.', val, idx, ' Returning...');
		return;
	}
	else if (this._buffer.byteLength <= offset)
		this._buffer.buffer.append(new ArrayBuffer(this.itemSize));
	
	this._byteLength = this._buffer.byteLength;
	this._buffer.set(val, offset);
	this.occupancy.set(this.occupancy[startOffset] | MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

MemoryBufferStack.prototype.setFromIndex = function(val, idx) {
	// offsets for occupancy map
	var offset = this.itemSize * idx;
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	if (this._buffer.byteLength >= offset) {
		console.warn('MemoryBufferStack', 'Setting a value at an offset longer than the buffer.', val, idx, ' Returning...');
		return;
	}
	else if (this._buffer.byteLength === offset)
		this._buffer.buffer.append(new ArrayBuffer(this.itemSize));
	
	this._byteLength = this._buffer.byteLength;
	this._buffer.set(val, offset);
	this.occupancy.set(this.occupancy[startOffset] | MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

MemoryBufferStack.prototype.invalidate = function(offset) {
	// offsets for occupancy map
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	this.occupancy.set(this.occupancy[startOffset] & ~MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

MemoryBufferStack.prototype.invalidateFromIndex = function(idx) {
	// offsets for occupancy map
	var offset = this.itemSize * idx;
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	this.occupancy.set(this.occupancy[startOffset] & ~MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

MemoryBufferStack.prototype.append = function(val) {
	// offsets for occupancy map
	var offset = this._buffer.buffer.byteLength;
	
	this._buffer.buffer.append(new ArrayBuffer(this.itemSize));
	if (this.occupancy.buffer.byteLength <= this._buffer.buffer.byteLength / 8)
		this.occupancy.buffer.append(new ArrayBuffer(1));
//	console.log(val);
	this._byteLength = this._buffer.byteLength;
	this._buffer.set(val, offset);
	this.occupancy.set(this.occupancy[offset] | MemoryBufferStack.eightBitsMasks[0]);
}






module.exports = MemoryBufferStack;