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
import registries from '../Registries.js';
import {RootHierarchicalObject, HierarchicalObject} from './HierarchicalObject.js';
import { ComponentView, RootComponentView } from '../view/ComponentView.js';
// import {AsyncActivableObject} from './AsyncActivableObject';

/** 
 * @typedef {import('../DOM/types.js').stdTagNameType} stdTagName
*/





export class BaseComponentWithView extends HierarchicalObject {
	/** @type {string} */
	static objectType = 'BaseComponentWithView';
	/** @type {BaseComponentWithView[]} */
	children = [];
	/** @type {RootComponent|ComponentWithView} */
	parent;
	// /** @type {string|null} */
	// _templateUID = '';
	// /** @type {string} */
	// _defaultTemplateUID = '';
	/** @type {string} */
	regUID;

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
		
		if (!(parent instanceof ComponentWithView || parent instanceof RootComponent) || !parent)  {
			throw new ComponentError(
				this,
				`constructor: parent isn't instance of Component or the component has not been passed a parent. regUID is ${cTemplate.UID}`,
				parent
			);
		}
		this.regUID = cTemplate.UID;
		this.parent = parent;
		this.parent.pushChild(this);
		this.#view = view;
	}

	/**
	 * @virtual  the TemplateReconcilier shall provide a template by default
	 * @returns {ComponentTemplate}
	 */
	static createDefaultDef() {return new ComponentTemplate(null);}
}

export class RootComponent extends RootHierarchicalObject {
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





export class ComponentWithView extends BaseComponentWithView {
	/** @type {string} */
	static objectType = 'Component';
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
	}

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

