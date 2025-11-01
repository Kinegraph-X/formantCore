/**
 * @module Subscription
 */

/** 
 * @template StreamValue
 * @typedef {import('../reactivity/Stream.js').default<StreamValue>} Stream 
 */

import {ComponentError } from '../error/Error.js';

 /**
 * A Class to be used by the Streams
 * 
 * 	example  this.streams[streamName].subscribe(candidate.hostElem, streamValue);
 * 
 * Comparison with RxJS:
 * 
 * where Subscriber implements the Observer interface and extends the Subscription class
 * An Observer holds the value over time, through calls to its next() by an Observable.
 * filter(), map() and transform are applied through the Pipe.
 * 
 * Here, a subscription is the pipe AND the application of the next() method of an observable
 */
/**
 * @template StreamValue
 */
class Subscription {
	/** @type {string} */
	static objectType ='Subscription';
	/** @type {function|null} */
	effect = null;
	/** @type {Stream<StreamValue>|null} */
	downStream;
	/** @type {function} */
	filter = () => {};
	/** @type {function} */
	map = () => {};
	/** @type {function} */
	transform = () => {};
	/**
	 * @param {Stream<StreamValue>|null} downStream 
	 * @param {function|null} effect 
	 */
	constructor(downStream = null, effect = null) {
		this.effect = effect;
		this.downStream = downStream;
		this._subscriberUID = '';
		this._subscriberType = '';
	}
	/**
	 * @param {function|null} filterFunc 
	 * @returns {Subscription<StreamValue>}
	 */
	createFilter(filterFunc) {
		if (!filterFunc)
			return this;
			
		// optimize by breaking the reference : TODO: benchmark
		const functionBody = filterFunc.toString().match(/\{.*\}\s*$/);
		if (process.env.NODE_ENV === 'development') {
			if (!functionBody)
				throw new ComponentError(this, 'probably malformed filter function, unable to parse function body', filterFunc);
		}
		var f = new Function('value', `${functionBody}`);
		this.filter = f;
		return this;
	}
	/**
	 * @param {function|null} mapFunc 
	 * @returns {Subscription<StreamValue>}
	 */
	createMap(mapFunc) {
		if (!mapFunc)
			return this;
			
		// optimize by breaking the reference : TODO: benchmark
		const functionBody = mapFunc.toString().match(/\{.*\}\s*$/);
		if (process.env.NODE_ENV === 'development') {
			if (!functionBody)
				throw new ComponentError(this, 'probably malformed map function, unable to parse function body', mapFunc);
		}
		var f = new Function('value', `${functionBody}`);
		this.map = f;
		return this;
	}
	/**
	 * @param {function|null} transformFunc 
	 * @returns {Subscription<StreamValue>}
	 */
	createTransform(transformFunc) {
		if (!transformFunc)
			return this;
			
		// optimize by breaking the reference : TODO: benchmark
		const functionBody = transformFunc.toString().match(/\{.*\}\s*$/);
		if (process.env.NODE_ENV === 'development') {
			if (!functionBody)
				throw new ComponentError(this, 'probably malformed transform function, unable to parse function body', transformFunc);
		}
		var f = new Function('value', `${functionBody}`);
		this.transform = f;
		return this;
	}
	/**
	 * @param {StreamValue} value 
	 */
	execute(value) {
//		console.log('%c %s %c %s', 'color:coral', 'Subscription "execute"', 'color:firebrick', 'Stream : ' + this._stream.name, 'value', value);
		let shouldExecute = true, val, desc;
		if (value !== undefined) {
			if (this.filter)
				shouldExecute = this.filter(value);
			if (shouldExecute && this.map)
				val = this.map(value);
			if (shouldExecute && this.transform)
				val = this.transform(value);
			else if (shouldExecute)
				val = value;
			else
				return;
			
			if (this.downStream)
				this.downStream.next = val;
			// second case shall only be reached if no prop is given : on a "reflected" subscription by a child component
			// else if (this.subscriber.obj && (desc = Object.getOwnPropertyDescriptor(this.subscriber.obj, 'value')) && typeof desc.set === 'function')
			// 	this.subscriber.obj.value = val;
			else if (this.effect !== null)
				this.effect(val);
		}
	}
	/**
	 * 
	 * @param {string} subscriberUID 
	 * @param {string} subscriberType 
	 * @returns {Subscription<StreamValue>} 
	 */
	unAnonymize(subscriberUID, subscriberType) {
		this._subscriberUID = subscriberUID;
		this._subscriberType = subscriberType;
		return this;
	}

	/** @virtual hot-assigned by the Stream Instance */
	unsubscribe() {

	}
}

export default Subscription;