/**
 * @module ComponentView
 */
import {currentViewStrategy} from '../config.js';
import {ComponentError } from '../error/Error.js';
import { viewStrategyTrap } from '../proxies/proxyTraps.js';
import createRootComponentTemplate from '../templates/rootComponentTemplate.js';

import {type ViewTemplate} from '../template/TemplateFactory';
import { type ComponentBase as Component} from '../component/Component';
import type ViewStrategyInterface from './ViewStrategyInterface';
import {type HTMLCustomElement} from '../DOM/Factories';
/**
 * @typedef {import('../template/TemplateFactory').ViewTemplate} ViewTemplate
 * @typedef {import('../component/Component.js').ComponentBase} Component
 * @typedef {import('./ViewStrategyInterface').default} ViewStrategyInterface
 */

/**
 * @typedef {import('../DOM/Factories').HTMLCustomElement} HTMLCustomElement
 */

class BaseComponentView {	/* implements ViewStrategyInterface */
	/** @type {string} */
	static objectType = 'BaseComponentView';
	/** @type {string} */
	viewUID : string;
	/** @type {string} set by the ViewFactory */
	regUID = '';
	/** @type {boolean} */
	isCustomElem = false;
	// /** @type {number|null} */
	// section = null;
	// /** @type {StyleHook} // TODO: styleHook.s refers to the AbstractStylesheet => change that, it's not at all explicit*/
	/** @type {{ [key: string]: string }[] | null} */
	sOverride : { [key: string]: string }[] | null;
	/** @type {ViewStrategyInterface} */
	#currentViewStrategy : ViewStrategyInterface;
	/**
	 * @param {ViewTemplate} vTemplate
	 */
	constructor(vTemplate : ViewTemplate) {
		this.viewUID = vTemplate.UID;
		this.isCustomElem = vTemplate.isCustomElem;
		// this.section = vTemplate.section;
		this.sOverride = vTemplate.sOverride;

		let nodeName /** @type {tagName}*/ = vTemplate.nodeName;

		if (process.env.NODE_ENV === 'development') {
			this.#currentViewStrategy = new Proxy(
				new currentViewStrategy(vTemplate),
				{
					get : viewStrategyTrap.get.bind(null, this.regUID, 'viewStrategy'),
					set : viewStrategyTrap.set
				}
			);
		}
		else {
			this.#currentViewStrategy = new currentViewStrategy(vTemplate);
		}
		
