/**
 * constructor BufferFromSchema
 */

var TypeManager = require('src/core/TypeManager');







var BufferFromSchema = function(binarySchema) {
	this.objectType = 'BufferFromSchema';
//	console.log(binarySchema);
	this._buffer = new Uint8Array(binarySchema.size);
	this.occupancy = new Uint8Array(binarySchema.size / 8);
	
	this.propRef = [];
	
	var offset = 0; 
	for (var prop in binarySchema) {
		this.propRef.push([
			prop,
			offset
		]);
		offset += binarySchema[prop];
	}
	
	this._byteLength = 0;
	this._size = offset;
}

BufferFromSchema.prototype = Object.create(Uint8Array.prototype);
BufferFromSchema.prototype.objectType = 'BufferFromSchema';

BufferFromSchema.eightBitsMasks = [
	0x01,
	0x02,
	0x04,
	0x08,
	0x10,
	0x20,
	0x40,
	0x80
]

BufferFromSchema.prototype.getOffsetForProp = function(propName) {
	var offset = 0;
	this.propRef.forEach(function(propAsArray) {
		if (propAsArray[0] === propName)
			offset = propAsArray[1]; 
	});
	return offset;
}

BufferFromSchema.prototype.set = function(val, offset) {
	// offsets for occupancy map
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
//	if (this._byteLength <= offset) {
//		this._buffer = new Uint8Array(this._buffer.buffer.append(new ArrayBuffer(this._size)));
//		this._byteLength = this._buffer.byteLength;
//	}
	
	this._buffer.set(Array.isArray(val) ? val : [val], offset);
	this.occupancy.set([this.occupancy[startOffset] | BufferFromSchema.eightBitsMasks[onAlignementOffset]]);
}

BufferFromSchema.prototype.invalidate = function(offset) {
	// offsets for occupancy map
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	this.occupancy.set(this.occupancy[startOffset] & ~BufferFromSchema.eightBitsMasks[onAlignementOffset]);
}






module.exports = BufferFromSchema;