/**
 * @module IndexedStream
 */

/**
 * IndexedStream should be part of a StreamPool
 */
class IndexedStream {
	/** @type {string} */
	static objectType ='IndexedStream';
	/** @type {number} */
	_key = 0;
	/** @type {StreamPool} */
	_parent;
	/**
	 * @param {number} key 
	 * @param {StreamPool} component 
	 * @param {string} name 
	 * @param {string|number} value 
	 */
	constructor(key, component, name, value) {
		this._key = key;
		this._parent = component;
	}
	set() {}
	remove() {
		return this._parent.removeStream(this._key);
	}
}

export default IndexedStream;