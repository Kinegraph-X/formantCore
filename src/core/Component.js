/**
 * @constructor Component
 */

var CoreTypes = require('src/core/CoreTypes');
var TypeManager = require('src/core/TypeManager');
var ElementDecorator = require('src/UI/_mixins/elementDecorator_HSD');








/**
 * @constructor HierarchicalObject
 */
var HierarchicalObject = function(definition, parentView, parent) {
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'HierarchicalObject';
	this._key;

	this._parent = (parent && parent instanceof HierarchicalObject && parent.pushChild(this)) ? parent : null;
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
HierarchicalObject.prototype.getLastChild = function() {
	return this._children[this._children.length - 1];
}

/**
 * @param {object} child : an instance of another object
 */
HierarchicalObject.prototype.pushChild = function(child) {
	child._parent = this;
	child._key = this._children.length;
	this._children.push(child);
	this.onAddChild(child);
	return true;
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
	var removedChild;

	this._children[childKey].isAttached = false;
	this._children[childKey].view.hostElem.remove();
	removedChild = this._children.splice(childKey, 1);
	this.onRemoveChild(removedChild);
	(childKey < this._children.length && this.generateKeys(childKey));
	return removedChild;
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
	if (this._parent)
		return this._parent.removeChild(this._key);
	else
		return this.view.hostElem.remove();
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
 * @param {number} atIndex : the first _key we need to invalidate
 */
HierarchicalObject.prototype.getSelfDepth = function() {
	var depth = 0, currentLevel = this;
	while (currentLevel._parent) {
		currentLevel = currentLevel._parent;
		depth++;
	}
	return depth;
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
		}, this);
}

/**
 * Specialization on the previous one
 * @param {array} eventQueries : the queries of the type "subscribeOnChild" that the sync-ed Dataset passes from the def of its trackedComponent
 */
HierarchicalObject.prototype.handleEventSubsOnChildrenAt = function(eventQueries, atIndex) {
	this._children.forEach(function(child, key) {
		if (key >= atIndex) {
			eventQueries.forEach(function(subscription, key) {
				subscription.subscribeToEvent(child, this);
			}, this);
		}
	}, this);
}





/**
 * @constructor ExtensibleObject
 */
var ExtensibleObject = function(definition, parentView, parent) {
	HierarchicalObject.call(this, definition, parentView, parent);
	this.objectType = 'ExtensibleObject';
}
ExtensibleObject.prototype = Object.create(HierarchicalObject.prototype);
ExtensibleObject.prototype.objectType = 'ExtensibleObject';
/**
 * @virtual
 */
ExtensibleObject.prototype.onExtend = function(extension) {} 				// pure virtual implemented below, as a try
//ExtensibleObject.prototype._asyncInitTasks = [];					// pure virtual
//ExtensibleObject.prototype._asyncRegisterTasks = [];				// pure virtual
/**
 * @abstract
 */
ExtensibleObject.prototype.getCleanDefAfterExtension = function(Constructor) {
	var objectType = Constructor.prototype.objectType;
	var defaultDef = Constructor.prototype.createDefaultDef();
	Constructor.prototype.createDefaultDef = function() {
		return TypeManager.createComponentDef(defaultDef, objectType);
	}
}

/**
 * @param {constructor:ExtensibleObject} base
 * @param {constructor:ExtensibleObject} extension
 */
