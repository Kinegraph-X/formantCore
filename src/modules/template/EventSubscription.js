/**
 * @module EventSubscription
 */

/**
 * @typedef {object} EventSubscriptionDef
 * @property {string} on
 * @property {function} subscribe
 */
class EventSubscription {
	/** @type {string} */
	on;
	/** @type {function} */
	subscribe = () => {};
	/** @type {string} @readonly */
	objectType = 'EventSubscription';
	/**
	 * @param {EventSubscriptionDef} obj
	 */
	constructor(obj) {
		/** @readonly */ this.on = obj.on;
		/** @readonly */ this.subscribe = obj.subscribe;
	}
}

class SubscribeOnChild extends EventSubscription {
	/** @readonly  */
	objectType = 'SubscribeOnChild';
}
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

export default {
	EventSubscription,
	SubscribeOnSelf,
	SubscribeOnChild,
	EventSubscriptionArray
};