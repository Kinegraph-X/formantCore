/**
 * @decorator GenericPanelComponentDecorator
 */


var TypeManager = require('src/core/TypeManager');
var AppIgnition = require('src/core/AppIgnition');


var GenericPanelComponentDecorator = function(componentClass, ...args) {

	var componentTypeAsADecorator = AppIgnition.componentTypes.GenericTitledPanelComponent;

	var decoratedType = function(definition, parentView, parent, hostedComponentDefinition) {
		this._hostedDefUID = hostedComponentDefinition.getHostDef().UID;
		AppIgnition.componentTypes.AbstractComponent.prototype.mergeDefaultDefinition.call(componentClass.prototype, hostedComponentDefinition);
		
		// hostedComponentDefinition is now a unique concrete def decorated through the component's default def
		GenericPanelComponentDecorator.populateHostsDefinitionsCacheRegister(hostedComponentDefinition);
		TypeManager.typedHostsRegister.setItem(this._hostedDefUID, []);
		
		componentTypeAsADecorator.call(this, definition, parentView, parent);
		
		this.objectType = 'GenericPanelHosting' + componentClass.prototype.objectType;
	}
	decoratedType.prototype = Object.create(componentTypeAsADecorator.prototype);
	decoratedType.prototype.objectType = 'GenericPanelHosting' + componentClass.prototype.objectType;
	
	// SlidingBox already uses an _async view-instanciation logic	
	// decoratedType.prototype._asyncInitTasks = [];
	
	// HERE componentClass is added on the prototype of the slidingPanel
	// BUT shall be different on each call to the decorator
	// We should then INHERIT from the SlidingPanel, not decorate the type
	
	Object.defineProperty(decoratedType.prototype, '_asyncInitTasks', {
		value : componentTypeAsADecorator.prototype._asyncInitTasks.slice(0)
	});
	decoratedType.prototype._asyncInitTasks.push(new TypeManager.TaskDefinition({
		type : 'lateAddChild',
		task : function(definition) {
					new componentClass(
						TypeManager.hostsDefinitionsCacheRegister.getItem(this._hostedDefUID),
						this.view.subViewsHolder.memberViews[2],
						this,
						...args
					);
		}
	}));
	
	decoratedType.prototype.beforeRegisterEvents = function() {
		this.streams.updateTrigger.value = 'initialized through SlidingBoxDecorator';
	}
	return decoratedType;
	
}

GenericPanelComponentDecorator.populateHostsDefinitionsCacheRegister = function(definition) {
	var hostDefinition = definition.getHostDef();
	
	for (let prop in TypeManager.caches) {
		TypeManager.caches[prop].setItem(hostDefinition.UID, hostDefinition[prop]);
	}
	
	TypeManager.hostsDefinitionsCacheRegister.setItem(hostDefinition.UID, definition);
}








module.exports = GenericPanelComponentDecorator;