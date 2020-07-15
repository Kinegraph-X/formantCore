/**
 * @module errorHandler
 */

var Factory = require('../core/Factory');
var constants = require('../appLaucher/appLauncher');

var classConstructor = function() {
	
}

classConstructor.__factory_name = 'errorHandler';
var factory = Factory.Maker.getSingletonFactory(classConstructor);
module.exports = factory;