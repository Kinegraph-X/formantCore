/**
 * @module Component
 */


const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const {
	ReactOnSelf,
	ReactOnParent,
	ReactivityQueryArray,
	EventSubscriptionArray,
	SubscribeOnChild,
	SubscribeOnSelf,
	TaskDefinition,
	ComponentTemplate,
	ViewTemplate,
} = require('src/coreTest/TemplateFactory');
const UIDGenerator = require('src/coreTest/UIDGenerator').UIDGenerator;

const {EventEmitter, Stream, RootComponentView, ComponentView} = require('src/coreTest/CoreTypes');
const TemplateReconcilier = require('src/coreTest/TemplateReconcilier');
const ViewFactory = require('src/coreTest/ViewFactory');
// const MemberComponentsFactory = require('src/coreTest/MemberComponentsFactory');

const registries = require('src/coreTest/Registries');
const ElementDecorator = require('src/coreTest/elementDecorator_HSD');




/** 
 * @typedef {{child: HierarchicalObject | null}} ComponentTransportObject
 * @typedef {{childKey: Number | null}} ComponentPathObject
 * @typedef {{name: String | null, children : Array<ComponentPathTreeObject>}} ComponentPathTreeObject
 * @typedef {{String : Array<ComponentPathKeyValueObject>}} ComponentPathKeyValueObject
*/


/**
 * @extends {EventEmitter<unknown>}
 */
class BaseHierarchicalObject extends EventEmitter {
	/** @type {string} */
	static objectType = 'HierarchicalObject';
	/** @type {string} */
	_UID;
	/** @type {Number} */
	key = 0;
	/** @type {HierarchicalObject[]} */
	children = [];

	constructor() {
		super();
		this._UID = UIDGenerator.newUID();
	}

	/**
	 * 
	 */
	getFirstChild() {
		return this.children[0];
	}
	
	/**
	 * @param {number} idx
	 */
	getChildAt(idx) {
		return this.children[idx];
	}
	
	/**
	 * 
	 */
	getLastChild() {
		return this.children[this.children.length - 1];
	}
	
	/**
	 * @param {HierarchicalObject} child : an instance of another object of the same type
	 */
	pushChild(child) {
		child.parent = this;
		child.key = this.children.length;
		this.children.push(child);
		// this.onAddChild(child);
		return true;
	}
	
	/**
	 * @param {HierarchicalObject} child : an instance of another object
	 * @param {Number} atIndex : the required index to splice at
	 */
	addChildAt(child, atIndex) {
		if (atIndex >= this.children.length) {
			console.error(Object.getPrototypeOf(this).objectType, 'atIndex is out of bounds (array of children)');
			return;
		}
			
		child.parent = this;
		child.key = atIndex;
		this.children.splice(atIndex, 0, child);
		this.generateKeys(atIndex);
		// this.onAddChild(child, atIndex);
	}
	
	/**
	 * @param {Number} atIndex : the required index to clear at
	 */
	removeChildAt(atIndex) {
		if (atIndex >= this.children.length){
			console.error(Object.getPrototypeOf(this).objectType, 'childKey is out of bounds (array of children)');
			return;
		}
		var removedChild = this.children.splice(atIndex, 1);
		this.generateKeys(atIndex);
		// this.onRemoveChild(removedChild[0]);
	}
	
	/**
	 * 
	 */
	removeAllChildren() {
		// this._children.forEach(function(child) {
		// 	this.onRemoveChild(child);
		// }, this);
		this.children.length = 0;
		return true;
	}
	
	/**
	 * @param {Number} atIndex : the first _key we need to invalidate
	 */
	generateKeys(atIndex) {
		for (let i = atIndex || 0, l = this.children.length; i < l; i++) {
			this.children[i].key = i;
		}
	}
}


class RootHierarchicalObject extends BaseHierarchicalObject {

}


class HierarchicalObject extends BaseHierarchicalObject {
	
	/** @type {BaseHierarchicalObject} */
	parent = new RootHierarchicalObject();
	
	/**
	 * @param {HierarchicalObject} parent
	 */
	constructor(parent) {
		super();
		this.parent = /** @type {HierarchicalObject} */ parent;
	}

	// /**
	//  * @virtual
	//  * @param {HierarchicalObject} child
	//  * @param {number} atIndex
	//  */
	// onAddChild(child, atIndex) {}	// virtual
	
