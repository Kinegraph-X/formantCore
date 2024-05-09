/**
 * @constructor Component
 */
// @ts-nocheck
const CoreTypes = require('src/core/CoreTypes');
const TypeManager = require('src/core/TypeManager');
const TemplateFactory = require('src/core/TemplateFactory');
const Registries = require('src/core/Registries');
const ElementDecorator = require('src/core/elementDecorator_HSD');

var Logger = require('src/Error&Log/Logger');

//var Geometry = require('src/tools/Geometry');


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
	
	this._parent = (parent && parent instanceof HierarchicalObject) 
		? (parent.pushChild(this) && parent)
		: parentView instanceof CoreTypes.ComponentView && parentView._parent
			? (parentView._parent.pushChild(this) && parentView._parent) 
			: null;
	
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
 * A method accepting not having created the view
 * (used mainly by the present type)
 * @param {object} child : an instance of another object of the same type
 */
HierarchicalObject.prototype.pushChild = function(child) {
	child._parent = this;
	child._key = this._children.length;
	this._children.push(child);
	this.onAddChild(child);
	return true;
}

/**
 * A method to be used on the context of a component
 * (requires having created a view)
 * @param {object} child : an instance of another object of the same type
 */
HierarchicalObject.prototype.addChild = function(child) {
	child._parent = this;
	// Assign twice:
	// The first time we define the view of the parent
	// The second time, depending ont he view of the parent, we switch to a subView if appropriate
	child.view.parentView = this.view;
	child.view.parentView = child.view.getEffectiveParentView();
	child._key = this._children.length;
	// onAddChild is an ultra-standard approach wich doesn't support appending to subviews
	// TODO: See if we can make it smarter
//	this.onAddChild(child);
	return true;
}

/**
 * @param {object} child : an instance of another object
 * @param {number} atIndex : the required index to splice at
 */
HierarchicalObject.prototype.addChildAt = function(child, atIndex) {
	if (atIndex >= this._children.length)
		return;
		
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
	if (childKey >= this._children.length)
		return;
		
	var removedChild;

	this._children[childKey].isAttached = false;
	if (this._children[childKey].view.getMasterNode())
		this._children[childKey].view.getMasterNode().remove();
	removedChild = this._children.splice(childKey, 1)[0];
//	this.onRemoveChild(removedChild);
	(childKey < this._children.length && this.generateKeys(childKey));
	return removedChild;
}

/**
 * @param {number} atIndex : the required index to clear at
 */
HierarchicalObject.prototype.removeChildAt = function(atIndex) {
	if (atIndex >= this._children.length)
		return;
	var removedChild = this._children.splice(atIndex, 1);
	this.generateKeys(atIndex);
	this.onRemoveChild(removedChild[0]);
}

/**
 * 
 */
