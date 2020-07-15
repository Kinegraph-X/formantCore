/**
 * @module errorHandler
 */

var Factory = require('../core/Factory');
var constants = require('../constants/appConstants');

var classConstructor = function() {

	
}

classConstructor.__factory_name = 'errorHandler';
var factory = Factory.Maker.getSingletonFactory(classConstructor);
module.exports = factory;