/**
 * @constructor MemoryCSSPropertyBuffer
 */


var TypeManager = require('src/core/TypeManager');
var BinarySchemaFactory = require('src/core/BinarySchema');


var MemoryCSSPropertyBuffer = function(initialLoad) {
	this.objectType = 'MemoryCSSPropertyBuffer';

	//	this._occupancy = new Uint8Array(bufferSize);

	this._buffer = new Uint8Array(propsCount);


}
MemoryCSSPropertyBuffer.prototype = Object.create(Uint8Array.prototype);
MemoryCSSPropertyBuffer.prototype.objectType = 'MemoryCSSPropertyBuffer';






//var sample = {
//	token: "DIMENSION",
//	value: 1,
//	type: "integer",
//	repr: "1",
//	unit: "px"
//}

MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema = BinarySchemaFactory(
	'compactedViewOnProperty',
	[
		'tokenType',
		'propertyValue',
		'propertyType',
		'repr',
		'unit'
	],
	[
		1,
		2,
		1,
		3,
		1
	]
);









module.exports = MemoryCSSPropertyBuffer;