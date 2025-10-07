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
import { compUIDGenerator } from '../UIDGenerator.js';

import { FrameworkEvent, EventEmitter } from '../reactivity/EventEmitter.js';
import Stream from '../reactivity/Stream.js';
import { ComponentView, RootComponentView } from '../view/ComponentView.js';
import viewRef from '../view/viewRef.js';

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
		this._UID = compUIDGenerator.newUID();
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

	getSelfDepth() {
		let depth = 0, currentParent = this.parent;
		while (currentParent) {
			currentParent = /** @type {HierarchicalObject} */ (currentParent).parent;
			depth++;
		}
		return depth;
	}
}


		



class AsyncActivableObject extends HierarchicalObject {
	/** @type {string} */
	static objectType = 'AsyncActivableObject';
	/** @type {TaskDefinition[]} */
	_asyncInitTasks = [];
	/** @type {TaskDefinition[]} */
	_asyncRegisterTasks = [];
	
	/**
	 * @param {HierarchicalObject} parent
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









class BaseComponentWithView extends AsyncActivableObject {
	/** @type {string} */
	static objectType = 'BaseComponentWithView';
	/** @type {string|null} */
	_templateUID = '';
	/** @type {string} */
	_defaultTemplateUID = '';
	/** @type {string} */
	regUID = '';

	/**
	 * @virtual
	 * @returns {ComponentTemplate}
	 */
	static createDefaultDef() {return new ComponentTemplate(null);}
}

/** @template {string} tagName */
class RootComponent extends RootHierarchicalObject {
	/** @type {string} */
	static objectType = 'RootComponent';
	/** @type {string} */
	regUID = '';
	/** @type {RootComponentView<tagName>} */	
	#view;
	constructor() {
		super();
		this.#view = new RootComponentView();
	}
}


/** @template {string} tagName */
class ComponentWithView extends BaseComponentWithView {
	/** @type {string} */
	static objectType = 'ComponentWithView';
	/** @type {ComponentWithView<tagName>[]} */
	children = [];
	/** @type {RootComponent<tagName>|ComponentWithView<tagName>} */
	parent;
	/** @type {ComponentView<tagName>[]} */	
	subViews = [];
	/** @type {ComponentView<tagName>[]} */	
	memberViews = [];
	/** @type {ComponentView<tagName>} */
	#view;
	
	get view() {
		return this.#view;
	}
	/** @param {ComponentView<tagName>} view */
	set view(view) {
		throw new Error('The View of a Component can\'t be overriden');
	}

	/** 
	 * We chose to mimic the behavior of the Angular compiler
	 * which reflects @output annotations to the @component object
	 * @see below
	 * @see rollup-plugin-formant-annotations
	*/
	/** @type {string[]} */
	static _outputs = [];
	/**
	 * @param {typeof ComponentWithView<string>} type
	 * @param {string} outputName
	 */
	static declareOutput = (type, outputName) => {
		if (!type.hasOwnProperty('outputs'))
			type._outputs = [];
		type._outputs.push(outputName);
		return true;
	}
	/*
	 * @example:
	 * 	@ output() output = new EventEmitter<EventPayload>('eventName');
	 * 	will be transformed at build time to
	 * 	`output = ComponentWithView.declareOutput(${typeName}, ${outputName)} && new EventEmitter<EventPayload>();`
	 */
	@output() update = new EventEmitter<unknown>('update');

	/**
	 * @param {BaseComponentWithView} parent
	 * @param {ComponentTemplate} cTemplate
	 * @param {ComponentView<tagName>} view
	 */
	constructor(parent, cTemplate, view) {
		super(parent);
		
		if (!(parent instanceof ComponentWithView) || !parent.parent)  {
			throw new ComponentError(
				this,
				'constructor: parent isn\'t instance of ComponentWithView or the component has no declared parent.',
				parent
			);
		}
		this.parent = parent;
		this.parent.pushChild(this);
		this.#view = view;
		
		// EventEmitters don't have a propoer "emit()" function when defining them
		// (EventEmitter has the ability to bind on DOM events, and the handler gets refs to "regUID" and "key")
		// Define here the correct emit function
		const thisArg = /** @type {unknown} */(this);
		/** @type {typeof ComponentWithView} */(thisArg)._outputs.forEach(
			(/**@type{string}*/output) => {
				const prop = /** @type {keyof this} */ (output);
				const emitter = this[prop];
				if (!(emitter instanceof EventEmitter))
					throw new ComponentError(this, 'An output declared in the template has no corresponding EventEmitter. output is', output);
				
				emitter.emit = EventEmitter.getTriggerFunction(this, emitter);
		})
		
		this.regUID = cTemplate.UID;
	}
	

	/**
	 * @param {ComponentWithView<tagName>} child
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
		// TODO: the ComponentWithView should neither handle streams, nor subscriptions 
		// child._subscriptions.forEach(function(subscription) {
		// 	subscription.unsubscribe();
		// });
	}
	
	/**
	 * @param {ComponentWithView<tagName>} child
	 * @param {number} atIndex
	 */
	addChildAt(child, atIndex) {
		HierarchicalObject.prototype.addChildAt.call(this, child, atIndex);
		child.parent.view.addChildAt(child.view, atIndex);
	}
}








export {
	HierarchicalObject,
	RootComponent,
	ComponentWithView,
};