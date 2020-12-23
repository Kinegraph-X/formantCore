/**
 * @decorator SlidingPanelComponentDecorator
 */


var TypeManager = require('src/core/TypeManager');
var AppIgnition = require('src/core/AppIgnition');


var SlidingPanelComponentDecorator = function(componentClass) {

	var componentTypeAsADecorator = AppIgnition.componentTypes.SlidingPanel;

	var decoratedType = function(definition, parentView, parent, hostedComponentDefinition) {
		this._hostedDefUID = hostedComponentDefinition.getHostDef().UID;
		AppIgnition.componentTypes.AbstractComponent.prototype.mergeDefaultDefinition.call(componentClass.prototype, hostedComponentDefinition);
		
		// hostedComponentDefinition is now a unique concrete def decorated through the component's default def
		SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegister(hostedComponentDefinition);
		TypeManager.typedHostsRegister.setItem(this._hostedDefUID, []);
		
		componentTypeAsADecorator.call(this, definition, parentView, parent);
	}
	decoratedType.prototype = Object.create(componentTypeAsADecorator.prototype);
	
	// SlidingPanel already uses an _async view-instanciation logic	
	// decoratedType.prototype._asyncInitTasks = [];
	decoratedType.prototype._asyncInitTasks.push(new TypeManager.TaskDefinition({
		type : 'lateAddChild',
		task : function(definition) {
					new componentClass(
						TypeManager.hostsDefinitionsCacheRegister.getItem(this._hostedDefUID),
						this.view.subViewsHolder.memberViews[2],
						this
					);
		}
	}));
	
	decoratedType.prototype.beforeRegisterEvents = function() {
		this.streams.updateChannel.value = 'initialized through SlidingPanelDecorator';
	}
	return decoratedType;
	
}

SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegister = function(definition) {
	var hostDefinition = definition.getHostDef();
	
	for (let prop in TypeManager.caches) {
		TypeManager.caches[prop].setItem(hostDefinition.UID, hostDefinition[prop]);
	}
	
	TypeManager.hostsDefinitionsCacheRegister.setItem(hostDefinition.UID, definition);
}








module.exports = SlidingPanelComponentDecorator;