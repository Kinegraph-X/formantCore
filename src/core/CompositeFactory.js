/**
 * @factory CompositeFactory
 */

var ComposedComponent = require('src/core/ComposedComponent');
var componentTypes = ComposedComponent.componentTypes;


module.exports = function(definition, parent) {
	return new ComposedComponent.prototype.ComponentList(definition, parent.view, parent);
}



