/**
 * constructor BufferFromSchema
 */

var TypeManager = require('src/core/TypeManager');
var BinarySlice = require('src/core/BinarySlice');






var BufferFromSchema = function(binarySchema, initialLoad) {
	this.objectType = 'BufferFromSchema';
	
	this.binarySchema = {};
	var offset = 0;
	for (var prop in binarySchema) {
		if (!binarySchema.hasOwnProperty(prop))
			return;
		this.binarySchema[prop] = new BinarySlice(
			binarySchema[prop].start,
			binarySchema[prop].length
		);
		offset += binarySchema[prop].length;
	}
//	console.log(binarySchema.size);
	this._buffer = new Uint8Array(binarySchema.size);
	this.occupancy = new Uint8Array(binarySchema.size / 8);
	this._byteLength = 0;
	
	if (initialLoad)
		this.set(initialLoad, 0);
	
//	console.log(this.binarySchema);
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

// TODO: retrieve the binary length from the BinarySchema
// TODO: benchmark resolving integers that are longer than 8bits
// using a DataView or another TypedArray
BufferFromSchema.prototype.get = function(idx, binaryLength) {
	if (!binaryLength)
		return this._buffer[idx];
	else {
		// we unpack 16 and 32 bits integers here
		var ret = 0, bitwiseOffset = 0;
		for (let i = idx, l = idx + binaryLength; i < l; i++) {
			ret = ret | (this._buffer[i] << bitwiseOffset * 8);
			bitwiseOffset++;
		}
		return ret;
	}
}

BufferFromSchema.prototype.getOffsetForProp = function(propName) {
	var offset = 0;
	this.propRef.forEach(function(propAsArray) {
		if (propAsArray[0] === propName)
			offset = propAsArray[1]; 
	});
	return offset;
}

BufferFromSchema.prototype.set = function(val, offset) {
	val = (Array.isArray(val) || Object.getPrototypeOf(val) === Uint8Array.prototype) ? val : [val];
	// offsets for occupancy map
	offset = typeof offset !== 'number' ? this._byteLength : offset;
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	this._buffer.set(val, offset);
	this.occupancy.set([this.occupancy[startOffset] | BufferFromSchema.eightBitsMasks[onAlignementOffset]]);
	this._byteLength = (offset && Math.max(offset + val.length, this._byteLength)) || val.length;
//	console.log(this._byteLength);
}

BufferFromSchema.prototype.invalidate = function(offset) {
	// offsets for occupancy map
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	this.occupancy.set(this.occupancy[startOffset] & ~BufferFromSchema.eightBitsMasks[onAlignementOffset]);
}






module.exports = BufferFromSchema;