	// /**
	//  * @virtual
	//  * @param {HierarchicalObject} child
	//  */
	// onRemoveChild(child) {} 		// virtual
	
	getSelfDepth() {
		let depth = 0, currentParent = this.parent;
		while (currentParent) {
			currentParent = /** @type {HierarchicalObject} */ (currentParent).parent;
			depth++;
		}
		return depth;
	}
}


		



class ExtensibleObject extends HierarchicalObject {
	/** @type {string} */
	static objectType = 'ExtensibleObject';
	/**
	 * @param {ExtensibleObject} parent 
	 */
	constructor(parent) {
		super(parent);
	}
}



class AsyncActivableObject extends ExtensibleObject {
	/** @type {string} */
	static objectType = 'AsyncActivableObject';
	/** @type {TaskDefinition[]} */
	_asyncInitTasks = [];
	/** @type {TaskDefinition[]} */
	_asyncRegisterTasks = [];
	
	/**
	 * @param {ExtensibleObject} parent
	 */
	constructor(parent) {
		super(parent);
	}
	
	/**
	 * @virtual
	 */
	asyncInit() {
		this._asyncInitTasks.forEach(
			function(asyncFunc, key) {
				/** @ts-ignore: virtual */
				asyncFunc.call(this);
			}
		);
	}
	
	/**
	 * pure signature, not to be implemented : interfaces must not inherit from a Component type, but may implement a method with this signature
	 */
	queueAsync() {
		return new TaskDefinition({
			/** @ts-ignore: virtual */
			type : '',
			task : function() {}
		});
	}
}







class ComponentWithObservables extends AsyncActivableObject {
	/**@type {string} */
	static objectType = 'ComponentWithObservables';
	/** @type {Subscription[]} */
	_subscriptions = [];
	/** @type {{[key : string]: Stream}} */
	streams = {};

	/**
	 * @param {AsyncActivableObject} parent
	 */
	constructor(parent) {
		super(parent);
	}
	
	/**
	 * @param {ReactivityQueryArray} reactOnParent
	 * @param {String} subscriptionType 
	 */
	reactOnParentBinding(reactOnParent, subscriptionType) {
		const parentComponent = /** @type {ComponentWithObservables} */ (this.parent);
		let subscribtion;
		reactOnParent.forEach(
			(query, key) => {
				subscribtion = query.subscribeToStream(parentComponent.streams[query.from], this);
				if (subscribtion)
					subscribtion.unAnonymize(this._UID, this.getType());
			}
		);
	}
	
	/**
	 * @param {ReactivityQueryArray} reactOnSelf
	 * @param {String} subscriptionType 
	 */
	reactOnSelfBinding(reactOnSelf, subscriptionType) {
		let subscribtion;
		reactOnSelf.forEach(
			(query, key) => {
				subscribtion = query.subscribeToStream(this.streams[query.from || query.to], this);
				if (subscribtion)
					subscribtion.unAnonymize(this._UID, this.getType());
			}
		);
	
	}
}













class BaseComponentWithView extends ComponentWithObservables {
	/** @type {string} */
	static objectType = 'BaseComponentWithView';
	/** @type {string|null} */
	_templateUID = '';
	/** @type {string} */
	_defaultTemplateUID = '';
	/** @type {string} */
	regUID = '';
	/** @type {unknown} */
	view;

	/**
	 * @virtual
	 * @returns {ComponentTemplate}
	 */
	static createDefaultDef() {return new ComponentTemplate(null);}
}

class RootComponent extends RootHierarchicalObject {
	/** @type {string} */
	static objectType = 'RootComponent';
	/** @type {string} */
	regUID = '';
	/** @type {InstanceType<typeof RootComponentView>} */	// parsing bug, seemingly
	view = new RootComponentView();
}



class ComponentWithView extends BaseComponentWithView {
	/** @type {string} */
	static objectType = 'ComponentWithView';
	/** @type {ComponentWithView[]} */
	children = [];
	/** @type {RootComponent|ComponentWithView} */
	parent;
	/** @type {InstanceType<ComponentView>} */		// parsing bug, seemingly
	view;
	/** @type {InstanceType<ComponentView>[]} */	// parsing bug, seemingly (TODO: find out why)
	subViews = [];
	/** @type {InstanceType<ComponentView>[]} */	// parsing bug, seemingly (TODO: find out why)
	memberViews = [];

