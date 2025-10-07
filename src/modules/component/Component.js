/**
 * @module Component
 */

import {Output} from '../decorators.js'
import {ComponentError } from '../error/Error.js';
import registries from '../Registries.js';
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
import { ComponentView, RootComponentView } from '../view/ComponentView.js';





/** 
 * @typedef {import('../DOM/types').stdTagNameType} stdTagName
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
	/** @type {ComponentWithView[]} */
	children = [];
	/** @type {RootComponent|ComponentWithView} */
	parent;
	// /** @type {string|null} */
	// _templateUID = '';
	// /** @type {string} */
	// _defaultTemplateUID = '';
	/** @type {string} */
	regUID = '';

	/** @type {ComponentView<stdTagName|string>} */
	#view;
	get view() {
		return this.#view;
	}
	/** @param {ComponentView<stdTagName|string>} view */
	set view(view) {
		throw new Error('The View of a Component can\'t be overriden');
	}

	/**
	 * @param {BaseComponentWithView} parent
	 * @param {ComponentTemplate} cTemplate
	 * @param {ComponentView<stdTagName|string>} view
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
	}

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
	/** @type {RootComponentView} */	
	#view;
	get view() {
		return this.#view;
	}
	/** @param {RootComponentView} view */
	set view(view) {
		throw new Error('The View of a Component can\'t be overriden');
	}
	constructor() {
		super();
		this.#view = new RootComponentView();
	}
}





class ComponentWithView extends BaseComponentWithView {
	/** @type {string} */
	static objectType = 'ComponentWithView';
	/** @type {ComponentView<stdTagName|string>[]} */	
	subViews = [];
	/** @type {ComponentView<stdTagName|string>[]} */	
	memberViews = [];

	/** 
	 * We chose to mimic the behavior of the Angular compiler
	 * which reflects @output annotations to the @component object
	 * @see below
	 * @see rollup-plugin-formant-annotations
	*/
	/** @type {string[]} */
	static _outputs = [];

	/**
	 * @param {typeof ComponentWithView} type
	 * @param {string} outputName
	 */
	static declareOutput = (type, outputName) => {
		if (!type.hasOwnProperty('_outputs'))
			type._outputs = [];
		type._outputs.push(outputName);
		return true;
	}

	/**
	 * @param {BaseComponentWithView} parent
	 * @param {ComponentTemplate} cTemplate
	 * @param {ComponentView<stdTagName|string>} view
	 */
	constructor(parent, cTemplate, view) {
		super(parent, cTemplate, view);
		
		// EventEmitters don't have a propoer "emit()" function when defining them
		// (EventEmitter has the ability to bind on DOM events, and the handler gets refs to "regUID" and "key")
		// Define here the correct emit function
		const ctor = /** @type {unknown} */(this.constructor);
		/** @type {typeof ComponentWithView} */(ctor)._outputs.forEach(
			(/**@type{string}*/output) => {
				const prop = /** @type {keyof this} */ (output);
				const emitter = this[prop];
				if (!(emitter instanceof EventEmitter))
					throw new ComponentError(this, 'An output declared on a component isn\'t an EventEmitter. output is', output);
				
				emitter.emit = EventEmitter.getTriggerFunction(this, emitter);
		})
		
		this.regUID = cTemplate.UID;
	}

	/*
	 * @example:
	 * 	@ Output() output = new EventEmitter<EventPayload>('eventName');
	 * 	will be transformed at build time to
	 * 	`output = ComponentWithView.declareOutput(${typeName}, ${outputName)} && new EventEmitter<EventPayload>();`
	 */
	@Output() update = new EventEmitter('update');
	

	/**
	 * @param {ComponentWithView} child
	 */
	removeChild(child) {
		if (child.subViews.length) {
			child.subViews.forEach(
				function(subView, key) {
					while (subView.node.lastChild) {
						subView.node.removeChild(subView.node.lastChild);
					}
				}
			);
		}
		child.children.forEach(function(childOfChild, key) {
			childOfChild.view.node.remove();
		});

		if (child.memberViews.length) {
			child.memberViews.forEach(function(member, key) {
				member.node.remove();
			});
		}
		child.view.node.remove();
		
		const streams = registries.streams.get(child.regUID);
		if (streams) {
			for(const streamName in streams) {
				const stream = streams.get(streamName);
				/** @debug-build start */
				if (!stream)
					throw new ComponentError(child, 'Reflection');
				/** @debug-build end */
				stream.subscriptions.forEach((sub) => {
					sub.unsubscribe();
				});
			}
		}
	}
	
}








export {
	HierarchicalObject,
	RootComponent,
	ComponentWithView,
};