/**
 * @constructor Component
 */

var CoreTypes = require('src/core/CoreTypes');
var TypeManager = require('src/core/TypeManager');
var ElementDecorator = require('src/UI/_mixins/elementDecorator_HSD');

var Logger = require('src/Error&Log/Logger');

var Geometry = require('src/tools/Geometry');


/**
 * @constructor LoggingEventEmmitter
 */
var LoggingEventEmmitter = function(definition, parentView, parent) {
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'LoggingEventEmmitter';
	
	this.logger = new Logger();
	this.logger._currentlyCallingObjectType = Object.getPrototypeOf(this).objectType;
	this.log = this.logger.log.bind(this.logger);
}
LoggingEventEmmitter.prototype = Object.create(CoreTypes.EventEmitter.prototype);
LoggingEventEmmitter.prototype.objectType = 'LoggingEventEmmitter';



/**
 * @constructor HierarchicalObject
 */
var HierarchicalObject = function(definition, parentView, parent) {
	LoggingEventEmmitter.call(this);
	this.objectType = 'HierarchicalObject';
	this._key;

	this._parent = (parent && parent instanceof HierarchicalObject && parent.pushChild(this)) ? parent : null;
	this._children = [];
	this._fastAccessToChildren = {};
}
HierarchicalObject.prototype = Object.create(LoggingEventEmmitter.prototype);
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
 * 
 */
HierarchicalObject.prototype.getFirstChild = function() {
	return this._children[0];
}

HierarchicalObject.prototype.getChildAt = function(Idx) {
	return this._children[Idx];
}

HierarchicalObject.prototype.getLastChild = function() {
	return this._children[this._children.length - 1];
}

/**
 * 
 */
HierarchicalObject.prototype.storePathToChild = function(pathName, componentPath) {
	this._fastAccessToChildren[pathName] = componentPath;
}

HierarchicalObject.prototype.getChildFromStoredPath = function(pathName) {
	var pathToChild = this._fastAccessToChildren[pathName].slice(0);
	return this.getChildFromPath(pathToChild);
}

HierarchicalObject.prototype.getChildFromPath = function(pathAsArray) {
	var result = {
			child : null
		};
	this.traverseChildrenAlongPath(pathAsArray, result);
	return result.child;
}

