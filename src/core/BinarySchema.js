/**
 * constructor BinarySchema
 */

var TypeManager = require('src/core/TypeManager');
var BinarySlice = require('src/core/BinarySlice');






var BinarySchema = function(name, propsList, sizes) {
	this.objectType = 'BinarySchema';
	
	if (!BinarySchema.schemas.name) {
		var objectSize = 0;
		propsList.forEach(function(propName, key) {
			objectSize += sizes[key];
		}, this);
			
		var schema = function(propertiesList, sizesFromSchema) {
			var size = 0;
			propertiesList.forEach(function(propName, key) {
				this[propName] = new BinarySlice(size, sizesFromSchema[key]);
				size += sizesFromSchema[key];
			}, this);
		}
		Object.defineProperty(schema.prototype, 'objectType', {
			value : 'BinarySchema'
		});
		Object.defineProperty(schema.prototype, '_name', {
			value : name
		});
		Object.defineProperty(schema.prototype, 'size', {
			value : objectSize
		});
				
		BinarySchema.schemas.name = schema;
//		console.log(new schema(propsList, sizes));
		return new schema(propsList, sizes);
	}
	else
		return new BinarySchema.schemas.name(propsList, sizes);
}

BinarySchema.prototype = {};
BinarySchema.prototype.objectType = 'BinarySchema';

BinarySchema.schemas = {};



































module.exports = BinarySchema;