/**
 * @module errorHandler
 */

var Factory = require('src/core/Factory');
var constants = require('src/appLauncher/appLauncher');

var classConstructor = function() {
	
}

classConstructor.__factory_name = 'errorHandler';
var factory = Factory.Maker.getSingletonFactory(classConstructor);
module.exports = factory;