/**
 * @decorator RotativeSlidingPanelComponentDecorator
 */


var TypeManager = require('src/core/TypeManager');
var AppIgnition = require('src/core/AppIgnition');


var SlidingPanelComponentDecorator = function(componentClass, ...args) {

	var componentTypeAsADecorator = AppIgnition.componentTypes.RotativeSlidingPanel;

	var decoratedType = function(definition, parentView, parent, hostedComponentDefinition) {
		this._hostedDefUID = hostedComponentDefinition.getHostDef().UID;
		AppIgnition.componentTypes.AbstractComponent.prototype.mergeDefaultDefinition.call(componentClass.prototype, hostedComponentDefinition);
		
		// hostedComponentDefinition is now a unique concrete def decorated through the component's default def
		SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegister(hostedComponentDefinition);
		TypeManager.typedHostsRegister.setItem(this._hostedDefUID, []);
		
		componentTypeAsADecorator.call(this, definition, parentView, parent);
		
		this.objectType = 'RotativeSlidingPanelHosting' + componentClass.prototype.objectType;
	}
	decoratedType.prototype = Object.create(componentTypeAsADecorator.prototype);
	decoratedType.prototype.objectType = 'RotativeSlidingPanelHosting' + componentClass.prototype.objectType;
	
	// SlidingPanel already uses an _async view-instanciation logic	
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
//					var def = TypeManager.createComponentDef({
//						nodeName : 'li'
//					});
//					var view = new AppIgnition.componentTypes.ComponentWithView(def).view;
//					view._parent = this;
//					view.parentView = this.view.subViewsHolder.memberAt(2);
					new componentClass(
						TypeManager.hostsDefinitionsCacheRegister.getItem(this._hostedDefUID),
						this.view.subViewsHolder.memberAt(2),
						this,
						...args
					);
		}
	}));
	
	decoratedType.prototype.beforeRegisterEvents = function() {
		this.streams.updateTrigger.value = 'initialized through SlidingPanelDecorator';
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