HierarchicalObject.prototype.removeAllChildren = function() {
	this._children.forEach(function(child) {
		this.onRemoveChild(child);
	}, this);
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
 * mergeOwnProperties
 * 
 * This function has multiple signatures,
 * the first parameter is optional
 * 
 * @param {Boolean|Object}: keepNonStdProtosOrProto
 * @param {Object} proto
 * @illimitedParams {Object} proto
 */
ExtensibleObject.prototype.mergeOwnProperties = function(keepNonStdProtosOrProto, proto) {
	var self = this, keepNonStdProtos = false, obj, desc, targetDesc, isArray, isObj, len, testedProto,
		// allow not passing the "keepNonStdProtosOrProto" parameter
		// => in that case, the first argument is the target object
		target = (typeof arguments[0] === 'boolean'
					&& arguments[0]
					&& (keepNonStdProtos = true))
						? arguments[1]
						: arguments[0] || {},
		i = keepNonStdProtos ? 2 : 1,
		length = arguments.length,
		testObj;
		
	if (target.prototype === Object.prototype) {
		console.error('you\'re not allowed to extend the native "Object" constructor');
		return;
	}
	
	// We may want to merge more than 2 objects : loop on the arguments
	for ( ; i < length; i++ ) {
		// Avoid erroneous calls where this function is called with a "null" or undefined argument
		if ((obj = arguments[ i ])) {
			// As we may be "mixing" a constructor, which has its own prototype AND an inherited prototype
			// Prepare the case for keepNonStdProtosOrProto :
			// We'll set the prototype of the constructor AND the inherited prototype as "own" props
			// Thus, we shall have sort of a "doubled" prototype chain.
			// (in reality, the chain will end after the first level, on the inheriting type, for now,
			// and we don't need more, as in most cases
			// it inherits from the CompositorComponent)
			testObj = Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(obj)));

			// Extend the target object
			// (it is frequently an empty object,
			// with its <prototype> key set to the baseClass's protoype we're inheriting from,
			// as we have this need for late extensions,
			// eg. extension of core Components in the framework)
			testObj.forEach(function(name) {
				// When keepNonStdProtos is set (as first argument of the function),
				// this function aims at retrieving the prototype of an instance
				// by setting its properties at the "own property" level
				// of the target => avoid if not explicitely called
				if (!keepNonStdProtos && !obj.hasOwnProperty(name))
					return;
				// don't merge properties from the prototype of extended natives
				// even if asked
				else if (!obj.hasOwnProperty(name) && (target instanceof Array || target instanceof String || target instanceof Object || target instanceof Boolean))
						return;
				
				desc = Object.getOwnPropertyDescriptor(obj, name);
				// Case of "described"" properties is handled at the end
				if (typeof desc === 'undefined') {
					if ((isArray = Array.isArray(obj[name])) || (isObj = (Object.prototype.toString.call(obj[name]) === '[object Object]'))) {
						len = obj[name].length || Object.keys(obj[name]).length;
						if (len) {
							// don't merge object instances that are deeper than the first level : 
							// we don't have a mechanism here to cleanly retrieve their <prototype> key
							// (Our mechanism would cause object instances from the framework
							// hosted as a prop on an instance, to have its props from the prototype
							// as "own" properties)
							if ((testedProto = Object.getPrototypeOf(obj[name])) === Object.prototype || testedProto === Array.prototype)
								target[name] = self.mergeOwnProperties(target[name] || (isArray ? [] : {}), obj[name]);
							// just copy object instances and don't recurse
							else
								target[name] = obj[name]
						}
						else
							target[name] = isArray ? [] : {};
					}
					else if (obj[name] || obj[name] === null) 	// copy null values : null is sometimes explicitly tested
						target[name] = obj[name];
					// Scalars that resolve to "falsy", which are not undefined and not null
					else if (typeof obj[name] !== 'function' && typeof obj[name] !== 'undefined' && obj[name] !== null)
						target[name] = typeof obj[name] === 'string' ? '' : 0;
				}
				else {
					targetDesc = Object.getOwnPropertyDescriptor(target, name);
					// Edge case ? Maybe there are some...
					if (typeof targetDesc !== 'undefined' && (!targetDesc.writable || !targetDesc.configurable))
						return;
					
					// Getters can't have a value
					if (!desc.get)
						Object.defineProperty(target, name, {
							value : obj[name],
							writable : desc.writable,
							enumerable : desc.enumerable,
							configurable : desc.configurable
						});
					else
						Object.defineProperty(target, name, {
							writable : desc.writable,
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
		namespace.prototype._asyncInitTasks = [];
	if (!(namespace.prototype.hasOwnProperty('_asyncRegisterTasks')))
		namespace.prototype._asyncRegisterTasks = [];
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

/**
 * @reminder
 * Asynchronous tasks are inherited through the prototype during the mixin, but should not be referenced by "any" component
 */
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
	if (typeof this._defUID === 'undefined') {
		console.warn('No UID found in definition: the hierarchical structure of the def might be wrong. eg: a group def has been defined and its type is not "CompoundComponent", etc. Returning...', definition);
		return;
	}
	
//	console.log(definition);
	if (!Registries.hostsDefinitionsCacheRegistry.getItem(this._defUID))
		this.populateStores(definition);
	this.createEvent('update');
	
//	console.log(definition.getHostDef().UID, definition.getHostDef().nodeName, definition)
	Registries.typedHostsRegistry.getItem(this._defUID).push(this);
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
//	console.log(this.createDefaultDef());
	if ((defaultDef = this.createDefaultDef(definition))) {
		defaultHostDef = defaultDef.getGroupHostDef() ? defaultDef.getGroupHostDef() : defaultDef.getHostDef();
		this._defComposedUID = defaultHostDef.UID;
//		if (Registries.hostsDefinitionsCacheRegistry.getItem(this._defUID, this._defComposedUID))
//			return;
	}
	else
		this._defComposedUID = this._defUID;
	
	var hostDef = definition.getHostDef();	// the CompoundComponent's ctor passes here only the received hostDef
	
//	console.log(definition.getHostDef().UID, definition.getHostDef().nodeName, defaultDef)
//	if (hostDef.type === 'TextInput')		
//		console.error('TextInput', defaultHostDef, hostDef);
		
//	console.log(hostDef.sWrapper === null, Object.getPrototypeOf(this).objectType, defaultHostDef);
	if (defaultDef) {
		TypeManager.propsAreArray.forEach(function(prop) {
//			if(!defaultHostDef[prop])
//				console.log(prop, defaultHostDef);
//			if(defaultHostDef[prop].length)
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
		// Overrides should not be defined in the  defaultDef:
		// but we met a case were we were wrongly defining it there,
		// and that showed us that users may want to do that and expect it to work
		// => so it's a worst case situation: the default override won't work 
		// if there's an explicit override. But users should understand
		// that we won't support fusionning the override and the override. That makes no sense...
		if (hostDef.sOverride === null)
			hostDef.sOverride = defaultHostDef.sOverride;
		if (hostDef.command === null)
			hostDef.command = defaultHostDef.command;
		
		
		var defaultDefContainedSubSectionsViews = defaultDef.getGroupHostDef() ? defaultDef.getHostDef().subSections : defaultDef.subSections;
		var defaultDefContainedMemberViews = defaultDef.getGroupHostDef() ? defaultDef.getHostDef().members : defaultDef.members;
		// Brutal subSections & members override:
		// => descendant views are easier to define in the Component's class
		// 		and should not be different in the runtime immplementation
		if (defaultDefContainedSubSectionsViews.length)
			Array.prototype.push.apply(definition.subSections, defaultDefContainedSubSectionsViews);
		
		if (defaultDefContainedMemberViews.length)
			Array.prototype.push.apply(definition.members, defaultDefContainedMemberViews);
	}
	
//	if (hostDef.type === 'TextInput')
//		console.log(definition);
}

/**
 * @param {ComponentDefinition}
 */
AbstractComponent.prototype.populateStores = function(definition) {
	this.mergeDefaultDefinition(definition);
	var hostDefinition = definition.getHostDef();
//	console.log('populateStores')
//	console.log(hostDefinition);
	
	var title;
	if ((title = hostDefinition.attributes.getObjectValueByKey('title')) && title.slice(0, 1) === '-')
		ElementDecorator['Hyphen-Star-Dash'].decorateAttributes(hostDefinition.nodeName, hostDefinition.attributes);
	
	for (let prop in Registries.caches) {
		Registries.caches[prop].setItem(this._defUID, hostDefinition[prop]);
	}
	Registries.hostsDefinitionsCacheRegistry.setItem(this._defUID, definition);
	Registries.typedHostsRegistry.setItem(this._defUID, []);
	
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
//	console.log('ComponentWithView', parentView);
//	console.log('isChildOfRoot', isChildOfRoot);
	// Let's allow not passing a definition.
	// This is a common pattern we've used in the documentation
	// (although we had chosen until now to excplicitely mock the def
	//  before calling the specialized constructor)
	if (definition === null) {
		definition = TypeManager.mockDef();
//		definition.getHostDef().nodeName = 'dummy';
	}
	
//	console.log(definition);
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
//	console.log('ComponentWithView', this.view);
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
	if (typeof value !== 'string' && isNaN(parseInt(value)))
		return;
	if (this.view.getWrappingNode().childNodes.length)
		console.warn('setContentFromValueOnView : replacing the content of a node that already has content. Value is :', value)
	this.view.value = value.toString();		// this.view.value is a "special" setter: it sets textContent OR value, based on the effective node
};

/**
 * @abstract
 */
ComponentWithView.prototype.setContentFromValueOnMemberView = function(value, memberViewIdx) {
	if (this.view.subViewsHolder.memberAt(memberViewIdx).getWrappingNode().childNodes.length)
		console.warn('setContentFromValueOnView : replacing the content of a node that already has content. Value is :', value)
	this.view.subViewsHolder.memberAt(memberViewIdx).setContentNoFail(value.toString());		// this.view.value is a "special" setter: it sets textContent OR value, based on the effective node
};

/**
 * @abstract
 * @needsRefactoring Here only for ascendant compatibility
 */
ComponentWithView.prototype.appendContentFromValueOnView = function(value) {
	this.appendTextFromValueOnView(value);
};

/**
 * @abstract
 */
ComponentWithView.prototype.appendTextFromValueOnView = function(value) {
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
	else if (child && child.view.getMasterNode()) {		// check presence of masterNode, as we may be removing a childComponent before the view has been rendered
		if (child.view.subViewsHolder.subViews.length) {
			child.view.subViewsHolder.subViews.forEach(function(subView, key) {
				while (subView.getMasterNode().firstChild) {
					subView.getMasterNode().removeChild(subView.getMasterNode().lastChild);
				}
			}, child);
		}
		child._children.forEach(function(childOfChild, key) {
			childOfChild.view.getMasterNode().remove();
		}, child);
		if (child.view.subViewsHolder.memberViews.length) {
			child.view.subViewsHolder.memberViews.forEach(function(member, key) {
				member.getMasterNode().remove();
			}, child);
		}
		child.view.getMasterNode().remove();
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
	
	if (typeof atIndex !== 'undefined') {
		if (child.view.parentView)		// try to respect an eventually specifically assigned parentView
			child.view.parentView.addChildAt(child.view, atIndex);
		else							// else consider the parent view is the main view of the parent
			child._parent.view.addChildAt(child.view, atIndex);
	}
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
	lastAddChildren : function() {},						// virtual
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
	
//	if (definition.getHostDef().targetSlotIndex !== null)
//		console.log(this);
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
//	console.log('viewExtend', this.view, this._asyncInitTasks);
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
//	console.log('lateAddChildren', this.view, this._asyncInitTasks);
	var asyncTask;
	for (let i = 0, l = this._asyncInitTasks.length; i < l; i++) {
		asyncTask = this._asyncInitTasks[i];
		if(asyncTask.type === 'lateAddChild' || asyncTask.type === 'lateInit') {
			if (typeof asyncTask.execute !== 'function')
				console.log(asyncTask);
			asyncTask.execute(this, definition);
		}
	}
}

/**
 * @hook
 */
ComponentWithHooks.prototype.asyncRegister = function() {
	var asyncTask;
	for (let i = 0, l = this._asyncRegisterTasks.length; i < l; i++) {
		asyncTask = this._asyncRegisterTasks[i];
		if(asyncTask.type === 'lateBinding') {
			asyncTask.execute(this);
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
//		Registries.caches['attributes'].setItem(newDef.getHostDef().UID, newDef.getHostDef()['attributes']);
	}
	
	if (newDef.members.length) {
		newDef.members.forEach(function(memberDef) {
			this.view.subViewsHolder.addMemberViewFromDef(memberDef);
			// HACK: the renderer expects a view to cache its "attributes" prop
			// NOT WORKING?: caches items are inndexed on the defUID of the component
			// FINAL HYPOTHESIS: not needed...
//			Registries.caches['attributes'].setItem(memberDef.UID, memberDef['attributes']);
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
	if (!(statefullExtendedDef = Registries.hostsDefinitionsCacheRegistry.getItem(componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className')))) {
		// This also is tricky, as we keep all along the call stack that ComponentDef which should be a hostDef.
		// The only reason being that we discriminate the "grouped" append in the second test-case above as the one having "members" and "no nodeName on host"
		// TODO: THAT MUST CHANGE.
		statefullExtendedDef = TypeManager.createComponentDef(nodeDefinition);
		statefullExtendedDef.host.UID = componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className');
		
		Registries.hostsDefinitionsCacheRegistry.setItem(statefullExtendedDef.host.UID, statefullExtendedDef);
		
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
 * @constructor ComponentWithReactiveText
 */
var ComponentWithReactiveText = function(definition, parentView, parent, isChildOfRoot) {
//	console.log('ComponentWithReactiveText', parentView);
	ComponentWithHooks.call(this, definition, parentView, parent, isChildOfRoot);
//	console.log('ComponentWithReactiveText', this.view);
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
	var self = this, input = this.view.subViewsHolder.memberViews[1] || this.view;
//	console.warn('ComponentStrokeAware :', 'where is "input"');
	
	// Stroke event listener 
	input.getMasterNode().addEventListener('keyup', function(e) {
		e.stopPropagation();
//		var allowed = [189, 190, 191]; // corresponds to **. , -**
//		allowed.indexOf(e.keyCode) >= 0 && 
 
	    if (e.keyCode === 13 || e.keyCode === 27  || (e.keyCode >= 32 && (e.keyCode < 48 || e.keyCode > 57) && e.keyCode <= 191))
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


















/**
 * @constructor CompositorComponent
 */
var CompositorComponent = function(definition, parentView, parent) {//, argx, argy, arg...
	if (!this.Compositor)
		console.warn('Invalid inheritance through CompositorComponent: it seems you\'ve tried to extend a non-core component. Were you inheriting from an abstract type through the simple "extends" property ? (CompositorComponent is not needed then)')
	this.Compositor.apply(this, arguments);
	this.objectType = 'CompositorComponent';
}
CompositorComponent.prototype = Object.create(ComponentWithView.prototype);
CompositorComponent.prototype.objectType = 'CompositorComponent';
CompositorComponent.prototype.extendsCore = '';							// virtual
CompositorComponent.prototype.extends = '';								// virtual

//CompositorComponent.prototype.Compositor = function() {};				// virtual (decorated type property)

CompositorComponent.prototype.acquireCompositor = function() {};		// virtual

CompositorComponent.prototype.extendFromCompositor = function(inheritingType, inheritedType) {
//	console.log(inheritingType.prototype, inheritedType);
	var proto_proto = Object.create(inheritedType.prototype);
//	console.log(Object.hasOwn(inheritingType.prototype, '_asyncRegisterTasks'));
	Object.assign(proto_proto, inheritingType.prototype);
	inheritingType.prototype = proto_proto;
//	console.log(proto_proto, inheritingType.prototype);
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