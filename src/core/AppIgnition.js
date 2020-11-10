/**
 * @bootstraper AppIgniter
 * @bootstraper ListInjector
 */

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var ComposedComponent = require('src/core/ComposedComponent');






var App = function(definition, containerIdOrContainerNode) {
	return (new ComposedComponent(definition, containerIdOrContainerNode));
}
App.prototype = {};

App.prototype.processDefinitionsCache = function() {
	var states = TypeManager.caches.states.cache;
	for (let defUID in states) {
		states[defUID].forEach(function(stateObj) {
			TypeManager.definitionsCacheRegister.getItem(defUID).streams[stateObj.getName()] = new CoreTypes.Stream(stateObj.getName());
		})
	}
}



















var List = function(definition) {
	
}







module.exports = {
		Ignition : App,
		List : List
}