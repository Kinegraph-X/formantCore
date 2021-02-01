/**
 * @decorator ClientComponentDecorator
 */

var ClientComponentInterface = require('src/core/ClientComponentInterface');
var AppIgnition = require('src/core/AppIgnition');

/**
 * This decorator is extremely abstract: it assumes there exists a concrete interface
 * 		which defines wether we receive the data from an API, or a worker, or anything else.
 * 		That concrete interface shall have a "subscribe" method, to which we pass a "provider" object
 * 		and then the "decorated" component shall subscribe to the "provider" through its "client" interface
 */
var ClientComponentDecorator = function(componentType, concreteInterface) {

	if (componentType in AppIgnition.componentTypes) {
		var inheritingType = AppIgnition.componentTypes[componentType];
		var inheritedType = ClientComponentInterface;
		
		var decoratedType = function(definition, parentView, parent) {
			inheritingType.	apply(this, arguments);
			var objectType = this.objectType;
			
			inheritedType.call(this, concreteInterface, definition);
			this.objectType = objectType;
			
//			console.log(definition);
		};
		
		var proto_proto = Object.create(inheritingType.prototype);
		Object.assign(proto_proto, inheritedType.prototype);
		decoratedType.prototype = Object.create(proto_proto);

		return decoratedType;
	}
	
}








module.exports = ClientComponentDecorator;