HierarchicalObject.prototype.traverseChildrenAlongPath = function(path, result) {
	if (path.length > 1) {
		this._children[path.shift().childKey].traverseChildrenAlongPath(path, result);
	}
	else
		result.child = this._children[path.shift().childKey];
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
	this._children[childKey].view.getMasterNode().remove();
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
		return this.view.getMasterNode().remove();
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


HierarchicalObject.prototype.getPathToSelfFromRoot = function () {
	function getNode(component) {
		return {
			childKey : component._key
		};
	}
	var ret = [];
	this.traverseAscendants(this, ret, getNode);
	return ret.reverse();
}

HierarchicalObject.prototype.traverseAscendants = function (component, componentPath, getNode) {
	
	if (component._parent) {
		componentPath.push(getNode(component));
		this.traverseAscendants(component._parent, componentPath, getNode);
	}
}


HierarchicalObject.prototype.getDescendantsAsNameTree = function (maxStrLen) {
	function getNode(component) {
		return {
			name : Object.getPrototypeOf(component).objectType.slice(0, maxStrLen),
			children : []
		};
	}
	var ret = getNode(this);
	this.traverseDescendants(this, ret, getNode);
	return ret;
}

HierarchicalObject.prototype.getDescendantsAsKeyValueTree = function () {
	function getNode(component) {
		var node = {};
		node[Object.getPrototypeOf(component).objectType] = []
		return node;
	}
	var ret = getNode(this);
	this.traverseDescendantsRaw(this, ret, getNode);
	return ret;
}

HierarchicalObject.prototype.traverseDescendants = function (component, componentTree, getNode) {
	var node;
	component._children.forEach(function(child) {
		node = getNode(child);
		if (Array.isArray(child._children) && child._children.length) {
			componentTree.children.push(this.traverseDescendants(child, node, getNode));
		}
		else {
			componentTree.children.push(node);
		}
	}, this);

	return componentTree;
}

HierarchicalObject.prototype.traverseDescendantsRaw = function (component, componentTree, getNode) {
	var node;
	
	component._children.forEach(function(child) {
		node = getNode(child);
		if (Array.isArray(child._children) && child._children.length) {
			componentTree[Object.getPrototypeOf(component).objectType].push(this.traverseDescendantsRaw(child, node, getNode));
		}
		else {
			componentTree[Object.getPrototypeOf(component).objectType].push(node);
		}
	}, this);

	return componentTree;
}




HierarchicalObject.prototype.overrideParent = function (Idx) {
	if (!this._parent || !this._parent._parent) {
		console.warn('Attempt to override the upmost level in the component\'s hierarchy. Returning.');
		return;
	}
	Idx = Idx || 0;
	
	if (this._parent.view) {
		this._parent.view.getMasterNode().remove();
	}
	if (this._parent._subscriptions && this._parent._subscriptions.length) {
		this._parent._subscriptions.forEach(function(sub) {
			sub.unsubscribe();
		});
	}
	this._parent.clearEventListeners();
	// TODO: selectively remove the right 'onUpdate' listener
//	this.clearEventListeners();
	
	this._parent = this._parent._parent;
	this._parent._children[Idx] = this;
	
	this.addEventListener('update', function(e) {
		if (e.bubble)
			this.trigger('update', e.data, true);
	}.bind(this._parent));
	if (this._parent.streams.selected && this.streams.selected)
		this._parent.streams.selected.subscribe(this.streams.selected, 'value');
	
	if (this._parent.view) {
		this.view.parentView = this._parent.view;
		this._parent.view.getRoot().appendChild(this.view.getMasterNode());
	}
	
	this.generateKeys();
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
			value : [],
			writable : true,
		});
	if (!(namespace.prototype.hasOwnProperty('_asyncRegisterTasks')))
		Object.defineProperty(namespace.prototype, '_asyncRegisterTasks', {
			value : [],
			writable : true,
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
	
	if (typeof this._defUID === 'undefined') {
		console.warn('No UID found in definition: the hierarchical structure of the def might be wrong. eg: a group def has been defined and its type is not "CompoundComponent", etc. Returning...');
		return;
	}
	
//	console.log(definition);
	if (!TypeManager.hostsDefinitionsCacheRegistry.getItem(this._defUID))
		this.populateStores(definition);
	this.createEvent('update');
	
	TypeManager.typedHostsRegistry.getItem(this._defUID).push(this);
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
//		if (TypeManager.hostsDefinitionsCacheRegistry.getItem(this._defUID, this._defComposedUID))
//			return;
	}
	else
		this._defComposedUID = this._defUID;
	
	var hostDef = definition.getHostDef();
	
//	console.log(hostDef.sWrapper === null, Object.getPrototypeOf(this).objectType, defaultHostDef);
	if (defaultDef) {
		TypeManager.propsAreArray.forEach(function(prop) {
//			if(!defaultHostDef[prop])
//				console.log(prop, defaultHostDef);
			if(defaultHostDef[prop].length)
				Array.prototype.push.apply(hostDef[prop], defaultHostDef[prop]);
		});
		TypeManager.propsArePrimitives.forEach(function(prop) {
			if (hostDef[prop] === null)
				hostDef[prop] = defaultHostDef[prop];
		});
		// TODO: At first, we weren't allowing override,
		// => Is it really the right way to do it ?
		if (hostDef.sWrapper === null)
			hostDef.sWrapper = defaultHostDef.sWrapper;
		if (hostDef.command === null)
			hostDef.command = defaultHostDef.command;
		
		// Brutal subSections & members override:
		// => descendant views are easier to define in the Component's class
		// 		and should not be different in the runtime immplementation
		if (defaultDef.subSections.length)
			Array.prototype.push.apply(definition.subSections, defaultDef.subSections);
		
		if (defaultDef.members.length)
			Array.prototype.push.apply(definition.members, defaultDef.members);
	}
	
//	console.log(defaultDef, hostDef, hostDef.nodeName);
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
	TypeManager.hostsDefinitionsCacheRegistry.setItem(this._defUID, definition);
	TypeManager.typedHostsRegistry.setItem(this._defUID, []);
	
	// HACK
//	((hostDefinition.sOverride && hostDefinition.sWrapper) && hostDefinition.sWrapper.overrideStyles(hostDefinition.sOverride));
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
//	if (this.objectType === 'MultisetAccordionComponent')
//		console.log(reactOnParent, this);
	var subscribtion;
	reactOnParent.forEach(function(query, key) {
		subscribtion = query.subscribeToStream(parentComponent.streams[query.from], this);
		if (subscribtion)
			subscribtion.unAnonymize(this.UID, this.objectType);
	}, this);
}

