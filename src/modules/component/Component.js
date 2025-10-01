/**
 * @module Component
 */


import {ComponentError } from '../error/Error.js';
import {
    ReactOnSelf,
    ReactOnParent,
    ReactivityQueryArray,
    EventSubscriptionArray,
    SubscribeOnChild,
    SubscribeOnSelf,
    TaskDefinition,
    ComponentTemplate,
    ViewTemplate,
} from '../template/TemplateFactory.js';
import { UIDGenerator } from '../UIDGenerator.js';

import { FrameworkEvent, EventEmitter } from '../reactivity/EventEmitter.js';
import Stream from '../reactivity/Stream.js';
import { ComponentView, ComponentRootView as RootComponentView } from '../view/ComponentView.js';
import viewRef from '../view/viewRef.js';
import TemplateReconcilier from './TemplateReconcilier.js';
// import ViewFactory from '../view/ViewFactory.js';
// import registries from '../Registries.js';




/** 
 * @typedef {{child: HierarchicalObject | null}} ComponentTransportObject
 * @typedef {{childKey: Number | null}} ComponentPathObject
 * @typedef {{name: String | null, children : Array<ComponentPathTreeObject>}} ComponentPathTreeObject
 * @typedef {{String : Array<ComponentPathKeyValueObject>}} ComponentPathKeyValueObject
*/


class BaseHierarchicalObject {
	/** @type {string} */
	static objectType = 'HierarchicalObject';
	/** @type {string} */
	_UID;
	/** @type {Number} */
	key = 0;
	/** @type {HierarchicalObject[]} */
	children = [];

	constructor() {
		this._UID = UIDGenerator.newUID();
	}

	/**
	 * 
	 * @returns {string}
	 */
	getType() {
		const ctor = /** @type {unknown} */ (this.constructor)
		return  /** @type {{objectType : string}} */ (ctor).objectType;
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
	/** @type {InstanceType<ComponentView>|InstanceType<RootComponentView>} RootComponentView is a fallback for this to be always non-null */		// parsing bug, seemingly
	viewRef = viewRef.create();
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
		this.update = new EventEmitter('update');
		
		const {template,
				cTemplateUID,
				defaultTemplateUID
			} = TemplateReconcilier.reconcile(
					/** @type {typeof ComponentWithView} */ (this.constructor).createDefaultDef,
					cTemplate,
					Object.getPrototypeOf(this).objectType
				);

		template.outputs.forEach(
			(output) => {
				const prop = /** @type {keyof this} */ (output);
				const emitter = this[prop];
				if (!(emitter instanceof EventEmitter))
					throw new ComponentError(this, 'An output declared in the template has no corresponding EventEmitter. output is', output);
				
				emitter.trigger = EventEmitter.getTriggerFunction(this, emitter);
		})
		
		// Debug props: the TemplateReconcilier registers the default template (reconciliated if needed)
		// We keep track of what's been passed.
		this._templateUID = cTemplateUID;	// may be null
		this._defaultTemplateUID = this.regUID = defaultTemplateUID;
	}



	/**
	 * @param {ComponentWithView} child
	 */
	removeChild(child) {
		if (child.subViews.length) {
			child.subViews.forEach(
				function(subView, key) {
				while (subView.node.firstChild) {
					subView.node.removeChild(subView.node.lastChild);
				}
			}, child);
		}
		child.children.forEach(function(childOfChild, key) {
			childOfChild.view.node.remove();
		}, child);
		if (child.memberViews.length) {
			child.memberViews.forEach(function(member, key) {
				member.node.remove();
			}, child);
		}
		child.view.node.remove();
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
	
	// /**
	//  * @param {number} y
	//  */
	// getViewOfChildBasedOnYpos(y) {
	// 	var self = this;
	// 	this.styleHook.getBoundingBox().then(function(boundingBox) {
	// 		self.children.forEach(function(child) {
	// 			// boundingBox.offsetX, y, boundingBox.offsetX, boundingBox.offsetY + boundingBox.h
	// //			Geometry.ComponentHitTest(child._key > 1 ? this._children[child._key - 1] : null, child, this._children[child._key + 1]);
	// 		}, self);
	// 	});
	// }
	
	/**
	 * @param {number} targetIdx
	 */
	childButtonsHighlightLoop(targetIdx) {
		if (this.children.length === 1)
			this.children[0].streams.highlighted.next = null;
		else {
			this.children.forEach(function(child) {
				if (child.key === targetIdx)
					child.streams.highlighted.next = 'highlighted';
				else
					child.streams.highlighted.next = null;
			});
		}
	}
	
	// /**
	//  * @param {number} targetIdx
	//  * @param {'asc'|'desc'} order
	//  */
	// childButtonsSortedLoop = function(targetIdx, order) {
	// 	this._children.forEach(function(child) {
	// 		if (child._key === targetIdx) {
	// 			child.streams['sorted' + order].value = 'sorted';
	// 			child.streams['sorted' + (order === 'asc' ? 'desc' : 'asc')].value = null;
	// 		}
	// 		else {
	// 			child.streams.sortedasc.value = null;
	// 			child.streams.sorteddesc.value = null;
	// 		}
	// 	});
	// }
}














module.exports = {
	ExtensibleObject,
	HierarchicalObject,
	ComponentWithObservables,
	RootComponent,
	ComponentWithView,
};