ExtensibleObject.prototype.addInterface = function(base, extension) {
	// namingObj was just an attemp... to "name" the ctor. Doesn't work, though...
	var namingObj = {}, objectType = base.prototype.objectType || '';
	
	namingObj[objectType] = function() {
		base.apply(this, arguments);
		extension.apply(this, arguments);
		
		base.prototype.onExtend.call(this, extension)
		this.objectType = 'Extended' + objectType;
		this._implements.push();
	};

	namingObj[objectType].prototype = this.mergeOwnProperties(base.prototype, extension.prototype);
	namingObj[objectType].prototype.constructor = namingObj[objectType];
	namingObj[objectType].prototype.objectType = objectType.indexOf('Extended') === 0 ? objectType : 'Extended' + objectType;
	(namingObj[objectType].prototype._implements
		? namingObj[objectType].prototype._implements.push(extension.prototype.objectType)
				: namingObj[objectType].prototype._implements = [extension.prototype.objectType]);
	
	base.prototype.onExtend(namingObj[objectType]);
	
	if (extension.prototype.queueAsync) {
		var taskDef = extension.prototype.queueAsync(objectType);
		(namingObj[objectType].prototype._asyncInitTasks
				? namingObj[objectType].prototype._asyncInitTasks.splice(
						(taskDef.index !== null 
								? taskDef.index 
										: namingObj[objectType].prototype._asyncInitTasks.length),
						0,
						taskDef)
							: namingObj[objectType].prototype._asyncInitTasks = [taskDef]);
	}
	if (extension.prototype.queueAsyncRegister) {
		var taskDef = extension.prototype.queueAsyncRegister(objectType);
		(namingObj[objectType].prototype._asyncRegisterTasks
				? namingObj[objectType].prototype._asyncRegisterTasks.splice(
						(taskDef.index !== null 
								? taskDef.index 
										: namingObj[objectType].prototype._asyncRegisterTasks.length),
						0,
						taskDef)
							: namingObj[objectType].prototype._asyncRegisterTasks = [taskDef]);
	}
	
	return namingObj[objectType];
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
				if (typeof desc === 'undefined' || !desc.get) {
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
 * @abstract_implementation {interface_name_masking_lock:must_be_first} {pure_virtual_on_abstract_type}
 */
ExtensibleObject.prototype.onExtend = function(namespace) {
	if (!(namespace.prototype.hasOwnProperty('_asyncInitTasks')))
		Object.defineProperty(namespace.prototype, '_asyncInitTasks', {
			value : []
		});
	if (!(namespace.prototype.hasOwnProperty('_asyncRegisterTasks')))
		Object.defineProperty(namespace.prototype, '_asyncRegisterTasks', {
			value : []
		}); 
}


















/**
 * @constructor AsyncActivableObject
 */
var AsyncActivableObject = function(definition, parentView, parent) {
	ExtensibleObject.call(this, definition, parentView, parent);
	this.objectType = 'AsyncActivableObject';
}
AsyncActivableObject.prototype = Object.create(ExtensibleObject.prototype);
AsyncActivableObject.prototype.objectType = 'AsyncActivableObject';

///**
// * @reminder
// * Asynchronous tasks are inherited through the prototype during the mixin, but should not be referenced by "any" component
// */
//AsyncActivableObject.prototype._asyncInitTasks = [];
//AsyncActivableObject.prototype._asyncRegisterTasks = []

/**
 * @virtual
 */
AsyncActivableObject.prototype.asyncInit = function() {
	
	this._asyncInitTasks.forEach(function(asyncFunc, key) {
		asyncFunc.call(this);
	});
}

/**
 * @pure_signature not to be implemented : interfaces must not inherit from a Component type, but may implement a method with this signature
 */
AsyncActivableObject.prototype.queueAsync = function() {
	return new TypeManager.TaskDefinition({
		type : '',
		task : function() {}
	});
}









/**
 * @constructor AbstractComponent
 */
var AbstractComponent = function(definition, parentView, parent) {
	AsyncActivableObject.call(this, definition, parentView, parent);
	this.objectType = 'AbstractComponent';
	
	this._UID = TypeManager.UIDGenerator.newUID().toString();

	this._defUID = definition.getHostDef().UID;
	this._defComposedUID = '';
	
//	console.log(definition);
	if (!TypeManager.hostsDefinitionsCacheRegister.getItem(this._defUID))
		this.populateStores(definition);
	this.createEvent('update');
	
	TypeManager.typedHostsRegister.getItem(this._defUID).push(this);
}
AbstractComponent.prototype = Object.create(AsyncActivableObject.prototype);
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
		this._defComposedUID = defaultDef.getHostDef().UID;
		defaultHostDef = defaultDef.getHostDef();
//		if (TypeManager.hostsDefinitionsCacheRegister.getItem(this._defUID, this._defComposedUID))
//			return;
	}
	else
		this._defComposedUID = this._defUID;
	
	var hostDef = definition.getHostDef();
//	console.log(defaultHostDef);
	if (defaultDef) {
		TypeManager.propsAreArray.forEach(function(prop) {
//			console.log(prop);
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
			
		if (defaultDef.subSections.length)
			Array.prototype.push.apply(definition.subSections, defaultDef.subSections);
		
		if (defaultDef.members.length)
			Array.prototype.push.apply(definition.members, defaultDef.members);
	}
}

/**
 * @param {ComponentDefinition}
 */
AbstractComponent.prototype.populateStores = function(definition) {
	this.mergeDefaultDefinition(definition);
	var hostDefinition = definition.getHostDef();
//	console.log(hostDefinition);
	
	var title;
	if ((title = hostDefinition.attributes.getObjectValueByKey('title')) && title.slice(0, 1) === '-')
		ElementDecorator['Hyphen-Star-Dash'].decorateAttributes(hostDefinition.nodeName, hostDefinition.attributes);
	
	for (let prop in TypeManager.caches) {
		TypeManager.caches[prop].setItem(this._defUID, hostDefinition[prop]);
	}
	TypeManager.hostsDefinitionsCacheRegister.setItem(this._defUID, definition);
	TypeManager.typedHostsRegister.setItem(this._defUID, []);
}











/**
 * @constructor ComponentWithObservables
 */
var ComponentWithObservables = function(definition, parentView, parent) {
	AbstractComponent.call(this, definition, parentView, parent);
	this.objectType = 'ComponentWithObservables';
	
	this.streams = {};
	this._subscriptions = [];
}
ComponentWithObservables.prototype = Object.create(AbstractComponent.prototype);
ComponentWithObservables.prototype.objectType = 'ComponentWithObservables';

ComponentWithObservables.prototype.reactOnParentBinding = function(reactOnParent, parentComponent, subscriptionType) {
//	console.log(subscriptionType, this, parentComponent);
	reactOnParent.forEach(function(query, key) {
		query.subscribeToStream(parentComponent.streams[query.from], this);
	}, this);
}

ComponentWithObservables.prototype.reactOnSelfBinding = function(reactOnSelf, parentComponent, subscriptionType) {
//	console.log(subscriptionType, this);
	reactOnSelf.forEach(function(query, key) {
		query.subscribeToStream(this.streams[query.from || query.to], this);
	}, this);

}















/**
 * @constructor ComponentWithView
 */
var ComponentWithView = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithObservables.call(this, definition, parentView, parent);
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
ComponentWithView.prototype.pushChildWithView = function(child) {
	this.pushChild(child);
	child.view.parentView = this.view;
	this.view.subViewsHolder.addMemberView(child.view);
	child.onPushChildWithView(child);
}
ComponentWithView.prototype.onPushChildWithView = function() {}		// virtual pure

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
//		console.log(this.view.subViewsHolder.subViews[1].hostElem);
		if (this.view.subViewsHolder.subViews.length) {
			this.view.subViewsHolder.subViews.forEach(function(subView, key) {
				while (subView.hostElem.firstChild) {
					subView.hostElem.removeChild(subView.hostElem.lastChild);
				}
			}, this);
		}
		this._children.forEach(function(child, key) {
			child.view.hostElem.remove();
		}, this);
		if (this.view.subViewsHolder.memberViews.length) {
			this.view.subViewsHolder.memberViews.forEach(function(member, key) {
				member.hostElem.remove();
			}, this);
		}
//		this.view.subViewsHolder.subViews[1].hostElem.length = 0;
//		this.view.hostElem.remove();
	}
	else if (child instanceof ComponentWithObservables){
		// remove a child
		// TODO: should call super(), as the ComponentWithView should neither handle streams, nor subscriptions 
		child._subscriptions.forEach(function(subscription) {
			subscription.unsubscribe();
		});
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


ComponentWithView.prototype.childButtonsHighlightLoop = function(targetIdx) {
	if (this._children.length === 1)
		this._children[0].streams.highlighted.value = null;
	else {
		this._children.forEach(function(child) {
			if (child._key === targetIdx)
				child.streams.highlighted.value = 'highlighted';
			else
				child.streams.highlighted.value = null;
		});
	}
}

ComponentWithView.prototype.childButtonsSortedLoop = function(targetIdx, order) {
	this._children.forEach(function(child) {
		if (child._key === targetIdx) {
			child.streams['sorted' + order].value = 'sorted';
			child.streams['sorted' + (order === 'asc' ? 'desc' : 'asc')].value = null;
		}
		else {
			child.streams.sortedasc.value = null;
			child.streams.sorteddesc.value = null;
		}
	});
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
	asyncViewExtend : function() {},						// virtual
	basicLateViewExtend : function() {},					// virtual
	lastAddChildren : function() {},							// virtual
	beforeRegisterEvents : function() {},			// virtual
	registerClickEvents : function() {},			// virtual
	registerLearnEvents : function() {},			// virtual
	registerKeyboardEvents : function() {},			// virtual
	afterRegisterEvents : function() {},			// virtual
//	registerValidators : function() {},				// virtual
	execBindingQueue : function() {}				// virtual
});
ComponentWithHooks.prototype.objectType = 'ComponentWithHooks';

ComponentWithHooks.prototype.viewExtend = function(definition) {
	this.basicEarlyViewExtend(definition);
	if (this._asyncInitTasks)
		this.asyncViewExtend(definition);
	this.basicLateViewExtend(definition);
	if (this._asyncInitTasks)
		this.lateAddChildren(definition);
		
	// Retry after having added more views
	if (definition.getHostDef().targetSlotIndex !== null && this.view.targetSubView === null)
		this.view.getTargetSubView(definition);
}

ComponentWithHooks.prototype.registerEvents = function() {
	this.beforeRegisterEvents();
	this.registerClickEvents();
	this.registerKeyboardEvents();
	this.registerLearnEvents();
	if (this._asyncRegisterTasks)
		this.asyncRegister();
	this.afterRegisterEvents();
}

/**
 * @hook
 */
ComponentWithHooks.prototype.asyncViewExtend = function(definition) {
	if (!this._asyncInitTasks)
	var asyncTask;
	for (let i = 0, l = this._asyncInitTasks.length; i < l; i++) {
		asyncTask = this._asyncInitTasks[i];
		if(asyncTask.type === 'viewExtend') {
			asyncTask.execute(this, definition);
		}
	}
}

/**
 * @hook
 */
ComponentWithHooks.prototype.lateAddChildren = function(definition) {
	var asyncTask;
	for (let i = 0, l = this._asyncInitTasks.length; i < l; i++) {
		asyncTask = this._asyncInitTasks[i];
		if(asyncTask.type === 'lateAddChild') {
			asyncTask.execute(this, definition);
		}
	}
}

/**
 * @hook
 */
ComponentWithHooks.prototype.asyncRegister = function(definition) {
	var asyncTask;
	for (let i = 0, l = this._asyncRegisterTasks.length; i < l; i++) {
		asyncTask = this._asyncRegisterTasks[i];
		if(asyncTask.type === 'lateBinding') {
			asyncTask.execute(this, definition);
		}
	}
}


/**
 * @param {ComponentDefinition} componentDefinition
 * @param {ComponentDefinition} nodeDefinition
 * @param {string} state
 */
ComponentWithHooks.prototype.addReactiveMemberViewFromFreshDef = function(componentDefinition, nodeDefinition, state) {
	
	var newDef = state ? this.extendDefToStatefull(componentDefinition, nodeDefinition, state) : nodeDefinition;
	
	var view;
	if (newDef.getHostDef().nodeName)
		this.view.subViewsHolder.addMemberViewFromDef(newDef.getHostDef());
	
	if (newDef.members.length) {
		newDef.members.forEach(function(memberDef) {
			this.view.subViewsHolder.addMemberViewFromDef(memberDef);
		}, this);
	}
}

/**
 * @param {ComponentDefinition} componentDefinition
 * @param {ComponentDefinition} nodeDefinition
 * @param {string} state
 */
ComponentWithHooks.prototype.unshiftReactiveMemberViewFromFreshDef = function(componentDefinition, nodeDefinition, state) {

	var newDef = state ? this.extendDefToStatefull(componentDefinition, nodeDefinition, state) : nodeDefinition;
	this.view.subViewsHolder.immediateUnshiftMemberView(newDef.getHostDef());
}

/**
 * @param {ComponentDefinition} componentDefinition
 * @param {ComponentDefinition} nodeDefinition
 * @param {string} state
 */
ComponentWithHooks.prototype.extendDefToStatefull = function(componentDefinition, nodeDefinition, state) {
	// This is an illustrative method, a hint for others on the path to catching the "spirit" of the extension mechanism of the framework
	// 		=> This is to be implemented as a method on the ComponentWithView.prototype : addReactiveMemberViewFromFreshDef
	// Delete the UID of the definition and Register a renewed one with fresh UID (unless exists, so register both the original and the fresh one : if the original exists, we already went here)
	// Define a reactOnSelf on the definition of the HOST with a callback : it shall be bound to the host
	//		=> maintain a -counter- on the added pictos
	// 		=> the callback shall call the component -> the main view -> the subViewsHost -> the memberViews[ -counter- ].hostElem.hidden
	// Instanciate a view with the host's view as parent view (the view references the UID of the definition)
	// Add that view to the subViewsHost->memberViews of the main view
	
	var statefullExtendedDef;
	if (!(statefullExtendedDef = TypeManager.hostsDefinitionsCacheRegister.getItem(componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className')))) {
		// This also is tricky, as we keep all along the call stack that ComponentDef which should be a hostDef.
		// The only reason being that we discriminate the "grouped" append in the second test-case above as the one having "members" and "no nodeName on host"
		// TODO: THAT MUST CHANGE.
		statefullExtendedDef = TypeManager.createComponentDef(nodeDefinition);
		statefullExtendedDef.host.UID = componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className');
		
		TypeManager.hostsDefinitionsCacheRegister.setItem(statefullExtendedDef.host.UID, statefullExtendedDef);
		
		// This approach is realy tricky: everything is crucial and the context is totally blurred:
		// memberViewIdx anticipate on the next member view (the one we are currently building) to be appended ont the component's view: 
		// 		could it happen that this idx change suddenly ? no clear sight on that, observed from here
		// state.replace(/Not/i, '') is of a crucial mean, as just below state.indexOf('Not') === -1 means we're defining the conditions (registration form implementation)
		// 		for the picto -NOT- notifying an error (then the green check), to be "hidden" (not to show up) when the "valid" state is falsy.
		// Ouch...
		var memberViewIdx = this.view.subViewsHolder.memberViews.length;
		componentDefinition.getHostDef().reactOnSelf.push(new TypeManager.ReactivityQueryModel({
			cbOnly : true,
			from : state.replace(/Not/i, ''),
			subscribe : function(value) {
//					console.log();
					this.view.subViewsHolder.memberViews[memberViewIdx].hostElem.hidden = (state.indexOf('Not') === -1 ? !value : value) ? 'hidden' : null;
				}
			})
		);
	}
	return statefullExtendedDef;
}













/**
 * @constructor CompositorComponent
 */
var CompositorComponent = function(definition, parentView, parent) {//, argx, argy, arg...
	this.Compositor.call(this, definition, parentView, parent);
	this.objectType = 'CompositorComponent';
}
CompositorComponent.prototype = Object.create(ComponentWithView.prototype);
CompositorComponent.prototype.objectType = 'CompositorComponent';
CompositorComponent.prototype.extendsCore = '';							// virtual
CompositorComponent.prototype.extends = '';								// virtual

CompositorComponent.prototype.Compositor = function() {};				// virtual

CompositorComponent.prototype.acquireCompositor = function() {};		// virtual

CompositorComponent.prototype.extendFromCompositor = function(inheritingType, inheritedType) {
//	console.log(inheritedType);
	var proto_proto = Object.create(inheritedType.prototype);
	Object.assign(proto_proto, inheritingType.prototype);
	inheritingType.prototype = proto_proto;
}
















/**
 * @constructor ComponentWithReactiveText
 */
var ComponentWithReactiveText = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithHooks.call(this, definition, parentView, parent, isChildOfRoot);
	this.objectType = 'ComponentWithReactiveText';
	this.eachMemberContentCache = [];
	this.targetSubViewContentCache = [];
}
ComponentWithReactiveText.prototype = Object.create(ComponentWithHooks.prototype);
ComponentWithReactiveText.prototype.objectType = 'ComponentWithReactiveText';

/**
 * @abstract
 */
ComponentWithReactiveText.prototype.setContentFromArrayOnEachMemberView = function(values) {
//	console.log(values);
	if (!Array.isArray(values) || !values.length) {
		if (typeof value === 'string')
			values = [values];
		else
			return;
	}
//	console.log(this);
	this.view.subViewsHolder.setEachMemberContent(values);
}

/**
 * @abstract
 */
ComponentWithReactiveText.prototype.setContentFromCacheOnTargetSubview = function() {
	if (!Array.isArray(this.targetSubViewContentCache) || !this.targetSubViewContentCache.length)
		return '';
	return this.view.setContentFromArrayOnTargetSubview(this.targetSubViewContentCache);
}

/**
 * @abstract
 */
ComponentWithReactiveText.prototype.setContentFromValueOnView = function(value) {
	if (typeof value !== 'string' && isNaN(parseInt(value)))
		return;
	this.view.value = value.toString();		// this.view.value is a "special" setter: it sets textContent OR value, based on the effective node
};

/**
 * @abstract
 */
ComponentWithReactiveText.prototype.appendContentFromValueOnView = function(value) {
	if (typeof value !== 'string' && isNaN(parseInt(value)))
		return;
	this.view.appendText(value.toString());		// this.view.value is a "special" setter: it sets textContent OR value, based on the effective node
};

ComponentWithReactiveText.prototype.emptyTargetSubView = function() {
	return this.view.emptyTargetSubView();
}

ComponentWithReactiveText.prototype.resetTargetSubViewContent = function() {
	this.targetSubViewContentCache.length = 0;
	this.emptyTargetSubView();
	return true;
}









/**
 * @constructor ComponentWithReactiveText_Fast
 */
var ComponentWith_FastReactiveText = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithReactiveText.call(this, definition, parentView, parent, isChildOfRoot);
	this.objectType = 'ComponentWith_FastReactiveText';
}
ComponentWith_FastReactiveText.prototype = Object.create(ComponentWithReactiveText.prototype);
ComponentWith_FastReactiveText.prototype.objectType = 'ComponentWith_FastReactiveText';

/**
 * @abstract
 */
ComponentWith_FastReactiveText.prototype.setContentFromArrayOnEachMemberView = function(values) {
	this.view.subViewsHolder.setEachMemberContent_Fast(values);
}



















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
	var self = this, input = this.view.subViewsHolder.memberViews[1];
//	console.warn('ComponentStrokeAware :', 'where is "input"');
	
	// Stroke event listener 
	input.hostElem.addEventListener('keyup', function(e) {
		e.stopPropagation();
//		var allowed = [189, 190, 191]; // corresponds to **. , -**
//		allowed.indexOf(e.keyCode) >= 0 && 
 
	    if (e.keyCode >= 32 && (e.keyCode < 48 || e.keyCode > 57) && e.keyCode <= 191)
	        self.trigger('stroke', e);
	});
}










/**
 * @constructor ComponentWithViewAbstractingAFeed
 */
var ComponentWithViewAbstractingAFeed = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithHooks.call(this, definition);
	this.objectType = 'ComponentWithViewAbstractingAFeed';
	this.createEvent('exportdata');
}

ComponentWithViewAbstractingAFeed.prototype = Object.create(ComponentWithHooks.prototype);
ComponentWithViewAbstractingAFeed.prototype.objectType = 'ComponentWithViewAbstractingAFeed';

ComponentWithViewAbstractingAFeed.prototype.exportData = function(data) {
	this.trigger('exportdata', data);
}

























module.exports = {
	ExtensibleObject : ExtensibleObject,
	AbstractComponent : AbstractComponent,
	HierarchicalObject : HierarchicalObject,
	ComponentWithView : ComponentWithView,
	CompositorComponent : CompositorComponent,
	ComponentWithHooks : ComponentWithHooks,
	ComponentWithReactiveText : ComponentWithReactiveText,
	ComponentWith_FastReactiveText : ComponentWith_FastReactiveText,
	ComponentStrokeAware : ComponentStrokeAware,
	ComponentWithViewAbstractingAFeed : ComponentWithViewAbstractingAFeed
};