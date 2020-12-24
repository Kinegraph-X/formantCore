/**
 * @decorator DataBoundComponentDecorator
 */

var ComponentDataProvider = require('src/core/ComponentDataProvider');
var AppIgnition = require('src/core/AppIgnition');


var DataBoundComponentDecorator = function(componentType, dataPresenterFunc) {
//	console.log(componentType, componentType in AppIgnition.componentTypes);
	if (componentType in AppIgnition.componentTypes) {
		var inheritingType = AppIgnition.componentTypes[componentType];
		var inheritedType = ComponentDataProvider;
		
		var decoratedType = function(definition, parentView, parent) {
			inheritingType.call(this, definition, parentView, parent);
			
			// definition is now a unique concrete def decorated through the component's default def
			ComponentDataProvider.call(this);
//			console.log(this);
			this.getDataset(definition);
		};
		
		var proto_proto = Object.create(inheritingType.prototype);
		Object.assign(proto_proto, inheritedType.prototype);
		decoratedType.prototype = Object.create(proto_proto);
		
		decoratedType.prototype.onPushChildWithView = function() {
			
			if (this.dataset.rootComponent.objectType === 'AbstractComponent') {
//				console.log(this._parent.objectType);
				this.dataset.rootComponent = this;
				this.dataset.trackedComponent = this;
//				console.log(this.dataset.rootComponent);
			}
//			console.log(this.dataset.rootComponent);
		}
		
		if (typeof dataPresenterFunc === 'function')
			decoratedType.prototype.dataPresenterFunc = dataPresenterFunc;
		
//		console.log(decoratedType.prototype);
		return decoratedType;
	}
	
}

//DataBoundComponentDecorator.prototype = Object.create(Object.prototype);








module.exports = DataBoundComponentDecorator;