ComponentWithObservables.prototype.reactOnSelfBinding = function(reactOnSelf, parentComponent, subscriptionType) {
//	if (this.objectType === 'MultisetAccordionComponent')
//		console.log(reactOnSelf, this);
	
	var subscribtion;
	reactOnSelf.forEach(function(query, key) {
		subscribtion = query.subscribeToStream(this.streams[query.from || query.to], this);
		if (subscribtion)
			subscribtion.unAnonymize(this.UID, this.objectType);
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
//	console.log(definition);
	
	if (definition.getHostDef().nodeName) {
		this.instanciateView(definition, parentView, this, isChildOfRoot);
		this.styleHook = this.view.styleHook;
	}
	else
		console.warn('A ComponentWithView failed to instanciate a view.', 'The _defUID is ', definition.getHostDef().UID, 'The nodeName is ', definition.getHostDef().nodeName)
	
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
}

/**
 * @param {ComponentDefinition} definition
 * @param {ComponentView} parentView
 */
ComponentWithView.prototype.instanciateView = function(definition, parentView, parent, isChildOfRoot) {
//	console.log(parentView);
	this.view = new CoreTypes.ComponentView(definition, parentView, parent, isChildOfRoot);
}

/**
 * @abstract
 */
ComponentWithView.prototype.setContentFromValueOnView = function(value) {
//	console.log(value)
	if (typeof value !== 'string' && isNaN(parseInt(value)))
		return;
	this.view.value = value.toString();		// this.view.value is a "special" setter: it sets textContent OR value, based on the effective node
};

/**
 * @abstract
 */
ComponentWithView.prototype.setContentFromValueOnMemberView = function(value, memberViewIdx) {
	this.view.subViewsHolder.memberAt(memberViewIdx).setContentNoFail(value.toString());		// this.view.value is a "special" setter: it sets textContent OR value, based on the effective node
};

/**
 * @abstract
 */
ComponentWithView.prototype.appendContentFromValueOnView = function(value) {
	if (typeof value !== 'string' && isNaN(parseInt(value)))
		return;
	this.view.appendText(value.toString());		// this.view.value is a "special" setter: it sets textContent OR value, based on the effective node
};

ComponentWithView.prototype.emptyTargetSubView = function() {
	return this.view.emptyTargetSubView();
}

ComponentWithView.prototype.resetTargetSubViewContent = function() {
	this.targetSubViewContentCache.length = 0;
	this.emptyTargetSubView();
	return true;
}










/**
 * @param {Component} child
 */
ComponentWithView.prototype.onRemoveChild = function(child) {
	if (typeof child === 'undefined') {
//		console.log(this.view.subViewsHolder.subViews[1].getMasterNode());
		if (this.view.subViewsHolder.subViews.length) {
			this.view.subViewsHolder.subViews.forEach(function(subView, key) {
				while (subView.getMasterNode().firstChild) {
					subView.getMasterNode().removeChild(subView.getMasterNode().lastChild);
				}
			}, this);
		}
		this._children.forEach(function(child, key) {
			child.view.getMasterNode().remove();
		}, this);
		if (this.view.subViewsHolder.memberViews.length) {
			this.view.subViewsHolder.memberViews.forEach(function(member, key) {
				member.getMasterNode().remove();
			}, this);
		}
//		this.view.subViewsHolder.subViews[1].getMasterNode().length = 0;
//		this.view.getMasterNode().remove();
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

/**
 * @param {number} y
 */
ComponentWithView.prototype.getViewOfChildBasedOnYpos = function(y) {
	var self = this;
	this.styleHook.getBoundingBox().then(function(boundingBox) {
		self._children.forEach(function(child) {
			// boundingBox.offsetX, y, boundingBox.offsetX, boundingBox.offsetY + boundingBox.h
//			Geometry.ComponentHitTest(child._key > 1 ? this._children[child._key - 1] : null, child, this._children[child._key + 1]);
		}, self);
	});
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
	if (definition.getHostDef().targetSlotIndex !== null && this.view.targetSubView === null) {
		this.view.getTargetSubView(definition.getHostDef());
	}
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
		if(asyncTask.type === 'lateAddChild' || asyncTask.type === 'lateInit') {
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
	if (newDef.getHostDef().nodeName) {
		this.view.subViewsHolder.addMemberViewFromDef(newDef.getHostDef());
		// HACK: the renderer expects a view to cache its "attributes" prop
		// NOT WORKING?: caches items are inndexed on the defUID of the component
		// FINAL HYPOTHESIS: not needed...
//		TypeManager.caches['attributes'].setItem(newDef.getHostDef().UID, newDef.getHostDef()['attributes']);
	}
	
	if (newDef.members.length) {
		newDef.members.forEach(function(memberDef) {
			this.view.subViewsHolder.addMemberViewFromDef(memberDef);
			// HACK: the renderer expects a view to cache its "attributes" prop
			// NOT WORKING?: caches items are inndexed on the defUID of the component
			// FINAL HYPOTHESIS: not needed...
//			TypeManager.caches['attributes'].setItem(memberDef.UID, memberDef['attributes']);
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
	// 		=> the callback shall call the component -> the main view -> the subViewsHost -> the memberViews[ -counter- ].getMasterNode().hidden
	// Instanciate a view with the host's view as parent view (the view references the UID of the definition)
	// Add that view to the subViewsHost->memberViews of the main view
	
	var statefullExtendedDef;
	if (!(statefullExtendedDef = TypeManager.hostsDefinitionsCacheRegistry.getItem(componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className')))) {
		// This also is tricky, as we keep all along the call stack that ComponentDef which should be a hostDef.
		// The only reason being that we discriminate the "grouped" append in the second test-case above as the one having "members" and "no nodeName on host"
		// TODO: THAT MUST CHANGE.
		statefullExtendedDef = TypeManager.createComponentDef(nodeDefinition);
		statefullExtendedDef.host.UID = componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className');
		
		TypeManager.hostsDefinitionsCacheRegistry.setItem(statefullExtendedDef.host.UID, statefullExtendedDef);
		
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
					this.view.subViewsHolder.memberViews[memberViewIdx].getMasterNode().hidden = (state.indexOf('Not') === -1 ? !value : value) ? 'hidden' : null;
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
	this.Compositor.apply(this, arguments);
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
var ComponentStrokeAware = function(definition, parentView, parent, isChildOfRoot) {
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
	input.getMasterNode().addEventListener('keyup', function(e) {
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

















/**
 * @constructor ComponentWithCanvas
 */
var ComponentWithCanvas = function(definition, parentView, parent, isChildOfRoot) {
	ComponentWithHooks.call(this, definition, parentView, parent, isChildOfRoot);
	this.objectType = 'ComponentWithCanvas';
	
	this.view.getDimensions();
	
//	this.view.h = parseInt(definition.getHostDef().sWrapper.rules.canvas.rule.attributes.height);
//	this.view.w = parseInt(definition.getHostDef().sWrapper.rules.canvas.rule.attributes.minWidth);
//	console.log(this.view.w, this.view.h);
}

ComponentWithCanvas.prototype = Object.create(ComponentWithHooks.prototype);
ComponentWithCanvas.prototype.objectType = 'ComponentWithCanvas';

/**
 * @param {ComponentDefinition} definition
 * @param {ComponentView} parentView
 */
ComponentWithCanvas.prototype.instanciateView = function(definition, parentView, parent, isChildOfRoot) {
	this.view = new CoreTypes.CanvasView(definition, parentView, parent, isChildOfRoot);
}






































module.exports = {
	ExtensibleObject : ExtensibleObject,
	AbstractComponent : AbstractComponent,
	HierarchicalObject : HierarchicalObject,
	ComponentWithView : ComponentWithView,
	ComponentWithObservables : ComponentWithObservables,
	CompositorComponent : CompositorComponent,
	ComponentWithHooks : ComponentWithHooks,
	ComponentWithReactiveText : ComponentWithReactiveText,
	ComponentWith_FastReactiveText : ComponentWith_FastReactiveText,
	ComponentStrokeAware : ComponentStrokeAware,
	ComponentWithViewAbstractingAFeed : ComponentWithViewAbstractingAFeed,
	ComponentWithCanvas : ComponentWithCanvas
};