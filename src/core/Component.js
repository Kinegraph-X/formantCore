/**
 * @constructor Component
 */

var CoreTypes = require('src/core/CoreTypes');
var TypeManager = require('src/core/TypeManager');









/**
 * @constructor HierarchicalObject
 */
var HierarchicalObject = function() {
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'HierarchicalObject';
	this._key;
	this._parent;
	this._children = [];
}
HierarchicalObject.prototype = Object.create(CoreTypes.EventEmitter.prototype);
HierarchicalObject.prototype.objectType = 'HierarchicalObject';
/**
 * @virtual
 */
HierarchicalObject.prototype.onAddChild = function(child, atIndex) {} 			// virtual
/**
 * @virtual
 */
HierarchicalObject.prototype.onRemoveChild = function(child) {} 				// virtual

/**
 * @param {object} child : an instance of another object
 */
HierarchicalObject.prototype.pushChild = function(child) {
	child._parent = this;
	child._key = this._children.length;
	this._children.push(child);
	this.onAddChild(child);
}

/**
 * @param {object} child : an instance of another object
 * @param {number} atIndex : the required index to splice at
 */
HierarchicalObject.prototype.addChildAt = function(child, atIndex) {
	child._parent = this;
	child._key = atIndex;
	this._children.splice(atIndex, 0, child);
	this.generateKeys(atIndex);
	this.onAddChild(child, atIndex);
}

/**
 * @param {string} moduleName
 */
HierarchicalObject.prototype.removeChild = function(childKey) {
	var removed;

	this._children[childKey].isAttached = false;
	this._children[childKey].view.hostElem.remove();
	removed = this._children.splice(childKey, 1)[0];
	(childKey < this._children.length && this.generateKeys(childKey));
	return removed;
}

/**
 * @param {number} atIndex : the required index to clear at
 */
HierarchicalObject.prototype.removeChildAt = function(atIndex) {
	var removedChild = this._children.splice(atIndex, 1);
	this.generateKeys(atIndex);
	this.onRemoveChild(removedChild);
}

/**
 * 
 */
HierarchicalObject.prototype.removeAllChildren = function() {
	this.onRemoveChild();
	this._children.length = 0;
	return true;
}

/**
 * 
 */
HierarchicalObject.prototype.remove = function() {
	return this._parent.removeChild(this._key);
}

/**
 * @param {number} atIndex : the first _key we need to invalidate
 */
HierarchicalObject.prototype.generateKeys = function(atIndex) {
	for (let i = atIndex || 0, l = this._children.length; i < l; i++) {
		this._children[i]._key = i;
	}
}

/**
 * @param {array} subscriptionType : the type among the TypeManager.eventQueries helper-array
 * @param {array} eventQueries : the queries of the type "subscriptionType" that the component has recevied from the def
 * @param {Component} parentComponent : the parent of the component (optional : used only when subscribeOnParent)
 */
HierarchicalObject.prototype.handleEventSubscriptions = function(subscriptionType, eventQueries, parentComponent) {
	if (subscriptionType === 'subscribeOnParent')
		eventQueries.forEach(function(subscription, key) {
			subscription.subscribeToEvent(this, parentComponent);
		}, this);
	else if (subscriptionType === 'subscribeOnChild') {
		this._children.forEach(function(child) {
			eventQueries.forEach(function(subscription, key) {
				subscription.subscribeToEvent(child, this);
			}, this);
		}, this);
	}
	else if (subscriptionType === 'subscribeOnSelf')
		eventQueries.forEach(function(subscription, key) {
			subscription.subscribeToEvent(this, this);
		}, candidateModule);
}





/**
 * @constructor ExtensibleObject
 */
var ExtensibleObject = function() {
	HierarchicalObject.call(this);
	this.objectType = 'ExtensibleObject';
	this._implements = [];
}
ExtensibleObject.prototype = Object.create(HierarchicalObject.prototype);
ExtensibleObject.prototype.objectType = 'ExtensibleObject';
/**
 * @virtual
 */
ExtensibleObject.prototype.onExtend = function(extension) {} 				// virtual

/**
 * @param {constructor:ExtensibleObject} base
 * @param {constructor:ExtensibleObject} extension
 */
