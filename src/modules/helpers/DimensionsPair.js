/**
 * @module DimensionsPair
 */

class DimensionsPair {
	/** @type {number} @default 0*/
	inline = 0;
	/** @type {number} @default 0*/
	block = 0;
	/**
	 * @param {[number, number]} initialValues
	 */
	constructor(initialValues) {
		this.inline = initialValues[0];
		this.block = initialValues[1];
	}
	/**
	 * @param {[number, number]} valuesPair
	 */
	set(valuesPair) {
		this.inline = valuesPair[0];
		this.block = valuesPair[1];
		return this;
	}
	/**
	 * @param {[number, number]} valuesPair
	 */
	add(valuesPair) {
		this.inline += valuesPair[0];
		this.block += valuesPair[1];
		return this;
	}
	/**
	 * @param {[number, number]} valuesPair
	 */
	substract(valuesPair) {
		this.inline -= valuesPair[0];
		this.block -= valuesPair[1];
		return this;
	}
}

export default DimensionsPair;