	/**
	 * @param {BaseComponentWithView} parent
	 * @param {ComponentTemplate|null} cTemplate
	 */
	constructor(parent, cTemplate) {
		super(parent);
		
		if (!(parent instanceof ComponentWithView && parent.parent))  {
			throw new ComponentError(
				this,
				'parent isn\'t instance of ComponentWithView or has not parent.',
				parent
			);
		}
		this.parent = parent;
		this.parent.pushChild(this);
		this.createEvent('update');
		
		const {template,
				cTemplateUID,
				defaultTemplateUID
			} = TemplateReconcilier.reconcile(
					/** @type {typeof ComponentWithView} */ (this.constructor).createDefaultDef,
					cTemplate,
					Object.getPrototypeOf(this).objectType
				);
		
		// Debug props: the TemplateReconcilier registers the default template (reconciliated if needed)
		// We keep track of what's been passed.
		this._templateUID = cTemplateUID;	// may be null
		this._defaultTemplateUID = this.regUID = defaultTemplateUID;
		this.command = template.command;
		
		this.view = ViewFactory.newView(template.view, this.parent.view, this);
	}



	/**
	 * @param {ComponentWithView} child
	 */
	removeChild(child) {
		if (child.subViews.length) {
			child.subViews.forEach(function(subView, key) {
				while (subView.getMasterNode().firstChild) {
					subView.getMasterNode().removeChild(subView.getMasterNode().lastChild);
				}
			}, child);
		}
		child.children.forEach(function(childOfChild, key) {
			childOfChild.view.getMasterNode().remove();
		}, child);
		if (child.memberViews.length) {
			child.memberViews.forEach(function(member, key) {
				member.getMasterNode().remove();
			}, child);
		}
		child.view.getMasterNode().remove();
		// remove a child
		// TODO: should call super(), as the ComponentWithView should neither handle streams, nor subscriptions 
		child._subscriptions.forEach(function(subscription) {
			subscription.unsubscribe();
		});
	}
	
	/**
	 * @param {ComponentWithView} child
	 * @param {number} atIndex
	 */
	addChildAt(child, atIndex) {
		HierarchicalObject.prototype.addChildAt.call(this, child, atIndex);
		child.parent.view.addChildAt(child.view, atIndex);
	}
	
	/**
	 * @param {number} y
	 */
	getViewOfChildBasedOnYpos(y) {
		var self = this;
		this.styleHook.getBoundingBox().then(function(boundingBox) {
			self.children.forEach(function(child) {
				// boundingBox.offsetX, y, boundingBox.offsetX, boundingBox.offsetY + boundingBox.h
	//			Geometry.ComponentHitTest(child._key > 1 ? this._children[child._key - 1] : null, child, this._children[child._key + 1]);
			}, self);
		});
	}
	
	/**
	 * @param {number} targetIdx
	 */
	childButtonsHighlightLoop(targetIdx) {
		if (this.children.length === 1)
			this.children[0].streams.highlighted.value = null;
		else {
			this.children.forEach(function(child) {
				if (child.key === targetIdx)
					child.streams.highlighted.value = 'highlighted';
				else
					child.streams.highlighted.value = null;
			});
		}
	}
	
	/**
	 * @param {number} 
	 * @param {'asc'|'desc'} order
	 */
	childButtonsSortedLoop = function(targetIdx, order) {
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
}








class ComponentWithHooks extends ComponentWithView {

	objectType = 'ComponentWithHooks';

