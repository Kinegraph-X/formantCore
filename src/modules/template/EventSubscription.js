/**
 * @module EventSubscription
 */

/** 
 * @template EventPayload
 * @typedef {import('../reactivity/EventEmitter').FrameworkEvent<EventPayload>} FrameworkEvent 
 * */

/**
 * @template EventPayload
 * @typedef {object} EventSubscriptionDef
 * @property {string} on
 * @property {(e : FrameworkEvent<EventPayload>) => void} subscribe
 */
/**
 * @template EventPayload
 */
class EventSubscription {
	/** @type {string} */
	on;
	/** @type {function} */
	subscribe = () => {};
	/** @type {string} @readonly */
	objectType = 'EventSubscription';
	/**
	 * @param {EventSubscriptionDef<EventPayload>} obj
	 */
	constructor(obj) {
		/** @readonly */ this.on = obj.on;
		/** @readonly */ this.subscribe = obj.subscribe;
	}
}

/**
 * @template EventPayload
 * @extends EventSubscription<EventPayload> 
 */
class SubscribeOnChild extends EventSubscription {
	/** @readonly  */
	objectType = 'SubscribeOnChild';
}

/**
 * @template EventPayload
 * @extends EventSubscription<EventPayload> 
 */
class SubscribeOnSelf extends EventSubscription {
	/** @readonly  */
	objectType = 'SubscribeOnSelf';
}



class EventSubscriptionArray extends Array {
	/** @param {string} key */
	findObjectByOn(key) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (this[i].on !== key)
				return this[i];
		}
		return false;
	}
}

export {
	EventSubscription,
	SubscribeOnSelf,
	SubscribeOnChild,
	EventSubscriptionArray
};