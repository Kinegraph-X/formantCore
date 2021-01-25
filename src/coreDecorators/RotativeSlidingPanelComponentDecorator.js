/**
 * @decorator RotativeSlidingPanelComponentDecorator
 */


var TypeManager = require('src/core/TypeManager');
var AppIgnition = require('src/core/AppIgnition');


var SlidingPanelComponentDecorator = function(componentClass, ...args) {

	var componentTypeAsADecorator = AppIgnition.componentTypes.RotativeSlidingPanel;

	var RotativeSlidingPanelDecoratedType = function(definition, parentView, parent, hostedComponentDefinition) {
//		this._hostedDefUID = definition.getGroupHostDef().UID;
//		AppIgnition.componentTypes.AbstractComponent.prototype.mergeDefaultDefinition.call(componentClass.prototype, definition.getHostDef());
//		
//		// definition is now a unique concrete def decorated through the component's default def
//		SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegister(definition);
//		TypeManager.typedHostsRegistry.setItem(this._hostedDefUID, []);
//		
//		componentTypeAsADecorator.call(this, definition.getHostDef(), parentView, parent);
//		
//		this.objectType = 'RotativeSlidingPanelHosting' + componentClass.prototype.objectType;
		
		this._hostedDefUID = hostedComponentDefinition.getGroupHostDef().UID;
		AppIgnition.componentTypes.AbstractComponent.prototype.mergeDefaultDefinition.call(componentClass.prototype, hostedComponentDefinition.getHostDef());
		
		// hostedComponentDefinition is now a unique concrete def decorated through the component's default def
		SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegister(hostedComponentDefinition);
		TypeManager.typedHostsRegistry.setItem(this._hostedDefUID, []);
		
		componentTypeAsADecorator.call(this, definition, parentView, parent);
		
		this.objectType = 'RotativeSlidingPanelHosting' + componentClass.prototype.objectType;
	}
	RotativeSlidingPanelDecoratedType.prototype = Object.create(componentTypeAsADecorator.prototype);
	RotativeSlidingPanelDecoratedType.prototype.objectType = 'RotativeSlidingPanelHosting' + componentClass.prototype.objectType;
	
	// SlidingPanel already uses an _async view-instanciation logic	
	// RotativeSlidingPanelDecoratedType.prototype._asyncInitTasks = [];
	
	// HERE componentClass is added on the prototype of the slidingPanel
	// BUT shall be different on each call to the decorator
	// We should then INHERIT from the SlidingPanel, not decorate the type
	
	Object.defineProperty(RotativeSlidingPanelDecoratedType.prototype, '_asyncInitTasks', {
		value : componentTypeAsADecorator.prototype._asyncInitTasks.slice(0)
	});
	RotativeSlidingPanelDecoratedType.prototype._asyncInitTasks.push(new TypeManager.TaskDefinition({
		type : 'lateAddChild',
		task : function(definition) {
//					var def = TypeManager.createComponentDef({
//						nodeName : 'li'
//					});
//					var view = new AppIgnition.componentTypes.ComponentWithView(def).view;
//					view._parent = this;
//					view.parentView = this.view.subViewsHolder.memberAt(2);
//					console.log(TypeManager.hostsDefinitionsCacheRegistry.getItem(this._hostedDefUID));
					new componentClass(
						TypeManager.hostsDefinitionsCacheRegistry.getItem(this._hostedDefUID),
						this.view.subViewsHolder.memberAt(2),
						this,
						...args
					);
		}
	}));
	
	RotativeSlidingPanelDecoratedType.prototype.beforeRegisterEvents = function() {
		this.streams.updateTrigger.value = 'initialized through SlidingPanelDecorator';
	}
	return RotativeSlidingPanelDecoratedType;
	
}

SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegister = function(definition) {
	var hostDefinition = definition.getGroupHostDef();
	
	for (let prop in TypeManager.caches) {
		TypeManager.caches[prop].setItem(hostDefinition.UID, hostDefinition[prop]);
	}
	
	// Exception: this definition is re-used as the "explicit" definition by the inheritingComponent
	//		=> "definition" is a groupDef
	TypeManager.hostsDefinitionsCacheRegistry.setItem(hostDefinition.UID, definition);
}








module.exports = SlidingPanelComponentDecorator;