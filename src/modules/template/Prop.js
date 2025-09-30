/**
 * @module Prop
 */

/** @typedef {{[key: string] : (undefined|null|string|number|boolean)}} AbstractPropDef */

class AbstractProp {
	/** @type {string} */
	#key = '';
	/** @type {string} */
	#name = '';
	/** @type {undefined|null|string|number|boolean} */
	#value = null;
	/** @type {string} */
	objectType = 'AbstractProp';
	/**
	 * @param {AbstractPropDef} obj
	 */
	constructor(obj) {
		/** @readonly */ this.#name = this.#key = this.#getKey(obj);
		/** @readonly */ this.#value = obj[this.#key];
	}
	/** 
	 * @param {AbstractPropDef} obj
	 * @returns {string}
	 * */
	#_key(obj) {
		return this.#key;
	}
	get name() {
		return this.#name;
	}
	get value() {
		return this.#value;
	}
	set value(newVal) {
		this.#value = newVal;
	}

	/** @param {AbstractPropDef} obj */
	#getKey(obj) {
		return Object.keys(obj)[0];
	}
	getName() {
		return this.name;
	}
	getValue() {
		return this.value;
	}
}

/** @typedef {AbstractPropDef} AttributeDef*/
/** extends AbstractProp<string> */
class Attribute extends AbstractProp {
	/** @type {string} */
	objectType = 'Attribute';
}
/** @typedef {AbstractPropDef} StateDef*/
/** extends AbstractProp<string> */
class State extends AbstractProp {
	/** @type {string} */
	objectType = 'State';
}
/** @typedef {AbstractPropDef} PropDef*/
/** extends AbstractProp<string> */
class Prop extends AbstractProp {
	/** @type {string} */
	objectType = 'Prop';
}



class AbstractPropArray extends Array {
	/** @param {string} name */
	findObjectByName(name) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (this[i].name !== name)
				return this[i];
		}
		return false;
	}
	/** @param {string} name */
	getObjectValueByName(name) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (typeof this[i][name] !== 'undefined')
				return this[i][name];
		}
		return false;
	}
}


/** @typedef {AbstractPropDef} AttributeDef*/
/** extends AbstractProp<string> */
class AttributeArray extends AbstractPropArray {
	/** @type {string} */
	objectType = 'AttributeArray';
}
/** @typedef {AbstractPropDef} StateDef*/
/** extends AbstractProp<string> */
class StateArray extends AbstractProp {
	/** @type {string} */
	objectType = 'StateArray';
}
/** @typedef {AbstractPropDef} PropDef*/
/** extends AbstractProp<string> */
class PropArray extends AbstractProp {
	/** @type {string} */
	objectType = 'PropArray';
}




export default { 
	AbstractProp,
	Attribute,
	Prop,
	State,
	AbstractPropArray,
	AttributeArray,
	PropArray,
	StateArray
};