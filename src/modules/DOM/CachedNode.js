/**
 * @module CachedNodes
 */


/**
 * Node Type for corresponding registry
 */
class CachedNode {
	static objectType = 'CachedNode';

	/**
	 * @param {string} nodeName
	 * @param {boolean} isCustomElem
	 */
	constructor(nodeName, isCustomElem) {
		this.nodeName = nodeName;
		this.isCustomElem = isCustomElem;
		/** @type {HTMLElement|null} */
		this.cloneMother = null;
	}
}

export default CachedNode;