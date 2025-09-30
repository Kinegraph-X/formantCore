/**
 * @module Pair
 */

class Pair {
	/** @type {string} @default ''*/
	name = '';
	/** @type {string} @default ''*/
	value = '';
	/**
	 * @param {string} name
	 * @param {string} value
	 */
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}
}



class ListOfPairs extends Array {
	/**
	 * @param {{'name' : string, 'value' : string}[]} nameValuePairsList
	 */
	constructor(nameValuePairsList) {
		super();
//		if (Array.isArray(nameValuePairsList)) {
			for (let i = 0, l = nameValuePairsList.length; i < l; i++) {
				this.push(
					new Pair(
						nameValuePairsList[i].name,
						nameValuePairsList[i].value
					)
				);
			}
//		}
	}
}

export default {
	Pair,
	ListOfPairs
}