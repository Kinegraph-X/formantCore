/**
 * @module StreamPool
 */

/**
 * @typedef {import('./IndexedStream)} IndexedStream
 */

/**
 * IndexedStreams should be part of a StreamPool
 */
class StreamPool {
	/** @type {string} */
	static objectType ='StreamPool';
	/** @type {number} */
	_key = 0;
	/** @type {ComponentWithView} */
	_component;
	/** @type {IndexedStream[]} */
	_streamsArray  = [];
	/**
	 * @param {ComponentWithView} component 
	 */
	constructor(component) {
		this._component = component;
	}
	getFirstStream() {
		return this._streamsArray[0];
	}
	/**
	 * @param {number} idx : the _key of the member Stream
	 */
	getStreamAt(idx) {
		return this._streamsArray[idx];
	}
	getLastStream() {
		return this._streamsArray[this._streamsArray.length - 1];
	}
	/**
	 * @param {IndexedStream} child : an instance of a Stream
	 */
	pushStream(child) {
		child._parent = this;
		child._key = this._streamsArray.length;
		this._streamsArray.push(child);
	}
	/**
	 * @param {IndexedStream} child : an instance of a Stream
	 * @param {number} atIndex : the required index to splice at
	 */
	addStreamAt(child, atIndex) {
		child._parent = this;
		child._key = atIndex;
		this._streamsArray.splice(atIndex, 0, child);
		this.#generateKeys(atIndex);
	}
	/**
	 * @param {number} childKey : the required index to splice at
	 */
	removeStream(childKey) {
		var removed = this._streamsArray.splice(childKey, 1);
		(childKey < this._streamsArray.length && this.#generateKeys(childKey));
		return removed;
	}
	
	removeLastStream() {
		var removed = this._streamsArray.pop();
		return removed;
	}
	/**
	 * @param {number} atIndex : the index at which to splice
	 */
	removeStreamAt(atIndex) {
		var removedChild = this._streamsArray.splice(atIndex, 1);
		this.#generateKeys(atIndex);
	}
	
	removeAllStreams() {
		this._streamsArray.length = 0;
	}
	/**
	 * @param {number} atIndex : the first _key we need to invalidate
	 */
	#generateKeys(atIndex) {
		for (let i = atIndex || 0, l = this._streamsArray.length; i < l; i++) {
			this._streamsArray[i]._key = i;
		}
	}
}

export default StreamPool;