ExtensibleObject.prototype.addInterface = function(base, extension) {
	var mergedConstructor = function() {
		base.apply(this, arguments);
		extension.apply(this, arguments);
		
		base.prototype.onExtend.call(this, extension)
		this.objectType = 'Extended' + base.prototype.objectType;
		this._implements.push(extension.prototype.objectType);
	};

	mergedConstructor.prototype = this.mergeOwnProperties(base.prototype, extension.prototype);
	mergedConstructor.prototype.constructor = mergedConstructor;
	mergedConstructor.prototype.objectType = 'Extended' + base.prototype.objectType;
	return mergedConstructor;
}

/**
 * @param {boolean || prototype}: keepNonStdProtosOrProto
 * @param {prototype} proto
 * @illimitedParams {prototype} proto
 */
ExtensibleObject.prototype.mergeOwnProperties = function(keepNonStdProtosOrProto, proto) {
	var self = this, keepNonStdProtos = false, obj, desc, isArray, isObj, len,
		target = (typeof arguments[0] === 'boolean'
					&& arguments[0]
					&& (keepNonStdProtos = true))
						? arguments[1]
								: arguments[0] || {},
		i = keepNonStdProtos ? 2 : 1,
		length = arguments.length,
		testObj;

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined args
		if ((obj = arguments[ i ]) != null) {
			testObj = Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(obj)));

			// Extend the base object
			testObj.forEach(function(name) {
				if (!obj.hasOwnProperty(name) && !keepNonStdProtos)
					return;
				else if (keepNonStdProtos && target.prototype === Object.prototype && obj.prototype[name]) {
					target.prototype = obj.prototype;
					return;
				}
				desc = Object.getOwnPropertyDescriptor(obj, name);
				if (!desc.get) {
					if ((isArray = Array.isArray(obj[name])) || (isObj = (Object.prototype.toString.call(obj[name]) === '[object Object]'))) {
						len = obj[name].length || Object.keys(obj[name]).length;
						if (len) {
							if (typeof $ !== 'undefined' && obj[name] instanceof $)
								target[name] = obj[name];
							else
								target[name] = self.mergeOwnProperties(target[name] || (isArray ? [] : {}), obj[name]);
						}
						else
							target[name] = isArray ? [] : {};
					}
					else if (obj[name] || obj[name] === null) 	// copy null values : null is sometimes explicitly tested
						target[name] = obj[name];
					else if (typeof obj[name] !== 'function' && typeof obj[name] !== 'undefined' && obj[name] !== null)
						target[name] = typeof obj[name] === 'string' ? '' : 0;
				}
				else {
					Object.defineProperty(target, name, {
						enumerable : desc.enumerable,
						configurable : desc.configurable,
						get : desc.get,
						set : desc.set
					});
				}
			});
		}
	}
	return target;
}







/**
 * @constructor AbstractComponent
 */
var AbstractComponent = function(definition) {
	ExtensibleObject.call(this);
	this.objectType = 'AbstractComponent';
	
	this._UID = TypeManager.UIDGenerator.newUID().toString();
	
	this._defUID = definition.getHostDef().UID;
	this._defComposedUID;
	
//	console.log(definition);
	if (!TypeManager.definitionsCacheRegister.getItem(this._defUID))
		this.populateStores(definition);
	this.createEvent('update');
	
	TypeManager.typedHostsRegister.getItem(this._defUID).push(this);
}
AbstractComponent.prototype = Object.create(ExtensibleObject.prototype);
AbstractComponent.prototype.objectType = 'AbstractComponent';
/**
 * @virtual
 */
AbstractComponent.prototype.createDefaultDef = function() {}			// virtual

/**
 * @param {ComponentDefinition}
 */
AbstractComponent.prototype.mergeDefaultDefinition = function(definition) {
	var defaultDef, defaultHostDef;
	if ((defaultDef = this.createDefaultDef())) {
		this._defComposedUID = this._defUID + '-' + defaultDef.getHostDef().UID;
		defaultHostDef = defaultDef.getHostDef();
	}
	else
		this._defComposedUID = this._defUID;
	
	var hostDef = definition.getHostDef();
	
	if (defaultDef) {
		TypeManager.propsAreArray.forEach(function(prop) {
			if(defaultHostDef[prop].length)
				Array.prototype.push.apply(hostDef[prop], defaultHostDef[prop]);
		});
		TypeManager.propsArePrimitives.forEach(function(prop) {
			if (hostDef[prop] === null)
				hostDef[prop] = defaultHostDef[prop];
		});
		if (hostDef.sWrapper === null)
			hostDef.sWrapper = defaultHostDef.sWrapper;
		if (hostDef.command === null)
			hostDef.command = defaultHostDef.command;
	}
}

/**
 * @param {ComponentDefinition}
 */
