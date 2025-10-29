/**
 * @module ReactivityQuery
 */

/**
 * @typedef {import('../component/Component.js').ComponentBase} Component
 * @typedef {import('../reactivity/EffectCtx.js').default} EffectCtx
 */

/**
 * @typedef {object} ReactivityQueryDef
 * @property {boolean} [cbOnly]		// backwards compatibility
 * @property {string} from
 * @property {string} [to]
 * @property {function} [filter]
 * @property {function} [map]
 * @property {((ctx: EffectCtx, value: unknown) => void)|null} [effect]
 */

import {ComponentError } from '../error/Error.js';

class ReactivityQuery {
	/** @type {string} @readonly */
	objectType = 'ReactivityQuery';
	/** @type {boolean} */
	cbOnly = false;
	/** @type {string} */
	from;
	/** @type {string|null} */
	to = null;
	// /** @type {HTMLElement|Stream|null} */
	// obj = null;
	/** @type {function|null} */
	filter = null;
	/** @type {function|null} */
	map = null;
	/** @type {((ctx: EffectCtx, value: unknown) => void)|null} */
	effect = null;
	
	/**
	 * @param {ReactivityQueryDef} obj
	 */
	constructor(obj) {
		if (!obj.to && !obj.effect) {
			new ComponentError(this, 'When the "to" field isn\'t defined, the "effect" field must be defined',  this);
		}
		else if (obj.to && obj.effect) {
			new ComponentError(this, 'When the "effect" field is defined, no propagation via the "to" field is allowed.',  this);
		}
		
		/** @readonly */ this.from = obj.from;
		/** @readonly */ this.to = obj.to || null;
		/** @readonly */ this.filter = obj.filter || null;
		/** @readonly */ this.map = obj.map || null;
		/**           */ this.effect = obj.effect || null;
	}
}

class ReactOnParent extends ReactivityQuery {
	/** @readonly  */
	objectType = 'ReactOnParent';
}
class ReactOnSelf extends ReactivityQuery {
	/** @readonly  */
	objectType = 'ReactOnSelf';
}


class ReactivityQueryArray extends Array {
	/***
	 * @param {string} from
	 * @param {string} to
	 * @returns {boolean}
	 */
	checkDuplicate(from, to) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (this[i].from === from && this[i].to === to)
				return true;
		}
		return false;
	}
}

export {
	ReactivityQuery,
	ReactOnParent,
	ReactOnSelf,
	ReactivityQueryArray
};