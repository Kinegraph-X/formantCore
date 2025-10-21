/**
 * @module StreamToDomInterface
 */

/**
 * @typedef {import('../reactivity/Stream.js').default<unknown>} Stream
 */

class StreamToDomInterface {
	constructor() {
		throw new Error("ElementFactory is static-only; do not instantiate.");
	}
	/**
	 * 
	 */
	/** @param {Stream} stream */
	static getPropertyDescriptor(stream) {
		return  {
			get : () => stream.next,
			/** @param {unknown} val*/
			set : (val) => {
				/** @type {unknown} bound function */
				const thisArg = this;
				if (val !== stream.next)
					/** @type {HTMLElement} */ (thisArg).setAttribute(stream.name, /**@type {string}*/(val));
				stream.next = val;
			}
		}
	}
}

export default StreamToDomInterface;