AbstractComponent.prototype.populateStores = function(definition) {
	this.mergeDefaultDefinition(definition);
	var hostDefinition = definition.getHostDef();
//	console.log(hostDefinition);
	for (let prop in TypeManager.caches) {
		TypeManager.caches[prop].setItem(this._defUID, hostDefinition[prop]);
	}
	TypeManager.definitionsCacheRegister.setItem(this._defUID, definition);
	TypeManager.typedHostsRegister.setItem(this._defUID, []);
}











/**
 * @constructor ComponentWithObservables
 */
var ComponentWithObservables = function(definition, parentView) {
	AbstractComponent.call(this, definition);
	this.objectType = 'ComponentWithObservables';
	
	this.streams = {};
}
ComponentWithObservables.prototype = Object.create(AbstractComponent.prototype);
ComponentWithObservables.prototype.objectType = 'ComponentWithObservables';

ComponentWithObservables.prototype.reactOnParentBinding = function(reactOnParent, parentComponent, subscriptionType) {
//	console.log(subscriptionType);
	reactOnParent.forEach(function(query, key) {
		query.subscribeToStream(parentComponent.streams[query.from], this);
	}, this);
}

ComponentWithObservables.prototype.reactOnSelfBinding = function(reactOnSelf, parentComponent, subscriptionType) {
//	console.log(subscriptionType);
	reactOnSelf.forEach(function(query, key) {
		query.subscribeToStream(this.streams[query.from || query.to], this);
	}, this);

}














/**
 * @constructor ComponentWithView
 */
var ComponentWithView = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithObservables.call(this, definition);
	this.objectType = 'ComponentWithView';
	
	this.command = definition.getHostDef().command;
	this.view;
	
	if (definition.getHostDef().nodeName)
		this.instanciateView(definition, parentView, this, isChildOfRoot);
}
ComponentWithView.prototype = Object.create(ComponentWithObservables.prototype);
ComponentWithView.prototype.objectType = 'ComponentWithView';

/**
 * @param {ComponentDefinition} definition
 * @param {ComponentView} parentView
 */
ComponentWithView.prototype.instanciateView = function(definition, parentView, parent, isChildOfRoot) {
//	console.log(parentView);
	this.view = new CoreTypes.ComponentView(definition, parentView, parent, isChildOfRoot);
}
/**
 * @param {Component} child
 */
ComponentWithView.prototype.onRemoveChild = function(child) {
	if (typeof child === 'undefined') {
		while (this.view.subViewsHolder.subViews[1].hostElem.firstChild) {
			this.view.subViewsHolder.subViews[1].hostElem.removeChild(this.view.subViewsHolder.subViews[1].hostElem.lastChild);
		}
//		this.view.subViewsHolder.subViews[1].hostElem.length = 0;
//		this.view.hostElem.remove();
	}
	else {
		// remove a child
	}
}

/**
 * @param {Component} child
 * @param {number} atIndex
 */
ComponentWithView.prototype.onAddChild = function(child, atIndex) {
	if (typeof atIndex !== 'undefined' && child.view.parentView)
		child.view.parentView.addChildAt(child.view, atIndex);
}













/**
 * @constructor ComponentWithHooks
 */
var ComponentWithHooks = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithView.call(this, definition, parentView, parent, isChildOfRoot);
	this.objectType = 'ComponentWithHooks';

	this.viewExtend(definition);
}
/**
 * HOOKS
 */
ComponentWithHooks.prototype = Object.assign(Object.create(ComponentWithView.prototype), {
	basicEarlyViewExtend : function() {},					// virtual
	basicLateViewExtend : function() {},						// virtual
	beforeRegisterEvents : function() {},			// virtual
	registerClickEvents : function() {},			// virtual
	registerLearnEvents : function() {},			// virtual
	registerKeyboardEvents : function() {},			// virtual
	afterRegisterEvents : function() {},			// virtual
	registerValidators : function() {},				// virtual
	execBindingQueue : function() {}				// virtual
});
ComponentWithHooks.prototype.objectType = 'ComponentWithHooks';

ComponentWithHooks.prototype.viewExtend = function(definition) {
	this.basicEarlyViewExtend(definition);
	this.basicLateViewExtend(definition);
}

ComponentWithHooks.prototype.registerEvents = function() {
	this.beforeRegisterEvents();
	this.registerClickEvents();
	this.registerKeyboardEvents();
	this.registerLearnEvents();
	this.afterRegisterEvents();
	this.registerValidators();
	this.execBindingQueue();
}

