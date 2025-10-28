/**
 * @module ReactiveDataset
 * 
 * Tight coupling with Rendering
 * 		Rendering coupled with [push(), pushApply()]
 */
/**
 * @typedef {import('../component/Component').Component} Component
 */
import {ComponentTemplate, ListTemplate} from '../template/TemplateFactory.js';
import registries from '../Registries.js';
import Renderer from '../Renderer.js';
const processList = Renderer.processList;

/**
 * @template {{[key : string]: unknown}} ReactiveDatasetItem
 */
class ReactiveDataset {
	static objectType = 'ReactiveDataset'; 
	/** @type {ReactiveDatasetItem[]} */
	data = [];
	/** @type {Component} */
	trackedComponent;
	/** @type {ListTemplate} */
	listDef = new ListTemplate(null);
	/** @type {string} */
	activeStateItemProp = 'active';
	/** @type {{[key: string]: (value: any, index: number, array: any[]) => unknown}} */
	arrayFunctions = {};
	/** @type {(values : (string|number|null)[]) => void} is constructor*/
	Item;

	filterStream;
	filterNotStream;
	everyStream;
	someStream;
	someNotStream;
	noneStream;
	lengthStream;

	/**
	 * @param {Component} trackedComponent 
	 * @param {ComponentTemplate} cTemplate 
	 * @param {string[]} factoryPropsArray 
	 * @param {function[]|null} [arrayFunctions] 
	 */
	constructor(trackedComponent, cTemplate, factoryPropsArray, arrayFunctions = null) {
		this.trackedComponent = trackedComponent;
		this.listDef.template = cTemplate;
		this.Item = this.getItemFactory(factoryPropsArray);

		/**
		 * These functions are used as callbacks on standard  array filter functions
		 * see updateDatasetState() 
		 */
		if (!arrayFunctions) {
			this.arrayFunctions['every'] = 
				/** @param {ReactiveDatasetItem} item @param {number} idx @param {any[]} arr*/
				(item, idx, arr) => item[this.activeStateItemProp],
			
			this.arrayFunctions['none'] = 
				/** @param {ReactiveDatasetItem} item @param {number} idx @param {any[]} arr*/
				(item, idx, arr) => !item[this.activeStateItemProp],
			
			this.arrayFunctions['some'] = 
				/** @param {ReactiveDatasetItem} item @param {number} idx @param {any[]} arr*/
				(item, idx, arr) => item[this.activeStateItemProp],
			
			this.arrayFunctions['someNot'] = 
				/** @param {ReactiveDatasetItem} item @param {number} idx @param {any[]} arr*/
				(item, idx, arr) => !item[this.activeStateItemProp],
			
			this.arrayFunctions['filter'] = 
				/** @param {ReactiveDatasetItem} item @param {number} idx @param {any[]} arr*/
				(item, idx, arr) => item[this.activeStateItemProp],
			
			this.arrayFunctions['filterNot'] = 
				/** @param {ReactiveDatasetItem} item @param {number} idx @param {any[]} arr*/
				(item, idx, arr) => !item[this.activeStateItemProp]
		}
		else {
			Object.assign(this.arrayFunctions, arrayFunctions);
		}

		const regUID = this.trackedComponent.regUID;
		const registry = registries.streams.get(regUID);
		this.filterStream = registry?.get('filter'); 
		this.filterNotStream = registry?.get('filterNot'); 
		this.everyStream = registry?.get('every'); 
		this.someStream = registry?.get('some'); 
		this.someNotStream = registry?.get('someNot'); 
		this.noneStream = registry?.get('none'); 
		this.lengthStream = registry?.get('length'); 
	}

