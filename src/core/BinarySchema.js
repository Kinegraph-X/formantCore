/**
 * constructor BinarySchemaFactory
 */

var TypeManager = require('src/core/TypeManager');
var BinarySlice = require('src/core/BinarySlice');






var BinarySchemaFactory = function(name, propsList, sizes) {
	
	if (!BinarySchemaFactory.schemas[name]) {
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
		
		schema.prototype = {};
		Object.defineProperty(schema.prototype, 'objectType', {
			value : 'BinarySchema'
		});
		Object.defineProperty(schema.prototype, '_name', {
			value : name
		});
		Object.defineProperty(schema.prototype, 'size', {
			value : objectSize
		});
		
		BinarySchemaFactory.schemas[name] = schema;
//		console.log(new schema(propsList, sizes));
		return new schema(propsList, sizes);
	}
	else
		return new BinarySchemaFactory.schemas[name](propsList, sizes);
}

BinarySchemaFactory.prototype = {};
BinarySchemaFactory.prototype.objectType = 'BinarySchemaFactory';

BinarySchemaFactory.schemas = {};



































module.exports = BinarySchemaFactory;