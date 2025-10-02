/**
 * @module Stream
 */

/**
 * @typedef {import('../component/Component').ComponentWithView} ComponentWithView
 * @typedef {import('../reactivity/Subscription')} Subscription
 */

 /**
 * @template StreamValue
 */
class Stream {
	/** @type {string} */
	static objectType ='Stream';
	/** @type {ComponentWithView|null} @default null*/
	#_hostComponent = null;
	/** @type {boolean} @default true */
	#_forward = true;
	/** type {boolean} @default false */
	#_dirty = false;
	/** @type {string} @default '' */
	name = '';
	/** @type {StreamValue} @default undefined */
	#_value;
	/** @type {boolean} @default false*/
	#lazy = false;
	/** @type {Subscription[]} @default []*/
	subscriptions = [];
	
	/**
	 * @param {string} name
	 * @param {StreamValue} value
	 * @param {ComponentWithView} component
	 * @param {boolean} [lazy]
	 */
	constructor(name, value, component, lazy = false) {
		this.name = name;
		this.#_value = value;
		this.#_hostComponent = component;
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
			/** @param {InstanceType<Subscription>} subscription */
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
	 * @returns {Subscription}
	 */
	addSubscription(downStream = null, effect = null) {
		this.subscriptions.push(new Subscription(downStream, effect));
		return this.subscriptions[this.subscriptions.length - 1];
	}
	/**
	 * 
	 * @param {Subscription|Stream<StreamValue>} subscriptionOrStream 
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