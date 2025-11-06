/**
 * @module Stream
 */


/**
 * typedef {import('../component/Component').ComponentBase} Component
 */

import Subscription from './Subscription';

 /**
 * @template StreamValue
 */
class Stream {
	/** @type {string} */
	static objectType ='Stream';
	/** @type {boolean} @default false */
	#_dirty = false;
	/** @type {string} @default '' */
	name = '';
	/** @type {StreamValue} @default undefined */
	#_value;
	/** @type {boolean} @default false*/
	#lazy = false;
	/** @type {Subscription<StreamValue>[]} @default []*/
	subscriptions = [];
	
	/**
	 * @param {string} name
	 * @param {StreamValue} value
	 * @param {boolean} [lazy]
	 */
	constructor(name, value, lazy = false) {
		this.name = name;
		this.#_value = value;
		this.#lazy = lazy;
	}
	
	get next() {
		if (this.#lazy && this.#_dirty) {
			this.#lazyUpdate();
		}
		return this.#_value;
	}
	/** @param {StreamValue} val */
	set next(val) {
		this.#_value = val;
		this.#setAndUpdateConditional(val);
	}
	/**
	 * @param {StreamValue} value
	 */
	#setAndUpdateConditional(value) {
		this.#_value = value;
		if (!this.#lazy) {
			this.#update();
		}
		else {
			this.#_dirty = true;
		}
	}
	#update() {
		this.subscriptions.forEach(
			/** @param {Subscription<StreamValue>} subscription */
			(subscription) => {
				subscription.execute(this.#_value);
			}
		);
	}
	#lazyUpdate() {
		this.#update();
		this.#_dirty = false;
	}
	/**
	 * instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter & map)
	 * @param {Stream<StreamValue>|null} downStream
	 * @param {function|null} effect
	 */ 
	subscribe(downStream = null, effect = null) {
		return this.addSubscription(downStream, effect);
	}
	/**
	 * 
	 * @param {Stream<StreamValue>|null} downStream
	 * @param {function|null} effect 
	 * @returns {Subscription<StreamValue>}
	 */
	addSubscription(downStream = null, effect = null) {
		const subscription = new Subscription(downStream, effect);
		subscription.unsubscribe = function() {
			/** @ts-ignore bound function */
			this.unsubscribe(subscription);
		}.bind(this);

		this.subscriptions.push(subscription);
		return this.subscriptions[this.subscriptions.length - 1];
	}
	/**
	 * 
	 * @param {Subscription<StreamValue>|Stream<StreamValue>} subscriptionOrStream 
	 */
	unsubscribe(subscriptionOrStream) {
		for(let i = this.subscriptions.length - 1; i >= 0; i--) {
			if (this.subscriptions[i] === subscriptionOrStream || this.subscriptions[i].downStream === subscriptionOrStream) {
				this.subscriptions.splice(i, 1);
			}
		}
	}
}

export default Stream;