		// this.styleHook = new SWrapperInViewManipulator(this);
	}
	
	get nodeName() {
		return this.#currentViewStrategy.nodeName;
	}
	
	/**
	 * Shorthand method on the currentViewAPI
	 * 
	 * ⚠️ Direct DOM access is an escape hatch.
	 * Prefer using states, props, and reactivity queries.
	 * Type safety is not guaranteed - cast at your own risk.
	 * 
	 * @example
	 * // If you must access the node:
	 * const button = this.view.node as HTMLButtonElement;
	 * button.disabled = true;
	 */
	get node() {
		return this.#currentViewStrategy.masterNode;
	}
	/**
	 * Shorthand method on the currentViewAPI
	 * @param {HTMLElementTagNameMap[stdTagName]|HTMLCustomElement} node
	 */
	set node(node) {
		this.#currentViewStrategy.masterNode = node;
	}
	/**
	 * Shorthand method on the currentViewAPI
	 */
	get wrappingNode() {
		return this.#currentViewStrategy.wrappingNode;
	}

	isShadowHost() {
		return this.#currentViewStrategy.isShadowHost();
	}
	
	/**
	 * @param {boolean} bool
	 */
	setPresence(bool : boolean) {
		return this.#currentViewStrategy.setPresence(bool);
	}
	/**
	 * @param {string} eventName
	 * @param {(e: any) => void} handler
	 */
	addEventListener(
		eventName : string,
		handler : (e: any) => void
	) {
		return this.#currentViewStrategy.addEventListener(eventName, handler);
	}
	
	/**
	  * @return {string}
	 */
	getTextInputValue() {
		return this.#currentViewStrategy.getTextInputValue();
	}
	
	/**
	 * @param {number} atIndex
	 * @returns {any|false}
	 */
	getChildNodeAtIndex(atIndex : number) {
		return this.#currentViewStrategy.getChildNodeAtIndex(atIndex);
	}
	
	/**
	 * @return {string}
	 */
	getTextContent() {
		return this.#currentViewStrategy.getTextContent();
	}
	
	 /**
	  * @param {string} value
	  */
	 setContent(value : string) {
		return this.#currentViewStrategy.setContent(value);
	 }
	
	 /**
	  * @return {string}
	  */
	 getContent() {
		return this.#currentViewStrategy.getContent();
	 }
	
	/**
	 * @param {string} text
	 */
	setTextContent(text : string) {
		return this.#currentViewStrategy.getContent();
	}
	
	/**
	 * @param {string} contentAsString
	 */
	setNodeContent(contentAsString : string) {
		return this.#currentViewStrategy.setNodeContent(contentAsString);
	}
	
	/**
	 * @param {string} text
	 */
	appendTextNode(text : string) {
		return this.#currentViewStrategy.appendTextNode(text);
	}
	
	/**
	 * @param {HTMLElement} childNode
	 * @param {number} atIndex
	 */
	addChildNodeAt(
		childNode : HTMLElement | HTMLCustomElement,
		atIndex : number
	) {
		return this.#currentViewStrategy.addChildNodeAt(childNode, atIndex);
	}
	
	empty() {
		return this.#currentViewStrategy.empty();
	}
	
	 /**
	  * @param {string[]} contentAsArray
	  */
	 getMultilineContent(contentAsArray : string[]) {
		return this.#currentViewStrategy.getMultilineContent(contentAsArray);
	 }
	
	 /**
	  * @param {string[]} contentAsArray
	  * @param {string} templateNodeName
	  * @returns {HTMLFragmentElement}
	  */
	 getFragmentFromContent(
		contentAsArray : string[],
		templateNodeName : string
	) : DocumentFragment {
		return this.#currentViewStrategy.getFragmentFromContent(contentAsArray, templateNodeName) as unknown as DocumentFragment;
	 }
	 
	 /** 
	  * @param {string[]} contentAsArray
	  * 
	  */
	 setContentFromArray(contentAsArray : string[]) {
	 	return this.#currentViewStrategy.setContentFromArray(contentAsArray);
	 }
	
	/** @param {string} color */
	updateBGColor(color : string) {
		return this.#currentViewStrategy.updateBGColor(color);
	}
	
	/**
	 * These methods are implemented as a reminder and a potentially needed fallback,
	 * but in most cases of hiding/showing, we should prefer the reactive states-based mechanism:
	 * states : [{hidden : 'hidden'}} will be automagically reflected on the DOM node
	 */
	hide() {
		return this.#currentViewStrategy.hide();
	}
	
	show() {
		return this.#currentViewStrategy.show();
	}
}

/**
 * @extends BaseComponentView
 */
export class RootComponentView extends BaseComponentView {
	/** @type {string} */
	static readonly objectType = 'RootComponentView';
	
	/**
	 * @param {ViewTemplate} vTemplate
	 */
	constructor(vTemplate = createRootComponentTemplate().view) {
		super(vTemplate);
		this.regUID = '0';
	}
}


/**
 * @extends BaseComponentView
 */
export class ComponentView extends BaseComponentView {
	/** @type {string} */
	static readonly objectType = 'ComponentView';
	/** @type {string} */
	_templateUID : string;
	/** @type {Component} */
	_parentComponent : Component;
	/** @type {ComponentView|RootComponentView} */
	parentView : ComponentView|RootComponentView;

	/**
	 * @param {ViewTemplate} vTemplate
	 * @param {ComponentView|RootComponentView} parentView
	 * @param {string} parentUID UID of the parent component's template (which indexes the component in the registry)
	 */
	constructor(
		vTemplate : ViewTemplate,
		parentView : ComponentView|RootComponentView,
		parentUID : string
	) {
		super(vTemplate);
		this._templateUID = this.regUID = parentUID;
		
		if (!(parentView instanceof ComponentView)) {
			throw new ComponentError(this, 'no parentView given to a componentView : nodeName is', vTemplate);
		}
			
		this._parentComponent = parentView._parentComponent;
		this.parentView = parentView;
	}
}




