/*
 * @ctor LayoutOffsetsBuffer
 */
 
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');








/**
 * @conbstructor LayoutOffsetsBuffer
 * 
 */
var LayoutOffsetsBuffer = function() {
	this.objectType = 'LayoutOffsetsBuffer';
	this.itemSize = this.bufferValuesCount * this.valueSize;
	this._bufferIndex = new Array(this.defaultValuesCount);
	this._bufferIndex.fill(0);
	this._buffer = new DataView(new ArrayBuffer(this.defaultValuesCount * this.itemSize));
}
LayoutOffsetsBuffer.prototype = {}
LayoutOffsetsBuffer.prototype.objectType = 'LayoutOffsetsBuffer';
LayoutOffsetsBuffer.prototype.valueSize = 4;		// 4 * 8 = 32 bits Integers
LayoutOffsetsBuffer.prototype.bufferValuesCount = 4;
LayoutOffsetsBuffer.prototype.defaultValuesCount = 1000;

/**
 * @method reset
 * @param UID {String}
 */
LayoutOffsetsBuffer.prototype.reset = function() {
	this._bufferIndex.fill(0);
	(new Int32Array(this.arrayBuffer)).fill(0);
}

/**
 * @method getPosForItem
 * @param UID {String}
 */
LayoutOffsetsBuffer.prototype.getPosForItem = function(UID) {
	return this._bufferIndex[UID];
}

/**
 * @method setPosForItem
 * @param UID {String}
 */
LayoutOffsetsBuffer.prototype.setPosForItem = function(UID) {
	this._bufferIndex[UID] = parseInt(UID) * this.itemSize;
}

/**
 * @method addValue
 */
LayoutOffsetsBuffer.prototype.addValue = function(UID) {
	this.setPosForItem(UID);
}

/**
 * @method getValue
 * @param UID {String}
 */
LayoutOffsetsBuffer.prototype.getValues = function(UID) {
	var pos = this.getPosForItem(UID), ret = [];
	for (var i = pos, end  = i + this.itemSize; i < end; i += this.valueSize) {
		ret.push(this._buffer.getInt32(i));
	}
	return ret;
}

/**
 * @method setValue
 * @param UID {String}
 */
LayoutOffsetsBuffer.prototype.setValues = function(UID, ...values) {
	var pos = this.getPosForItem(UID);
	values.forEach(function(val, key) {
		this._buffer.setInt32(pos + key * this.valueSize, val);
	}, this);
}

/**
 * @method getValue
 * @param UID {String}
 */
LayoutOffsetsBuffer.prototype.getValueAtPos = function(UID, atPos) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.getInt32(pos);
}

/**
 * @method setValue
 * @param UID {String}
 */
LayoutOffsetsBuffer.prototype.setValueAtPos = function(UID, atPos, value) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.setInt32(pos, value);
}














module.exports = LayoutOffsetsBuffer;