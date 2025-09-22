/**
 * @module ReactiveDataset
 * 
 * Tight coupling with Rendering
 * 		Rendering coupled with [Dataset.push(), pushApply(), splice(), & more]
 */

const {ComonentTemplate, ListDefinition} = require('src/coreTest/TemplateFactory');
const registries = require('src/coreTest/Registries');

/**
 * @template ReactiveDatasetItem
 */
class ReactiveDataset extends Array {
	/** @type {ComponentWithView} */
	rootComponent;
	/** @type {ListDefinition} */
	defaultListDef = new ListDefinition({
			type : 'ComponentList',
			each : [],
			item : null,
			template : null,
			isInternal : true
		});
	/** @type {{[key: string]: function}} */
	arrayFunctions = {
		// trackedProp : 'active',
		every : function(item) {return item[this.trackedProp];},
		none : function(item) {return !item[this.trackedProp];},
		some : function(item) {return item[this.trackedProp];},
		someNot : function(item) {return !item[this.trackedProp];},
		filter : function(item) {return item[this.trackedProp];},
		filterNot : function(item) {return !item[this.trackedProp];}
	}
	/** @type {((string|number|null)[]): void} is constructor*/
	Item;

	/**
	 * @param {ComponentWithView} trackedComponent 
	 * @param {ComponentTemplate} cTemplate 
	 * @param {string[]} factoryPropsArray 
	 * @param {function[]} [arrayFunctions] 
	 */
	constructor(trackedComponent, template, factoryPropsArray, arrayFunctions = null) {
		this.init(trackedComponent, template, factoryPropsArray);
		if (arrayFunctions !== null && arrayFunctions.length) {
			this.setFunctionList(arrayFunctions);
		}
	}

	/**
	 * @param {ComponentWithView} trackedComponent 
	 * @param {ComponentTemplate} cTemplate 
	 * @param {string[]} factoryPropsArray 
	 */
	init(trackedComponent, cTemplate, factoryPropsArray) {
		this.trackedComponent = trackedComponent;
		this.defaultListDef.template = cTemplate;
		this.Item = this.getItemFactory(factoryPropsArray);
	}
	/** @param {function[]} arrayFunctions */
	setFunctionList(arrayFunctions) {
		Array.prototype.push.apply(this.arrayFunctions, arrayFunc);
	}
	/**
	 * @param {string[]} factoryPropsArray 
	 */
	getItemFactory(factoryPropsArray) {
		const arrayCopy = factoryPropsArray.slice(0);
		const factory = function(values) {
			values.forEach(function(arg, key) {
				this[arrayCopy[key]] = arg;
			}, this);
		}
		Object.defineProperty(factory.prototype, 'keys', {value : arraayCopy});
		return factory;
	}
	/**
	 * @returns {ReactiveDatasetItem}
	 */
	newItem() {
		return (new this.Item([...arguments]));
	}

