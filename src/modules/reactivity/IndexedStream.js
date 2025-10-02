/**
 * @module IndexedStream
 */

// @ts-nocheck
// FIXME: the semantic isn't clear, search where it was used

/**
 * @typedef {import('./StreamPool.js')} StreamPool
 */

/**
 * IndexedStream is meant to be part of a StreamPool
 */
class IndexedStream {
	/** @type {string} */
	static objectType ='IndexedStream';
	/** @type {number} */
	key = 0;
	/** @type {StreamPool} */
	parent;
	/**
	 * @param {number} key 
	 * @param {StreamPool} component 
	 * @param {string} name 
	 * @param {string|number} value 
	 */
	constructor(key, component, name, value) {
		this.key = key;
		this.parent = component;
	}
	set() {}
	remove() {
		return this.parent.removeStream(this.key);
	}
}

export default IndexedStream;