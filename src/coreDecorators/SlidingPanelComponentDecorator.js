/**
 * @decorator SlidingPanelComponentDecorator
 */


var TypeManager = require('src/core/TypeManager');
var AppIgnition = require('src/core/AppIgnition');


var SlidingPanelComponentDecorator = function(componentClass, ...args) {

	var componentTypeAsADecorator = AppIgnition.componentTypes.SlidingPanel;

	var decoratedType = function(componentTypeAsDecoratorDef, parentView, parent, hostedDefinition) {
		this._hostedDefUID = null;
		
		// FIXME: MEGA-HACKY => we should think of a recursive strategy to find that info
		// through a utility method in the core
		this.isHostedCompAGroup = (Object.getPrototypeOf(Object.getPrototypeOf(componentClass.prototype)).extendsCore.match(/CompoundComponent/)
			|| Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(componentClass.prototype))).objectType.match(/CompoundComponent/))
				? true
				: false;
		
		if (hostedDefinition) {
			this._hostedDefUID = (hostedDefinition && hostedDefinition.getGroupHostDef()) ? hostedDefinition.getGroupHostDef().UID : hostedDefinition.getHostDef().UID;
			// Hack to get a clone of the definition object (TODO: is it necessary for this definiton to be unique ?)
			// mergeDefaultDefinition shall return a copy of the def (TODO: could we have used TypeManager.createDef() instead ?)
			AppIgnition.componentTypes.AbstractComponent.prototype.mergeDefaultDefinition.call(
				componentClass.prototype, 
				hostedDefinition.getGroupHostDef() ? hostedDefinition.getHostDef() : hostedDefinition
			);
			// definition is now a unique concrete def decorated through the component's default def
			// (TODO: why do we have to populate the caches beforehand ?
			// => it is related to the time at which the "lateAddChild" hook shall be called,
			// relatively to the "ignition sequence", but is it really ?)
			SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegistry(hostedDefinition);
			TypeManager.typedHostsRegistry.setItem(this._hostedDefUID, []);
		}
		
		componentTypeAsADecorator.call(
			this,
			componentTypeAsDecoratorDef
				? componentTypeAsDecoratorDef
				: TypeManager.mockDef(),
			parentView,
			parent
		);
		
		this.objectType = 'SlidingPanelHosting' + componentClass.prototype.objectType;
	}
	decoratedType.prototype = Object.create(componentTypeAsADecorator.prototype);
	decoratedType.prototype.objectType = 'SlidingPanelHosting' + componentClass.prototype.objectType;
	
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
			console.log('this.isHostedCompAGroup', this.isHostedCompAGroup);
					new componentClass(
						this._hostedDefUID
							? TypeManager.hostsDefinitionsCacheRegistry.getItem(this._hostedDefUID)
							: (this.isHostedCompAGroup
								? TypeManager.mockGroupDef()
								: TypeManager.mockDef()
							),
						this.view.subViewsHolder.memberViews[2],
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

SlidingPanelComponentDecorator.populateHostsDefinitionsCacheRegistry = function(definition) {
	var hostDefinition = definition.getGroupHostDef() || definition.getHostDef();
	
	for (let prop in TypeManager.caches) {
		TypeManager.caches[prop].setItem(hostDefinition.UID, hostDefinition[prop]);
	}
	
	TypeManager.hostsDefinitionsCacheRegistry.setItem(hostDefinition.UID, definition);
}








module.exports = SlidingPanelComponentDecorator;