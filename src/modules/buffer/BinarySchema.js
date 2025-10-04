
import BinarySlice from './BinarySlice';


/**
 * BinarySchemaFactory is a utility class for creating binary data schemas 
 * with named properties and fixed offsets.
 * 
 * It enables efficient, structured access to binary buffers 
 * by defining property locations and sizes once, 
 * then reusing those definitions across instances—
 * reducing memory and improving performance.
 * 
 * One primary use of BinarySchemaFactory is in CSSSelectorsList, 
 * where it defines a binary layout for compacted CSS selector data.
 */
class BinarySchemaFactory {
	static objectType = 'BinarySchemaFactory';
	static schemas = {};
	constructor() {
		throw new Error('BinarySchemaFactory is a static class');
	}
		
	static createSchema	(name, propsList, sizes) {
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
			
			return new schema(propsList, sizes);
		}
		else {
			return new BinarySchemaFactory.schemas[name](propsList, sizes);
		}
	}
}



export default BinarySchemaFactory;