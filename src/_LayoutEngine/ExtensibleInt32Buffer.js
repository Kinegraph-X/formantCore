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
	
	// WARNING
	// The implementation of the constructor must define this.itemSize (valueSize * bufferValuesCount)
	
	this._bufferIndex = new Array(this.defaultValuesCount);
	this._bufferIndex.fill(0);
	this._arrayBuffer = new ArrayBuffer(this.defaultValuesCount * this.itemSize);
	this._buffer = new DataView(this._arrayBuffer);
}
ExtensibleInt32Buffer.prototype = {}
ExtensibleInt32Buffer.prototype.objectType = 'ExtensibleInt32Buffer';
ExtensibleInt32Buffer.prototype.valueSize = 4;		// 4 * 8 = 32 bits signed Integers
ExtensibleInt32Buffer.prototype.defaultValuesCount = 100;
ExtensibleInt32Buffer.prototype.bufferValuesCount = 1;	// Discretoin of the implementor


/**
 * @method extendAndAddValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.extendAndAddValue = function(UID) {
//	console.log('BUFFER EXTENDED');
//	console.log('EXTENDED', this.objectType, new Int32Array(this._arrayBuffer));
	
	var extendedArrayBuffer = new Int32Array(this._arrayBuffer.byteLength / 4 + this.defaultValuesCount * this.bufferValuesCount);
	extendedArrayBuffer.set(new Int32Array(this._arrayBuffer), 0);
	
//	console.log('EXTENDED', this.objectType, extendedArrayBuffer);
	
	var extensionBufferIndex = new Array(this.defaultValuesCount);
	extensionBufferIndex.fill(0);
	this._bufferIndex.push.apply(this._bufferIndex, extensionBufferIndex);
	
//	console.log('EXTENDED', this.objectType, UID, this._bufferIndex);

	this._arrayBuffer = extendedArrayBuffer.buffer;
	this._buffer = new DataView(extendedArrayBuffer.buffer);
	
	this.realAddValue(UID);
}

/**
 * @method addValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.addValue = function(UID) {
	UID = parseInt(UID);
	this.addValueArray[+(UID >= this._bufferIndex.length)].call(this, UID);
}

/**
 * @method realAddValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.realAddValue = function(UID) {
	UID = parseInt(UID);
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
	UID = parseInt(UID);
	return this._bufferIndex[UID];
}

/**
 * @method setPosForItem
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.setPosForItem = function(UID) {
	UID = parseInt(UID);
	this._bufferIndex[UID] = UID * this.itemSize;
//	console.log('setPosForProp', UID, this._bufferIndex[UID]);
}



/**
 * @method getValue
 * @param UID {String}
 */
ExtensibleInt32Buffer.prototype.getValues = function(UID) {
	UID = parseInt(UID);
	var pos = this.getPosForItem(UID), ret = [];
	for (var i = pos, end  = i + this.itemSize; i < end; i += this.valueSize) {
		ret.push(this._buffer.getInt32(i, true));
	}
	return ret;
}

/**
 * @method setValues
 * @param UID {String}
 * @param values {Number}
 */
ExtensibleInt32Buffer.prototype.setValues = function(UID, ...values) {
	UID = parseInt(UID);
	var pos = this.getPosForItem(UID);
	values.forEach(function(val, key) {
		this._buffer.setInt32(pos + key * this.valueSize, val, true);
	}, this);
}

/**
 * @method getValueAtPos
 * @param UID {String}
 * @param atPos {Number}
 */
ExtensibleInt32Buffer.prototype.getValueAtPos = function(UID, atPos) {
	UID = parseInt(UID);
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	return this._buffer.getInt32(pos, true);
}

/**
 * @method setValueAtPos
 * @param UID {String}
 * @param atPos {Number}
 * @param value {Number}
 */
ExtensibleInt32Buffer.prototype.setValueAtPos = function(UID, atPos, value) {
//	if (UID === '7' && atPos === 2)
//		console.error(value);
	UID = parseInt(UID);
	var pos = this.getPosForItem(UID) + atPos * this.valueSize;
	this._buffer.setInt32(pos, value, true);
//	console.log(this.objectType + ' ' + 'setValueAtPos', UID, this.getPosForItem(UID), atPos, this._buffer.getInt32(pos, true));
	return this._buffer.setInt32(pos, value, true);
}














module.exports = ExtensibleInt32Buffer;