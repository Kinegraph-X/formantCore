/**
 * @module DOMViewStrategy
 */

import ViewStrategyInterface from '../view/ViewStrategyInterface.js';
import { HTMLCustomElement } from '../DOM/Factories.js';
 
/**
 * @typedef {import('../DOM/types.js').stdTagNameType} stdTagName
 * @typedef {import('../template/TemplateFactory').ViewTemplate} ViewTemplate
 */

/**
 * @template {string} tagName
 */
class DOMViewStrategy {		/* implements ViewStrategyInterface */
	/** @type {string} */
	static objectType = 'DOMViewAPI';
	/** @type {boolean} @default false*/
	#isShadowHost = false;
	/** @type {stdTagName|tagName}*/
	#nodeName;
	/** @type {HTMLElementTagNameMap[stdTagName]|HTMLCustomElement<tagName>|null} @default null */
	#masterNode = null;
	/** @type {ShadowRoot|null} @default null */
	#wrappingNode = null;
	/** @type {'inline'|'block'|'flex'|'none'} */
	#presenceAsAProp = 'flex';
	/**
	 * @param {ViewTemplate} def
	 */
	constructor(def) {
		this.#isShadowHost = def.isCustomElem;
		this.#nodeName = /** @type {stdTagName|tagName}*/ (def.nodeName);
	}
	/**
	 * @param {boolean} bool
	 */
	setPresence(bool) {
		this.masterNode.style.display = bool ? this.#presenceAsAProp : 'none';
	}
	/**
	 * @param {string} eventName
	 * @param {(e: Event) => void} handler
	 */
	addEventListener(eventName, handler) {
		this.masterNode.addEventListener(eventName, handler);
	}

	get nodeName() {
		return this.#nodeName;
	}
	
	
	/** @returns {HTMLElementTagNameMap[stdTagName]} */
	get HTMLElementMasterNode() {
		return /** @type {HTMLElementTagNameMap[stdTagName]} */ (this.#masterNode);
	}
	/** @returns {HTMLCustomElement<tagName>} */
	get customElementMasterNode() {
		return /** @type {HTMLCustomElement<tagName>} */ (this.#masterNode);
	}
	
	get masterNode() {
		if (!this.isShadowHost) {
			return this.HTMLElementMasterNode;
		}
		else {
			return this.customElementMasterNode;
		}
	}
	/**
	 * @param {HTMLElement} node
	 */
	set masterNode(node) {
		this.#masterNode = node;
		this.#wrappingNode = node.shadowRoot;
	}
	/**
	 * @return {HTMLElement|HTMLCustomElement<tagName>|ShadowRoot}
	 */
	get wrappingNode() {
		// masterNode shall be acquired later
		return this.#wrappingNode || /**@type {HTMLElement|HTMLCustomElement<tagName>}*/ (this.#masterNode);
	}

	/**
	 * @returns {boolean}
	 */
	isShadowHost() {
		return this.#isShadowHost;
	}
	
	/**
	 * @return {boolean}
	 */
	#isTextInput() {
		return this.#nodeName.toUpperCase() === 'INPUT' || this.#nodeName.toUpperCase() === 'TEXTAREA';
	}
	
	 /**
	  * @return {string}
	  */
	 getTextInputValue() {
		if (!this.#isTextInput())
			throw new Error('Cannot call getTextInputValue on a non input node');
	 	/** @ts-ignore tested above */
		return this.masterNode.value;
	 }
	
	/**
	 * @param {number} atIndex
	 * @returns {Element|false}
	 */
	getChildNodeAtIndex(atIndex) {
		if (this.masterNode.children[atIndex - 1]) {
			return this.masterNode.children[atIndex - 1];
		}
		else {
			return false;
		}
	}
	
	/**
	 * @return {string}
	 */
	getTextContent() {
		// It may seem weird to return all the texts ignoring the real HTMLElements
		// Let'st try this for now...
		var realTextContent = '';
		this.wrappingNode.childNodes.forEach(function(elem) {
			if (elem instanceof Text)
				realTextContent += elem.wholeText;
		});
		return realTextContent;
	}
	
	 /**
	  * @param {string} value
	  */
	 setContent(value) {
	 	if (this.#isTextInput())
			/** @ts-ignore tested above */
	 		this.masterNode.value = value;
	 	else
	 		this.setNodeContent(value);
	 }
	
	 /**
	  * @return {string}
	  */
	 getContent() {
	 	if (this.#isTextInput())
			/** @ts-ignore tested above */
	 		return this.masterNode.value;
	 	else
	 		return this.getTextContent(); 
	 }
	
	/**
	 * @param {string} text
	 */
	setTextContent(text) {
		this.wrappingNode.textContent = text;
	}
	
	/**
	 * @param {string} contentAsString
	 */
	setNodeContent(contentAsString) {
		this.wrappingNode.innerHTML = contentAsString;
	}
	
	/**
	 * @param {string} text
	 */
	appendTextNode(text) {
		var elem = document.createTextNode(text);
		this.wrappingNode.appendChild(elem);
	}
	
	/**
	 * @param {HTMLElement} childNode
	 * @param {number} atIndex
	 */
	addChildNodeAt(childNode, atIndex) {
		var lowerIndexChild;
		if ((lowerIndexChild = this.getChildNodeAtIndex(atIndex)))
			lowerIndexChild.insertAdjacentElement('afterend', childNode);
		else
			this.wrappingNode.appendChild(childNode);
	}
	
	empty() {
		this.wrappingNode.innerHTML = '';
	}
	
	//  /**
	//   * @param {string[]} contentAsArray
	//   */
	//  getMultilineContent(contentAsArray) {
	//  	return this.getFragmentFromContent(contentAsArray, this.templateNodeName);
	//  }
	
	//  /**
	//   * @param {string[]} contentAsArray
	//   * @param {string} templateNodeName
	//   */
	//  getFragmentFromContent(contentAsArray, templateNodeName) {
	//  	const fragment = document.createDocumentFragment();
	//  	contentAsArray.forEach(
	//  		/** @param {HTMLElement|string} val */
	//  		function(val) {
	//  			const elem = document.createElement(templateNodeName);
	//  			// elem.id = 'targetSubViewElem-' + UIDGenerator.newUID();
	//  			if (val instanceof HTMLElement) {
	//  				elem.appendChild(val);
	//  				fragment.appendChild(elem);
	//  				return;
	//  			}
				
	//  			elem.innerHTML = val;
	//  			fragment.appendChild(elem);
	//  		}
	//  	);
	//  	return fragment;
	//  }

	// /** @param {string[]} contentAsArray*/
	// setContentFromArray(contentAsArray) {
	//  	this.empty();
	//  	this.wrappingNode.appendChild(this.getMultilineContent(contentAsArray));
	// }
	
	/** @param {string} color */
	updateBGColor(color) {
		this.masterNode.style.backgroundColor = color;
	}
	
	/**
	 * These methods are implemented as a reminder and a potentially needed fallback,
	 * but in most cases of hiding/showing, we should prefer the reactive states-based mechanism:
	 * states : [{hidden : 'hidden'}} will be automagically reflected on the DOM node
	 */
	hide() {
		this.masterNode.hidden = true;	
	}
	
	show() {
		this.masterNode.hidden = false;	
	}
}

export default DOMViewStrategy;