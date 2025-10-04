/**
 * @module ComponentView
 */
import {currentViewStrategy} from '../config.js';

import {ComponentError } from '../error/Error.js';

import { viewStrategyTrap } from '../proxies/proxyTraps.js';
import createRootComponentTemplate from '../templates/rootComponentTemplate.js';

/**
 * @typedef {import('../template/TemplateFactory').ViewTemplate} ViewTemplate
 * @typedef {import('../component/Component').ComponentWithView} ComponentWithView
 * @typedef {import('./stdTagNameType').stdTagNameType} stdTagName
 * 
 * @typedef {import('./ViewStrategyInterface')} ViewStrategyInterface
 */

/**
 * @typedef {import('../DOM/Factories').HTMLCustomElement<string>} HTMLCustomElement
 */
/**
 * @template {stdTagName|string} tagName
 */
class BaseComponentView {	/* implements ViewStrategyInterface */
	/** @type {string} */
	static objectType = 'BaseComponentView';
	/** @type {string} */
	viewUID;
	/** @type {string} set by the ViewFactory */
	regUID = '';
	/** @type {boolean} */
	isCustomElem = false;
	/** @type {number|null} */
	section = null;
	/** @type {string} */
	_sWrapperUID = '';
	// /** @type {StyleHook} // TODO: styleHook.s refers to the AbstractStylesheet => change that, it's not at all explicit*/
	/** @type {{ [key: string]: string; }[] | null} */
	sOverride;
	/** @type {ViewStrategyInterface} */
	#currentViewStrategy;
	/**
	 * @param {ViewTemplate} vTemplate
	 */
	constructor(vTemplate) {
		this.viewUID = vTemplate.UID;
		this.isCustomElem = vTemplate.isCustomElem;
		this.section = vTemplate.section;
		this.sOverride = vTemplate.sOverride;

		let nodeName /** @type {tagName}*/ = vTemplate.nodeName;

		/* @debug-build start */
		this.#currentViewStrategy = new Proxy(
			new currentViewStrategy(vTemplate),
			{
				get : viewStrategyTrap.get.bind(null, this.regUID, 'viewStrategy'),
				set : viewStrategyTrap.set
			}
		);
		/* @debug-build end */
		
		/* @production-build start 
		this.#currentViewStrategy = new currentViewStrategy(vTemplate);
		@production-build end */
		
		// this.styleHook = new SWrapperInViewManipulator(this);
	}
	
	
	/**
	 * Shorthand method on the currentViewAPI
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
	
	/**
	 * @param {boolean} bool
	 */
	setPresence(bool) {
		return this.#currentViewStrategy.setPresence(bool);
	}
	/**
	 * @param {string} eventName
	 * @param {(e: any) => void} handler
	 */
	addEventListener(eventName, handler) {
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
	getChildNodeAtIndex(atIndex) {
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
	 setContent(value) {
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
	setTextContent(text) {
		return this.#currentViewStrategy.getContent(text);
	}
	
	/**
	 * @param {string} contentAsString
	 */
	setNodeContent(contentAsString) {
		return this.#currentViewStrategy.setNodeContent(contentAsString);
	}
	
	/**
	 * @param {string} text
	 */
	appendTextNode(text) {
		return this.#currentViewStrategy.appendTextNode(text);
	}
	
	/**
	 * @param {HTMLElement} childNode
	 * @param {number} atIndex
	 */
	addChildNodeAt(childNode, atIndex) {
		return this.#currentViewStrategy.addChildNodeAt(childNode, atIndex);
	}
	
	empty() {
		return this.#currentViewStrategy.empty();
	}
	
	 /**
	  * @param {string[]} contentAsArray
	  */
	 getMultilineContent(contentAsArray) {
		return this.#currentViewStrategy.getMultilineContent(contentAsArray);
	 }
	
	 /**
	  * @param {string[]} contentAsArray
	  * @param {string} templateNodeName
	  */
	 getFragmentFromContent(contentAsArray, templateNodeName) {
		return this.#currentViewStrategy.getFragmentFromContent(contentAsArray, templateNodeName);
	 }
	 
	 /** @param {string[]} contentAsArray*/
	 setContentFromArray(contentAsArray) {
	 	return this.#currentViewStrategy.setContentFromArray(contentAsArray);
	 }
	
	/** @param {string} color */
	updateBGColor(color) {
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
 * @template {stdTagName|string} tagName
 * @extends BaseComponentView<tagName>
 */
class RootComponentView extends BaseComponentView {
	/** @type {string} */
	static objectType = 'RootComponentView';
	;
	/**
	 * @param {ViewTemplate} vTemplate
	 */
	constructor(vTemplate = createRootComponentTemplate().view) {
		super(vTemplate);
		this.regUID = '0';
	}
}


/**
 * @template {stdTagName|string} tagName
 * @extends BaseComponentView<tagName>
 */
class ComponentView extends BaseComponentView {
	/** @type {string} */
	static objectType = 'ComponentView';
	/** @type {string} */
	_templateUID;
	/** @type {ComponentWithView} */
	_parentComponent;
	/** @type {ComponentView<tagName>|RootComponentView<tagName>} */
	parentView;
	/**
	 * @param {ViewTemplate} vTemplate
	 * @param {ComponentView<tagName>|RootComponentView<tagName>} parentView
	 * @param {string} parentUID
	 */
	constructor(vTemplate, parentView, parentUID) {
		super(vTemplate);
		this._templateUID = this.regUID = parentUID;
		
		if (!(parentView instanceof ComponentView)) {
			throw new ComponentError(this, 'no parentView given to a componentView : nodeName is', vTemplate);
		}
			
		this._parentComponent = parentView._parentComponent;
		this.parentView = parentView;
		
	}
}








/**
 * @template {keyof HTMLElementTagNameMap} tagName 
 * @extends ComponentView<tagName>
 */
class ComponentSubView extends ComponentView {
	/** @type {string} */
	static objectType = 'ComponentSubView';
}


export {
	RootComponentView,
	ComponentView
}