	/**
	 * @constructor ComponentWithHooks
	 * @param {ComponentTemplate} definition
	 * @param {ComponentWithView} parentView
	 * @param {Boolean} isChildOfRoot 
	 */
	constructor(definition, parentView, isChildOfRoot) {
		super(definition, parentView, isChildOfRoot);
	
		this.viewExtend(definition);
	}

	
	/**
	 * @param {ComponentTemplate} definition 
	 */
	viewExtend(definition) {
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
	
	registerEvents() {
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
	 * @param {ComponentTemplate} definition 
	 */
	asyncViewExtend(definition) {
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
	 * @param {ComponentTemplate} definition 
	 */
	lateAddChildren(definition) {
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
	asyncRegister = function() {
		var asyncTask;
		for (let i = 0, l = this._asyncRegisterTasks.length; i < l; i++) {
			asyncTask = this._asyncRegisterTasks[i];
			if(asyncTask.type === 'lateBinding') {
				asyncTask.execute(this);
			}
		}
	}
	
	
	/**
	 * @param {ComponentTemplate} componentDefinition
	 * @param {ComponentTemplate} nodeDefinition
	 * @param {string} state
	 */
	addReactiveMemberViewFromFreshDef(componentDefinition, nodeDefinition, state) {
		var newDef = state ? this.extendDefToStatefull(componentDefinition, nodeDefinition, state) : nodeDefinition;
		
		var view;
		if (newDef.getHostDef().nodeName) {
			this.view.subViewsHolder.addMemberViewFromDef(newDef.getHostDef());
			// HACK: the renderer expects a view to cache its "attributes" prop
			// NOT WORKING?: caches items are inndexed on the defUID of the component
			// FINAL HYPOTHESIS: not needed...
	//		registries.caches['attributes'].setItem(newDef.getHostDef().UID, newDef.getHostDef()['attributes']);
		}
		
		if (newDef.members.length) {
			newDef.members.forEach(function(memberDef) {
				this.view.subViewsHolder.addMemberViewFromDef(memberDef);
				// HACK: the renderer expects a view to cache its "attributes" prop
				// NOT WORKING?: caches items are inndexed on the defUID of the component
				// FINAL HYPOTHESIS: not needed...
	//			registries.caches['attributes'].setItem(memberDef.UID, memberDef['attributes']);
			}, this);
		}
	}
	
	/**
	 * @param {ComponentTemplate} componentDefinition
	 * @param {ComponentTemplate} nodeDefinition
	 * @param {string} state
	 */
	unshiftReactiveMemberViewFromFreshDef(componentDefinition, nodeDefinition, state) {
		var newDef = state ? this.extendDefToStatefull(componentDefinition, nodeDefinition, state) : nodeDefinition;
		this.view.subViewsHolder.immediateUnshiftMemberView(newDef.getHostDef());
	}
	
	/**
	 * @param {ComponentTemplate} componentDefinition
	 * @param {ComponentTemplate} nodeDefinition
	 * @param {string} state
	 */
	extendDefToStatefull(componentDefinition, nodeDefinition, state) {
		// This is an illustrative method, a hint for others on the path to catching the "spirit" of the extension mechanism of the framework
		// 		=> This is to be implemented as a method on the ComponentWithView.prototype : addReactiveMemberViewFromFreshDef
		// Delete the UID of the definition and Register a renewed one with fresh UID (unless exists, so register both the original and the fresh one : if the original exists, we already went here)
		// Define a reactOnSelf on the definition of the HOST with a callback : it shall be bound to the host
		//		=> maintain a -counter- on the added pictos
		// 		=> the callback shall call the component -> the main view -> the subViewsHost -> the memberViews[ -counter- ].getMasterNode().hidden
		// Instanciate a view with the host's view as parent view (the view references the UID of the definition)
		// Add that view to the subViewsHost->memberViews of the main view
		
		var statefullExtendedDef;
		if (!(statefullExtendedDef = registries.hostsDefinitionsCacheRegistry.getItem(componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className')))) {
			// This also is tricky, as we keep all along the call stack that ComponentDef which should be a hostDef.
			// The only reason being that we discriminate the "grouped" append in the second test-case above as the one having "members" and "no nodeName on host"
			// TODO: THAT MUST CHANGE.
			statefullExtendedDef = TypeManager.createComponentDef(nodeDefinition);
			statefullExtendedDef.host.UID = componentDefinition.host.UID + nodeDefinition.host.attributes.getObjectValueByKey('className');
			
			registries.hostsDefinitionsCacheRegistry.setItem(statefullExtendedDef.host.UID, statefullExtendedDef);
			
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
	 * HOOKS
	 */
	basicEarlyViewExtend = function() {};					// virtual
	asyncViewExtend = function() {};						// virtual
	basicLateViewExtend = function() {};					// virtual
	lastAddChildren = function() {};						// virtual
	beforeRegisterEvents = function() {};			// virtual
	registerClickEvents = function() {};			// virtual
	registerLearnEvents = function() {};			// virtual
	registerKeyboardEvents = function() {};			// virtual
	afterRegisterEvents = function() {};			// virtual
//	registerValidators = function() {};				// virtual
	execBindingQueue = function() {};				// virtual
}


	







class ComponentWithReactiveText extends ComponentWithHooks {
	
	objectType = 'ComponentWithReactiveText';
	
	/**
	 * @constructor ComponentWithReactiveText
	 * @param {ComponentTemplate} definition
	 * @param {ComponentWithView} parentView
	 * @param {Boolean} isChildOfRoot 
	 */
	constructor(definition, parentView, isChildOfRoot) {
	//	console.log('ComponentWithReactiveText', parentView);
		ComponentWithHooks.call(this, definition, parentView, parent, isChildOfRoot);
	//	console.log('ComponentWithReactiveText', this.view);
		this.objectType = 'ComponentWithReactiveText';
		this.eachMemberContentCache = [];
		this.targetSubViewContentCache = [];
	}
	
	/**
	 * @param {Array<String>} values
	 */
	setContentFromArrayOnEachMemberView = function(values) {
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
	 * 
	 */
	setContentFromCacheOnTargetSubview() {
		if (!Array.isArray(this.targetSubViewContentCache) || !this.targetSubViewContentCache.length)
			return '';
		return this.view.setContentFromArrayOnTargetSubview(this.targetSubViewContentCache);
	}
}









class ComponentWith_FastReactiveText extends ComponentWithReactiveText {
	
	objectType = 'ComponentWith_FastReactiveText';
	
	/**
	 * @constructor ComponentWithReactiveText_Fast
	 */
	constructor(definition, parentView, isChildOfRoot) {
		super(definition, parentView, isChildOfRoot);
	}
	
	/**
	 * @param {Array<String>} values
	 */
	setContentFromArrayOnEachMemberView(values) {
		this.view.subViewsHolder.setEachMemberContent_Fast(values);
	}
}

















class ComponentStrokeAware extends ComponentWithHooks {
	
	objectType = 'ComponentStrokeAware';
	
	/**
	 * @constructor ComponentStrokeAware
	 */
	constructor(definition, parentView, parent, isChildOfRoot) {
		ComponentWithHooks.call(this, definition, parentView, parent, isChildOfRoot);
	//	this.objectType = 'ComponentStrokeAware';
	
	}
	
	createEvents() {
		this.createEvent('stroke');
	}
	
	/**
	 * 
	 */
	registerKeyboardEvents() {
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
}








class ComponentWithViewAbstractingAFeed extends ComponentWithHooks {
	
	objectType = 'ComponentWithViewAbstractingAFeed';
	
	/**
	 * @constructor ComponentWithViewAbstractingAFeed
	 */
	constructor(definition, parentView, isChildOfRoot) {
		super(definition, parentView, isChildOfRoot);
		this.createEvent('exportdata');
	}
	
	/**
	 * @param {EventPayload} data
	 */
	exportData(data) {
		this.trigger('exportdata', data);
	}
}










class CompositorComponent extends ComponentWithView {
	
	objectType = 'CompositorComponent';
	
	/**
	 * @constructor CompositorComponent
	 */
	constructor(definition, parentView) {//, argx, argy, arg...
		if (!this.Compositor)
			console.warn('Invalid inheritance through CompositorComponent: it seems you\'ve tried to extend a non-core component. Were you inheriting from an abstract type through the simple "extends" property ? (CompositorComponent is not needed then)')
		this.Compositor.constructor.apply(this, arguments);
	}

	
	//CompositorComponent.prototype.Compositor = function() {};				// virtual (decorated type property)
	
	acquireCompositor() {};		// virtual
	
	/**
	 * @param {ComponentWithView} inheritingType
	 * @param {ComponentWithView} inheritedType 
	 */
	extendFromCompositor(inheritingType, inheritedType) {
	//	console.log(inheritingType.prototype, inheritedType);
		var proto_proto = Object.create(inheritedType.prototype);
	//	console.log(Object.hasOwn(inheritingType.prototype, '_asyncRegisterTasks'));
		Object.assign(proto_proto, inheritingType.prototype);
		inheritingType.prototype = proto_proto;
	//	console.log(proto_proto, inheritingType.prototype);
	}
}

CompositorComponent.prototype.extendsCore = '';							// virtual
CompositorComponent.prototype.extends = '';								// virtual








module.exports = {
	ExtensibleObject,
	HierarchicalObject,
	ComponentWithObservables,
	RootComponent,
	ComponentWithView,
	ComponentWithHooks,
	ComponentWithReactiveText,
	ComponentWith_FastReactiveText,
	ComponentStrokeAware,
	ComponentWithViewAbstractingAFeed,
//	ComponentWithCanvas : ComponentWithCanvas
};