	updateDatasetState(){
		this.funcList.forEach(function(prop) {
			if (prop === 'filter' || prop === 'filterNot')
				this.rootComponent.streams[prop].value = Array.prototype.filter.call(this, this.arrayFunc[prop], this.arrayFunc).length;
			else {
				this.rootComponent.streams[prop].value = Array.prototype[prop] 
					? Array.prototype[prop].call(this, this.arrayFunc[prop], this.arrayFunc)
						: (prop === 'none' 
							? Array.prototype.every.call(this, this.arrayFunc[prop], this.arrayFunc)
								: Array.prototype.some.call(this, this.arrayFunc[prop], this.arrayFunc));
			}
		}, this);
		if (this.rootComponent.streams['length'])
			this.rootComponent.streams['length'].value = this.length;
	}
	/**
	 * @param {string} stateName 
	 * @param {string|number|null} value 
	 * @param {boolean} setSingle 
	 */
	setDatasetState(stateName, value, setSingle) {
		this.rootComponent.streams[stateName].value = value;
		if (!setSingle)
			this.updateDatasetState();
	}
	/**
	 * @param {string} stateName
	 */
	getDatasetState(stateName) {
		return this.rootComponent.streams[stateName].value;
	}
	/**
	 * @param {ReactiveDatasetItem} item 
	 */
	push(item) {
		this.defaultListDef.host.each = [item];
		renderList(this.trackedComponent, this.defaultListDef)
		// TODO: replace with ReactivityFactory
		// this.trackedComponent.handleEventSubsOnChildrenAt(Registries.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
		Array.prototype.push.call(this, item);
		this.updateDatasetState();
	}
	/**
	 * @param {ReactiveDatasetItem[]} items
	 */
	pushApply(items) {
		this.defaultListDef.host.each = items;
		renderList(this.trackedComponent, this.defaultListDef)
		// TODO: replace with ReactivityFactory
		// this.trackedComponent.handleEventSubsOnChildrenAt(Registries.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
		Array.prototype.push.apply(this, items);
		this.updateDatasetState();
	}
	/**
	 * 
	 * @param {number} index 
	 * @param {number} length 
	 * @param {[]|null} [replacedBy] 
	 * @returns {[]|boolean}
	 */
	splice(index, length, replacedBy) {
		var c1, c2, mBackup;

		if (typeof replacedBy === 'number') {
			if (replacedBy > index) {
				c2 = this.trackedComponent._children[replacedBy].remove();
				c1 = this.trackedComponent._children[index].remove();
				this.trackedComponent.addChildAt(c2, index);
			}
			else {
				c1 = this.trackedComponent._children[index].remove();
				c2 = this.trackedComponent._children[replacedBy].remove();
				this.trackedComponent.addChildAt(c2, index - 1);
			}

			mBackup = Array.prototype.splice.call(this, index, 1, this[replacedBy])[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (typeof replacedBy === 'undefined' || replacedBy === null) {
			c1 = this.trackedComponent._children[index].remove();
			mBackup = Array.prototype.splice.call(this, index, 1)[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (Array.isArray(replacedBy)) {
			this.trackedComponent.addChildAt(replacedBy[1], index);
			Array.prototype.splice.call(this, index, 1, replacedBy[0]);
			this.updateDatasetState();
			return true;
		}
	}
	/**
	 * Removes the entries & child components having a certain value on a certain stream
	 * @param {string} prop 
	 * @param {string|number|null} value 
	 * @returns {boolean}
	 */
	spliceOnProp(prop, value) {
		if (this.trackedComponent.children.length) {
			var module;
			for (let i = this.trackedComponent.children.length - 1; i >= 0; i--) {
				module = this.trackedComponent.children[i];
				if (module.streams[prop] && module.streams[prop].value === value) {
					module.remove();
					Array.prototype.splice.call(this, i, 1);
				}
			}
			this.updateDatasetState();
			return true;
		}
		else
			return false;
	}
	/**
	 * Removes the entries & child components NOT having a certain value on a certain stream
	 * @param {string} prop 
	 * @param {string|number|null} value 
	 * @returns {boolean}
	 */
	spliceOnPropInverse(prop, value) {
		if (this.trackedComponent.children.length) {
			var module;
			for (let i = this.trackedComponent.children.length - 1; i >= 0; i--) {
				module = this.trackedComponent.children[i];
				if (module.streams[prop] && module.streams[prop].value !== value) {
					module.remove();
					Array.prototype.splice.call(this, i, 1);
				}
			}
			this.updateDatasetState();
		}
		else
			return false;
	}

	resetLength() {
		for (var i = this.length - 1; i >= 0; i--) {
			this.trackedComponent.removeChildAt(this.trackedComponent._children.length - 1);
		};
		Array.prototype.splice.call(this, 0, this.length);
	}

	serialize() {
		return JSON.stringify(Array.from(this));
	}
	/**
	 * 
	 * @param {string} prop 
	 * @param {number} idx 
	 * @param {boolean} invert 
	 */
	sortForPropHostingArrayOnArrayIdx(prop, idx, invert) {
		var tmpThis = [];
		for (let i = 0, l = this.length; i < l; i++) {
			tmpThis.push(this[i][prop].slice(0));
		}
		
		if (invert)
			tmpThis.sort(this.inverseSortOnObjectProp.bind(null, idx));
		else
			tmpThis.sort(this.sortOnObjectProp.bind(null, idx));
		
		for (let i = 0, l = this.length; i < l; i++) {
			this[i][prop] = tmpThis[i];
		}
	}

	reNewComponents() {
		var lastIndex = this.trackedComponent._children.length;
		this.defaultListDef.host.each = this;
		new App.List(this.defaultListDef, this.trackedComponent);
		this.trackedComponent.handleEventSubsOnChildrenAt(Registries.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
		this.updateDatasetState();
	}

	sortStringsAsNumbers(a, b) {
		return (parseInt(a) > parseInt(b)
					? 1 
					: (parseInt(a) === parseInt(b)
						? 0
						: -1));
	}

	invertSortStringsAsNumbers(a, b) {
		return (parseInt(a) < parseInt(b)
					? 1 
					: (parseInt(a) === parseInt(b)
						? 0
						: -1));
	}
}



module.exports = ReactiveDataset;