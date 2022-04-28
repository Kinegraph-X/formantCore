/*
 * @ctor LayoutDimensionsBuffer
 */
 
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');








/**
 * @conbstructor LayoutDimensionsBuffer
 * 
 */
var LayoutDimensionsBuffer = function() {
	this.objectType = 'LayoutDimensionsBuffer';
	var numberSize = 4;		// 4 * 8 = 32 bits Integers
	this.itemSize = this.bufferValuesCount * this.valueSize;
	this._bufferIndex = new Array(this.defaultValuesCount);
	this._bufferIndex.fill(0);
	this._buffer = new DataView(new ArrayBuffer(this.defaultValuesCount * this.itemSize));
}
LayoutDimensionsBuffer.prototype = {}
LayoutDimensionsBuffer.prototype.objectType = 'LayoutDimensionsBuffer';
LayoutDimensionsBuffer.prototype.valueSize = 4;
LayoutDimensionsBuffer.prototype.bufferValuesCount = Object.values(new LayoutTypes.BoxDimensions()).length;
LayoutDimensionsBuffer.prototype.defaultValuesCount = 1000;

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
 * @method getValue
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.getValue = function(UID) {
	var pos = this.getPosForItem(UID), ret = [];
	for (var i = pos, end  = i + this.itemSize; i < end; i += this.valueSize) {
		ret.push(this._buffer.getUInt32(i));
	}
	return ret;
}

/**
 * @method setValue
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.setValue = function(UID, ...values) {
	var pos = this.getPosForItem(UID);
	values.forEach(function(val, key) {
		this._buffer.setUInt32(pos + key * this.valueSize, val);
	}, this);
}

/**
 * @method getValue
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.getValueAt = function(UID, atPos) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.getUInt32(pos);
}

/**
 * @method setValue
 * @param UID {String}
 */
LayoutDimensionsBuffer.prototype.setValueAt = function(UID, atPos, value) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.setUInt32(pos);
}














module.exports = LayoutDimensionsBuffer;