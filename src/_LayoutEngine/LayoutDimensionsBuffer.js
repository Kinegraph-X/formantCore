/*
 * @ctor LayoutDimensionsBuffer
 */
 
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');








/**
 * @conbstructor LayoutDimensionsBuffer
 * 
 */
var LayoutDimensionsBuffer = function() {
	this.objectType = 'LayoutDimensionsBuffer';
	this.itemSize = this.bufferValuesCount * this.valueSize;
	this._bufferIndex = new Array(this.defaultValuesCount);
	this._bufferIndex.fill(0);
	this._buffer = new DataView(new ArrayBuffer(this.defaultValuesCount * this.itemSize));
}
LayoutDimensionsBuffer.prototype = {}
LayoutDimensionsBuffer.prototype.objectType = 'LayoutDimensionsBuffer';
LayoutDimensionsBuffer.prototype.valueSize = 4;		// 4 * 8 = 32 bits Integers
LayoutDimensionsBuffer.prototype.bufferValuesCount = 6;
LayoutDimensionsBuffer.prototype.defaultValuesCount = 1000;

/**
 * @method reset
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.reset = function() {
	this._bufferIndex.fill(0);
	(new Int32Array(this.arrayBuffer)).fill(0);
}

/**
 * @method getPosForItem
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.getPosForItem = function(UID) {
	return this._bufferIndex[UID];
}

/**
 * @method setPosForItem
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.setPosForItem = function(UID) {
	this._bufferIndex[UID] = parseInt(UID) * this.itemSize;
}

/**
 * @method addValue
 */
LayoutDimensionsBuffer.prototype.addValue = function(UID) {
	this.setPosForItem(UID);
}

/**
 * @method getValue
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.getValues = function(UID) {
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
LayoutDimensionsBuffer.prototype.setValues = function(UID, ...values) {
	var pos = this.getPosForItem(UID);
	values.forEach(function(val, key) {
		this._buffer.setInt32(pos + key * this.valueSize, val);
	}, this);
}

/**
 * @method getValue
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.getValueAtPos = function(UID, atPos) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.getInt32(pos);
}

/**
 * @method setValue
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.setValueAtPos = function(UID, atPos, value) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.setInt32(pos, value);
}














module.exports = LayoutDimensionsBuffer;