/**
 * @module WorkerWrapper
 */

/**
 * @typedef {import('../component/Component').ComponentWithView} ComponentWithView
 */

import {defUIDGenerator} from '../UIDGenerator.js';
import {EventEmitter} from '../reactivity/EventEmitter.js';

const workerExceptionMessage = 'Worker MessageType normalization failed';

/**
 * @typedef {object} WorkerMessageType
 * @property {'event'} event
 * @property {'error'} error
 * @property {'warning'} warning
 */
/** @type {WorkerMessageType} */
const WorkerMessageType = {
	event : 'event',
	error : 'error',
	warning : 'warning'
};




/**
 * @param {unknown} value
 * @returns {value is { type: string }}
 */
function workerMessageTypeGuard(value) {
	return typeof value === 'object' && value !== null && 'type' in value;
  }



/**
 * WorkerMessage
 * a type normalization
 */
class WorkerMessage {
	/** @type {string} */
	type = '';
	/** @type {string|null} */
	id = null;
	/** @type {unknown|null} */
	payload = null;
	/** @type {string|null} */
	cause = null;
	
	/**
	 * @param {{type : string, id?: string, payload?: unknown, cause?: string}} untypedMessage
	 */
	constructor (untypedMessage) {
		this.type = untypedMessage.type;				// string (already tested)
		if (typeof untypedMessage.id === 'string')
			this.id = untypedMessage.id;			// string (optional but here defined by default)
		if (untypedMessage.payload)
			this.payload = untypedMessage.payload; //  (optional, any object, as the worker is accross an interface boundary)
		if (typeof untypedMessage.cause === 'string')
			this.cause = untypedMessage.cause		// string (optional, only if type is "error" or "warning")
	}
	/**
	 * @param {unknown} untypedMessage
	 * @returns {WorkerMessage|undefined}
	 */
	static normalize(untypedMessage) {
		if (!workerMessageTypeGuard(untypedMessage) || !(untypedMessage.type in WorkerMessageType)) {
			console.warn(workerExceptionMessage + ': maybe you\'re communicating with an external worker');
			return undefined;
		}
  		return new WorkerMessage(/** @type {{type : string}} */ untypedMessage);
	}
}


/**
 * @template WorkerMessageHandler
 */


/**
 * WorkerWrapper
 * A class to comunicate with a js worker more easily
 * - post a task and a payload (use optimized serialization when possible)
 * - receive different responses from a worker, allowing to bind a handler on each response type
 * 
 * User code passing a stringified worker should call the destroy() method to clear the url object
 * extends {EventEmitter<WorkerMessage|MessageEvent<unknown>>}
 */
class WorkerWrapper {
	/** @type {string} */
	static objectType = 'WorkerWrapper';
	/** @type {string} */
	regUID;
	/** @type {string} */
	name = '';
	/** @type {Object<string, function>} */ //WorkerMessageHandler
	#_responseHandler = {};
	/** @type {Worker|null} */
	#worker = null;
	/** @type {string|null} */
	#blobURL = null;
	
	/**
	 * @param {string} workerName
	 * @param {string|null} [stringifiedWorker] (optional if url is defined)
	 * @param {string} [url] 
	 */
	constructor(workerName, stringifiedWorker, url) {
		/*dummy for Component compat*/ this.regUID = defUIDGenerator.newUID();
		this.name = workerName;
		this.message = new EventEmitter('message');
		const thisProp = /**@type{unknown}*/(this);
		this.message.emit = EventEmitter.getTriggerFunction(/**@type {ComponentWithView}*/(thisProp), this.message)
		
		if (stringifiedWorker) {
			const blob = new Blob([stringifiedWorker], {type: 'application/javascript'});
			this.#blobURL = window.URL.createObjectURL(blob);
			this.#worker = new Worker(this.#blobURL);
		}
		else if (url) {
			this.#worker = new Worker(url);
			this.#worker.onmessage = this.#handleResponse.bind(this);
			this.#worker.onerror = this.#workerHandleError.bind(this);
			this.#worker.onmessageerror = this.#workerHandleMessageError.bind(this);
		}
		else {
			console.error(this.name + ': WorkerWrapper requires passing a "stringifiedWorker" or an "url" param');
		}
	}
	
	/**
	 * Meant to be passed as an event-handler, like "parser.postMessage.bind(parser, 'init')"
	 * @param {string} action
	 * @param {unknown} [payload]
	 */
	postMessage(action, payload) { 	// e.g for the mp4Parser.worker : e.data = File Object (blob)
		// syntax [(messageContent:any)arg0, (transferableObjectsArray:[transferable, transferable, etc.])arg1]
		if (typeof payload === 'undefined')
			this.#worker?.postMessage([action]);
		else if (payload instanceof ArrayBuffer)
			this.#worker?.postMessage([action, payload], [payload]);
		else
			this.#worker?.postMessage([action, payload]);
	}
	
	/**
	 * @param {string} handlerName
	 * @param {function} handler
	 */
	addResponseHandler(handlerName, handler) {
		if (typeof handler === 'function')
			this.#_responseHandler[handlerName] = handler;
	}
	
	/**
	 * @param {WorkerMessage|MessageEvent<unknown>} response may be normalized as WorkerMessage in this method, or unknown if you don't own the code of the worker
	 */
	#handleResponse(response) {
		const normalizedMessage = WorkerMessage.normalize(response);
		const warningMessage = 'Formant Worker: name: "' + this.name + '" => No handler found for response event type.';
		
		if (!normalizedMessage) {	// allows not following our custom spec
			if (typeof response === 'string') {
				if (typeof this.#_responseHandler[response] === 'function') {
					this.#_responseHandler[response]();
				}
				else {
					console.warn(warningMessage + ' response is ' + response);
				}
			}
		}
		else {
			if (normalizedMessage.type === WorkerMessageType.error || normalizedMessage.type === WorkerMessageType.warning) {
				this.#handleMessageError(normalizedMessage);
				this.message.emit(normalizedMessage);
				return;
			}
			if (normalizedMessage.id !== null && typeof this.#_responseHandler[normalizedMessage.id] === 'function') {
				this.#_responseHandler[normalizedMessage.id](normalizedMessage.payload);
				this.message.emit(normalizedMessage);
				return;
			}
			else {
				console.warn(warningMessage + ' eventID is ' + normalizedMessage.id);
			}
		}
		
		this.message.emit(response);
	}
	
	/**
	 * Generic error handling
	 * @param {ErrorEvent} e
	 */
	#workerHandleError(e) {
		console.error('Generic Worker Error:', e);
	}
	
	/**
	 * Generic error handling
	 * @param {MessageEvent} e
	 */
	#workerHandleMessageError(e) {
		console.error('Generic Worker Message Error:', e);
	}
	
	/**
	 * Specific error handling (from normalized message)
	 * @param {WorkerMessage} message
	 */
	#handleMessageError(message) {
		const errMessage = 'Formant Worker failure: ';
		switch (message.type) {
			case WorkerMessageType.error :
				console.error(errMessage + this.name + ' ' + message.cause);
				break;
			case WorkerMessageType.warning :
				console.warn(errMessage + this.name + ' ' + message.cause);
				break;
			default : break;
		}
	}
	
	destroy() {
		URL.revokeObjectURL(this.#blobURL || '');
	}
}

export {
	WorkerWrapper,
	WorkerMessage
}