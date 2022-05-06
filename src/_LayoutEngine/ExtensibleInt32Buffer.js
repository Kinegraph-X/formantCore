/*
 * @ctor ExtensibleInt32Buffer
 */
 
//var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');








/**
 * @constructor ExtensibleInt32Buffer
 * 
 */
var ExtensibleInt32Buffer = function() {
	this.objectType = 'ExtensibleInt32Buffer';
	this._bufferIndex = new Array(this.defaultValuesCount);
	this._bufferIndex.fill(0);
	this._arrayBuffer = new ArrayBuffer(this.defaultValuesCount * this.itemSize);
	this._buffer = new DataView(this._arrayBuffer);
}
ExtensibleInt32Buffer.prototype = {}
ExtensibleInt32Buffer.prototype.objectType = 'ExtensibleInt32Buffer';
ExtensibleInt32Buffer.prototype.valueSize = 4;		// 4 * 8 = 32 bits signed Integers
ExtensibleInt32Buffer.prototype.defaultValuesCount = 100;


/**
 * @method extendAndAddValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.extendAndAddValue = function(UID) {
	var extendedArrayBuffer = new Int32Array(this._arrayBuffer.byteLength + this.defaultValuesCount);
	extendedArrayBuffer.set(0, this._arrayBuffer);
	this._arrayBuffer = extendedArrayBuffer.buffer;
	this._buffer = new DataView(extendedArrayBuffer);
	
	var extensionBufferIndex = new Array(this.defaultValuesCount);
	extensionBufferIndex.fill(0);
	this._bufferIndex.push.apply(this._bufferIndex, extensionBufferIndex);
	
	this.realAddValue(UID);
}

/**
 * @method addValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.addValue = function(UID) {
	this.addValueArray[+(UID >= this._bufferIndex.length)].call(this, UID);
}

/**
 * @method realAddValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.realAddValue = function(UID) {
	this.setPosForItem(UID);
}

/**
 * @constant addValueArray
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.addValueArray = [
	ExtensibleInt32Buffer.prototype.realAddValue,
	ExtensibleInt32Buffer.prototype.extendAndAddValue
];



/**
 * @method reset
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.reset = function() {
	this._bufferIndex.fill(0);
	(new Int32Array(this._arrayBuffer)).fill(0);
}

/**
 * @method getPosForItem
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.getPosForItem = function(UID) {
	return this._bufferIndex[UID];
}

/**
 * @method setPosForItem
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.setPosForItem = function(UID) {
	this._bufferIndex[UID] = parseInt(UID) * this.itemSize;
}



/**
 * @method getValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.getValues = function(UID) {
	var pos = this.getPosForItem(UID), ret = [];
	for (var i = pos, end  = i + this.itemSize; i < end; i += this.valueSize) {
		ret.push(this._buffer.getInt32(i));
	}
	return ret;
}

/**
 * @method setValues
 * @param UID {String}
 * @param values {Number}
 */
ExtensibleInt32Buffer.prototype.setValues = function(UID, ...values) {
	var pos = this.getPosForItem(UID);
	values.forEach(function(val, key) {
		this._buffer.setInt32(pos + key * this.valueSize, val);
	}, this);
}

/**
 * @method getValueAtPos
 * @param UID {String}
 * @param atPos {Number}
 */
ExtensibleInt32Buffer.prototype.getValueAtPos = function(UID, atPos) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.getInt32(pos);
}

/**
 * @method setValueAtPos
 * @param UID {String}
 * @param atPos {Number}
 * @param value {Number}
 */
ExtensibleInt32Buffer.prototype.setValueAtPos = function(UID, atPos, value) {
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.setInt32(pos, value);
}














module.exports = ExtensibleInt32Buffer;