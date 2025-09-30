/**
 * @module SavableStore
 */



/**
 * @template SavableStoreUpdateCallback
 */
class SavableStore {
	/** @type {string} */
	static objectType ='SavableStore';
	/** @type {function} */
	onUpdateCallback;
	/** @type {string[]} */
	valueNames = [];
	/** @type {Prop[]} */
	values = [];
	/**
	 * @param {function} onUpdateCallback
	 * @param {string[]} valueNamesList
	 */
	constructor(onUpdateCallback, valueNamesList = []) {
		this.onUpdateCallback = onUpdateCallback;
		if (valueNamesList && valueNamesList.length) {
			valueNamesList.forEach((valueName) => {
				this.addValue(valueName);
			});
		}
	}
	/**
	 * @param {string} valueName
	 */
	addValue(valueName) {
		this.valueNames.push(valueName);
		this.values.push(new Prop({[valueName] : undefined}))
	}
	
	/**
	 * @param {string} valueName
	 */
	removeValue(valueName) {
		// FIXME: we should make use of the valueNames index
		var valuePos = this.valueNames.indexOf(valueName);
		this.values.splice(valuePos, 1);
		this.valueNames.splice(valuePos, 1);
	}
	
	clearValues() {
		this.values.length = 0;
	}
	
	/**
	 * @param {string} valueName
	 * @param {string|boolean} value
	 */
	update(valueName, value) {
		// FIXME: we should make use of the valueNames index
		var valueObj = this.values[this.valueNames.indexOf(valueName)];
		valueObj.value = value;
		
		/** @type {{[key : string] : string|number|boolean|object|null|undefined}} */
		let returnValue = {};
		this.valueNames.forEach(
			(name, key) => {
				returnValue[name] = this.values[key].value;
			}
		);
		this.onUpdateCallback(JSON.stringify(returnValue));
	}
	
	empty() {
		this.valueNames.forEach((valueName, key) => {
			this.values[key].value = undefined;
		});
	}
}

export default SavableStore;