/**
 * @module EventSubscription
 */

// /** 
//  * @template EventPayload
//  * @typedef {import('../eventEmitter/FrameworkEvent.js').FrameworkEvent<EventPayload>} FrameworkEvent 
//  * @typedef {import('../eventEmitter/FrameworkEventCtx.js').FrameworkEventCtx} FrameworkEventCtx 
//  * @typedef {import('../eventEmitter/FrameworkEventMeta.js').FrameworkEventMeta} FrameworkEventMeta 
//  * */

import type {FrameworkEvent} from '../eventEmitter/FrameworkEvent';
import type {FrameworkEventCtx} from '../eventEmitter/FrameworkEventCtx';
import type {FrameworkEventMeta} from '../eventEmitter/FrameworkEventMeta';

export interface EventSubscriptionDef {
	on : string,
	subscribe (
		e : FrameworkEvent<unknown>,
		ctx: FrameworkEventCtx,
		meta: FrameworkEventMeta
	) : void;
}

/**
 * @template EventPayload
 * @typedef {object} EventSubscriptionDef
 * @property {string} on
 * @property {(e : FrameworkEvent<EventPayload>, ctx: FrameworkEventCtx, meta: FrameworkEventMeta) => void} subscribe
 */
class EventSubscription<EventPayload> {
	/** @type {string} */
	on;
	/** @type {function} */
	subscribe = (e : FrameworkEvent<EventPayload>, ctx: FrameworkEventCtx, meta: FrameworkEventMeta) : void => {};
	/** @type {string} @readonly */
	objectType = 'EventSubscription';
	/**
	 * @param {EventSubscriptionDef<EventPayload>} obj
	 */
	constructor(obj : EventSubscriptionDef) {
		/** @readonly */ this.on = obj.on;
		/** @readonly */ this.subscribe = obj.subscribe;
	}
}

/**
 * @template EventPayload
 * @extends EventSubscription<EventPayload> 
 */
class SubscribeOnChild<EventPayload> extends EventSubscription<EventPayload> {
	/** @readonly  */
	objectType = 'SubscribeOnChild';
}

/**
 * @template EventPayload
 * @extends EventSubscription<EventPayload> 
 */
class SubscribeOnSelf<EventPayload> extends EventSubscription<EventPayload> {
	/** @readonly  */
	objectType = 'SubscribeOnSelf';
}



class EventSubscriptionArray extends Array {
	/** @param {string} key */
	findObjectByOn(key : string) {
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