/**
 * @param {ComponentDefinition} componentDefinition
 * @param {ComponentDefinition} nodeDefinition
 * @param {string} state
 */
ComponentWithHooks.prototype.addReactiveMemberViewFromFreshDef = function(componentDefinition, nodeDefinition, state) {
	
	// This is an illustrative method, a hint for others on the path to catching the "spirit" of the extension mechanism of the framework
	// 		=> This is to be implemented as a method on the ComponentWithView.prototype : addReactiveMemberViewFromFreshDef
	// Delete the UID of the definition and Register a renewed one with fresh UID (unless exists, so register both the original and the fresh one : if the original exists, we already went here)
	// Define a reactOnSelf on the definition of the HOST with a callback : it shall be bound to the host
	//		=> maintain a -counter- on the added pictos
	// 		=> the callback shall call the component -> the main view -> the subViewsHost -> the memberViews[ -counter- ].hostElem.hidden
	// Instanciate a view with the host's view as parent view (the view references the UID of the definition)
	// Add that view to the subViewsHost->memberViews of the main view
	
	var newDef;
	if (!(newDef = TypeManager.definitionsCacheRegister.getItem(nodeDefinition.host.UID + state))) {
		newDef = TypeManager.createComponentDef(nodeDefinition);
		newDef.host.UID = nodeDefinition.host.UID + state;
		TypeManager.definitionsCacheRegister.setItem(newDef.host.UID, newDef);
		
		componentDefinition.getHostDef().reactOnSelf.push(new TypeManager.ReactivityQueryModel({
			cbOnly : true,
			from : state,
			subscribe : function(value) {
					this.view.subViewsHolder.memberViews[0].hostElem.hidden = value ? 'hidden' : null;
				}
			})
		);
	}
	
	var view = new CoreTypes.ComponentSubView(newDef.getHostDef(), this.view, this);
	this.view.subViewsHolder.memberViews.push(view);
	
	
}











/**
 * @constructor ComponentWithReactiveText
 */
var ComponentWithReactiveText = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithHooks.call(this, definition, parentView, parent, isChildOfRoot);
	this.objectType = 'ComponentWithReactiveText';

}
ComponentWithReactiveText.prototype = Object.create(ComponentWithHooks.prototype);
ComponentWithReactiveText.prototype.objectType = 'ComponentWithReactiveText';

/**
 * @abstract
 */
ComponentWithReactiveText.prototype.populateSlots = function(values) {
	if (!Array.isArray(values) || !values.length) {
		if (typeof value === 'string')
			values = [values];
		else
			return '';										// TODO : why return empty string ?
	}
	values.forEach(function(val, key) {
		if (typeof val !== 'string')
			return;
		this.slots[key].textContent = val;
	}, this);
}

/**
 * @abstract
 */
ComponentWithReactiveText.prototype.populateSelf = function(value) {
	if (typeof value !== 'string' && isNaN(parseInt(value)))
		return;
	this.view.value = value.toString();
};






/**
 * @constructor ComponentStrokeAware
 */
ComponentStrokeAware = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithHooks.call(this, definition, parentView, parent, isChildOfRoot);
//	this.objectType = 'ComponentStrokeAware';

}
ComponentStrokeAware.prototype = Object.create(ComponentWithHooks.prototype);
ComponentStrokeAware.prototype.objectType = 'ComponentStrokeAware';

ComponentStrokeAware.prototype.createEvents = function() {
	this.createEvent('stroke');
}

/**
 * @abstract
 */
ComponentStrokeAware.prototype.registerKeyboardEvents = function(e) {
	var input = (this.view.rootElem || this.view.hostElem).querySelector('input');
	
	// Stroke event listener & canAct management 
	input.addEventListener('keyup', function(e) {
		e.stopPropagation();
//		var allowed = [189, 190, 191]; // corresponds to **. , -**
//		allowed.indexOf(e.keyCode) >= 0 && 
 
	    if (e.keyCode >= 32 && (e.keyCode < 48 || e.keyCode > 57) && e.keyCode <= 191)
	        self.trigger('stroke', e);
	});
}















module.exports = {
	ExtensibleObject : ExtensibleObject,
	AbstractComponent : AbstractComponent,
	HierarchicalObject : HierarchicalObject,
	ComponentWithView : ComponentWithView,
	ComponentWithHooks : ComponentWithHooks,
	ComponentWithReactiveText : ComponentWithReactiveText,
	ComponentStrokeAware : ComponentStrokeAware
};