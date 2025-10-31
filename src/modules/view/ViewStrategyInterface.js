/**
 * @module ViewStrategyInterface
 */


class ViewStrategyInterface {
	/** @type {string} */
	static objectType = 'ViewStrategyInterface';
	/** @type {string}*/
	#nodeName;
	/** @type {any} @default null */
	#masterNode = null;
	/** @type {any} @default null */
	#wrappingNode = null;
	/**
	 * @param {any} tpl
	 */
	constructor(tpl) {
		this.#nodeName = /** @type {string}*/ (tpl.nodeName);
	}
	/**
	 * @param {boolean} bool
	 */
	setPresence(bool) {
	}
	/**
	 * @param {string} eventName
	 * @param {(e: any) => void} handler
	 */
	addEventListener(eventName, handler) {
	}

	get nodeName() {
		return this.#nodeName;
	}
	
	get masterNode() {
		return this.#masterNode;
	}
	/**
	 * @param {any} node
	 */
	set masterNode(node) {
		this.#masterNode = node;
	}
	/**
	 * @return {any}
	 */
	get wrappingNode() {
		return this.#wrappingNode || /**@type {any}*/ (this.#masterNode);
	}
	/**
	 * @returns {boolean}
	 */
	isShadowHost() {
		return false;
	}
	
	/**
	 * @return {boolean}
	 */
	#isTextInput() {
		return false;
	}
	
	/**
	 * @return {string}
	 */
	getTextInputValue() {
		return '';
	}
	
	/**
	 * @param {number} atIndex
	 * @returns {any|false}
	 */
	getChildNodeAtIndex(atIndex) {
	}
	
	/**
	 * @return {string}
	 */
	getTextContent() {
		return '';
	}
	
	/**
	  * @param {string} value
	 */
	setContent(value) {
	}
	
	/**
	 * @return {string}
	 */
	getContent() {
		return '';
	}
	
	/**
	 * @param {string} text
	 */
	setTextContent(text) {
	}
	
	/**
	 * @param {string} contentAsString
	 */
	setNodeContent(contentAsString) {
	}
	
	/**
	 * @param {string} text
	 */
	appendTextNode(text) {
	}
	
	/**
	 * @param {HTMLElement} childNode
	 * @param {number} atIndex
	 */
	addChildNodeAt(childNode, atIndex) {
	}
	
	empty() {
	}
	
	 /**
	  * @param {string[]} contentAsArray
	  * @returns {string[]}
	  */
	 getMultilineContent(contentAsArray) {
		return [];
	 }
	
	 /**
	  * @param {string[]} contentAsArray
	  * @param {string} templateNodeName
	  */
	 getFragmentFromContent(contentAsArray, templateNodeName) {
	 }
	 
	 /** @param {string[]} contentAsArray*/
	 setContentFromArray(contentAsArray) {
	 }
	
	/** @param {string} color */
	updateBGColor(color) {
	}
	
	/**
	 * These methods are implemented as a reminder and a potentially needed fallback,
	 * but in most cases of hiding/showing, we should prefer the reactive states-based mechanism:
	 * states : [{hidden : 'hidden'}} will be automagically reflected on the DOM node
	 */
	hide() {
	}
	
	show() {
	}
}

export default ViewStrategyInterface;