	/**
	 * These functions are used as callbacks on standard  array filter functions
	 * see updateDatasetState() 
	 * @param {function[]} arrayFunctions
	 * */
	setFunctionList(arrayFunctions) {
		
	}
	/**
	 * @param {string[]} factoryPropsArray 
	 */
	getItemFactory(factoryPropsArray) {
		const arrayCopy = factoryPropsArray.slice(0);

		/** @param {(string|number|null)[]} values */
		const factory = function(values) {
			values.forEach((arg, key) => {
				/** @ts-ignore reflection */
				this[arrayCopy[key]] = arg;
			});
		}
		Object.defineProperty(factory.prototype, 'keys', {value : arrayCopy});
		return factory;
	}
	/**
	 * @returns {ReactiveDatasetItem}
	 */
	newItem() {
		return (new this.Item([...arguments]));
	}
	/**
	 * The tracked component may implement a stream named
	 * like one of the common array filter functions.
	 * Child components of the trackedComponent may listen to
	 * one of these streams, to set its visibility, without removing 
	 * the item from that dataset 
	 */
	updateDatasetState() {
		if (this.filterStream)
			this.filterStream.next = this.data.filter(this.arrayFunctions.filter);
		if (this.filterNotStream)
			this.filterNotStream.next = this.data.filter(this.arrayFunctions.filterNot);
		if (this.everyStream)
			this.everyStream.next = this.data.every(this.arrayFunctions.every);
		if (this.someStream)
			this.someStream.next = this.data.some(this.arrayFunctions.some);
		if (this.someNotStream)
			this.someNotStream.next = this.data.some(this.arrayFunctions.someNot);
		if (this.noneStream)
			this.noneStream.next = this.data.filter(this.arrayFunctions.none);

		if (this.lengthStream)
			this.lengthStream.next = this.data.length;
	}
	/**
	 * @param {ReactiveDatasetItem} item 
	 */
	push(item) {
		this.listDef.each = [item];
		processList(this.trackedComponent, this.listDef);
		// TODO: replace with ReactivityFactory
		// this.trackedComponent.handleEventSubsOnChildrenAt(Registries.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
		this.data.push(item);
		this.updateDatasetState();
	}
	/**
	 * @param {ReactiveDatasetItem[]} items
	 */
	pushApply(items) {
		this.listDef.each = items;
		processList(this.trackedComponent, this.listDef)
		// TODO: replace with ReactivityFactory
		// this.trackedComponent.handleEventSubsOnChildrenAt(Registries.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
		this.data.push(...items);
		this.updateDatasetState();
	}
	/**
	 * 
	 * @param {number} index 
	 * @param {number} length 
	 * @param {[]|null} [replacedBy] 
	 * @returns {[ReactiveDatasetItem, Component]|boolean}
	 */
	splice(index, length, replacedBy) {
		let c1, c2, mBackup;

		if (typeof replacedBy === 'number') {
			if (replacedBy > index) {
				c2 = this.trackedComponent.children[replacedBy]
				this.trackedComponent.removeChildAt(replacedBy);
				c1 = this.trackedComponent.children[index];
				this.trackedComponent.removeChildAt(index);
				this.trackedComponent.addChildAt(c2, index);
			}
			else {
				c1 = this.trackedComponent.children[index];
				this.trackedComponent.removeChildAt(index);
				c2 = this.trackedComponent.children[replacedBy];
				this.trackedComponent.removeChildAt(replacedBy);
				this.trackedComponent.addChildAt(c2, index - 1);
			}

			mBackup = this.data.splice(index, 1, this[replacedBy])[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (typeof replacedBy === 'undefined' || replacedBy === null) {
			c1 = this.trackedComponent.children[index];
			this.trackedComponent.removeChildAt(index);
			mBackup = this.data.splice(index, 1)[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (Array.isArray(replacedBy)) {
			/** @ts-ignore undefined already checked */ 
			this.trackedComponent.addChildAt((replacedBy[1]), index);
			/** @ts-ignore undefined already checked */ 
			this.data.splice(index, 1, (replacedBy[0]));
			this.updateDatasetState();
			return true;
		}
		return false;
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
				const stream = registries.streams.get(module.regUID)?.get(prop);
				if (stream && stream.next === value) {
					this.trackedComponent.removeChildAt(i);
					this.data.splice(i, 1);
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
			var instance;
			for (let i = this.trackedComponent.children.length - 1; i >= 0; i--) {
				instance = this.trackedComponent.children[i];
				const stream = registries.streams.get(instance.regUID)?.get(prop);
				if (stream && stream.next !== value) {
					this.trackedComponent.removeChildAt(i);
					this.data.splice(i, 1);
				}
			}
			this.updateDatasetState();
			return true;
		}
		else
			return false;
	}

	resetLength() {
		for (var i = this.data.length - 1; i >= 0; i--) {
			this.trackedComponent.removeChildAt(this.trackedComponent.children.length - 1);
		};
		this.data.length = 0;
	}

	serialize() {
		return JSON.stringify(this.data);
	}
	/**
	 * TODO: where was this method used ?
	 * @param {string} prop 
	 * @param {number} idx 
	 * @param {boolean} invert 
	 */
	sortForPropHostingArrayOnArrayIdx(prop, idx, invert) {
		/** @type {ReactiveDatasetItem[]} */
		const tmpThis = [];
		for (let i = 0, l = this.data.length; i < l; i++) {
			/** @ts-ignore template not enough precise */
			tmpThis.push(this.data[i][prop]);
		}
		
		if (invert)
			/** @ts-ignore sort callback args are typed unknown => can't be resolved as object */
			tmpThis.sort(this.inverseSortOnObjectProp);
		else
			/** @ts-ignore sort callback args are typed unknown => can't be resolved as object */
			tmpThis.sort(this.sortOnObjectProp); // .bind(null, idx)
		
		for (let i = 0, l = this.data.length; i < l; i++) {
			/** @ts-ignore template not enough precise */
			(this.data[i][prop]) = tmpThis[i];
		}
	}
	/** @param {string} a @param {string} b */
	sortStringsAsNumbers(a, b) {
		return (parseInt(a) > parseInt(b)
					? 1 
					: (parseInt(a) === parseInt(b)
						? 0
						: -1));
	}
	/** @param {string} a @param {string} b */
	invertSortStringsAsNumbers(a, b) {
		return (parseInt(a) < parseInt(b)
					? 1 
					: (parseInt(a) === parseInt(b)
						? 0
						: -1));
	}
	/**
	 * @param {string} prop 
	 * @param {{[key:string]:unknown}} a
	 * @param {{[key:string]:unknown}} b
	 * */
	sortOnObjectProp(prop, a, b) {
		if (typeof a[prop] === 'string')
			/** @ts-ignore utility: b[prop] can't be of a different type than a[prop] */
			return a[prop].charCodeAt(0) - b[prop].charCodeAt(0)
		else if (typeof a[prop] === 'number')
			/** @ts-ignore utility: b[prop] can't be of a different type than a[prop] */
			return a[prop] - b[prop];
		return 0;
	}
	/**
	 * @param {string} prop 
	 * @param {{[key:string]:unknown}} a
	 * @param {{[key:string]:unknown}} b
	 * */
	inverseSortOnObjectProp(prop, a, b) {
		if (typeof a[prop] === 'string')
			/** @ts-ignore utility: b[prop] can't be of a different type than a[prop] */
			return b[prop].charCodeAt(0) - a[prop].charCodeAt(0)
		else if (typeof a[prop] === 'number')
			/** @ts-ignore utility: b[prop] can't be of a different type than a[prop] */
			return b[prop] - a[prop];

		return 0;
	}
}



export default ReactiveDataset;