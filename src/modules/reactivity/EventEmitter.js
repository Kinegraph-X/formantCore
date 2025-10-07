/**
 * @module EventEmitter
 */

import {ComponentError} from '../error/Error';
import registries from '../Registries';

/**
 * typedef {import('../component/Component').ComponentWithView} ComponentWithView
 * @typedef {import('../reactivity/Stream.js').default<unknown>} Stream
 */

import { ComponentWithView } from '../component/Component.js';

class FrameworkEventCtx {
    /** @type {Object<string, EventEmitter<unknown>>} */
    emitters = {};
    /** @type {Map<string, Stream>} */
    streams;
    /**
     * 
     * @param {string} regUID 
     */
    constructor(regUID) {
        const component = registries.component.get(regUID);
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);

        const ctor = /** @type {unknown} */ (component.constructor);
        /** @type {typeof ComponentWithView} */ (ctor)._outputs.forEach((output) => {
            this.emitters[output] = /** @ts-ignore reflection */ 
                component[output];
        });

        const streamRegistry = registries.streams.get(regUID);
        if (!streamRegistry)
            throw new ComponentError(component, 'FrameworkEventCtx: Component instance not found in streams registry. UID is', regUID);

        this.streams = streamRegistry;
    }
}

class FrameworkEventMeta {
    /** @type {string} */
    regUID;
    /** @type {number} */
    key;

    /**
     * @param {string} regUID
     * @param {number} key
     */
    constructor(regUID, key) {
        this.regUID = regUID;
        this.key = key;
    }
}

/**
 * @template EventPayload
 */
class FrameworkEvent {
    /** @type {string} */
    type;
    /** @type {Event|null} */
    nativeEvent;
    
    /** @type {EventPayload} */
    payload;
    /**
     * @param {string} type
     * @param {EventPayload} data
     * @param {boolean} bubble
     * @param {Event|null} nativeEvent
     */
    constructor(type, data, bubble = false, nativeEvent = null) {
        this.type = type;
        this.payload = data;
        this.bubble = bubble;
        this.nativeEvent = nativeEvent;
    }
}

/**
 * @template EventPayload
 */
class EventEmitter {
	/** @type {string} */
	static objectType = 'EventEmitter';
    /** @type {string} */
    eventType;
	/** @type {function[]} */
	eventHandlers = [];

	/**
	 * @param {string} eventType
	 */
	constructor(eventType) {
        this.eventType = eventType;
    }
	
	/**
	 * @param {function} handler : the handler to remove (the associated event stays available) 
	 */
	removeEventListener(handler) {
		for(var i = 0, l = this.eventHandlers.length; i < l; i++) {
			if (this.eventHandlers[i] === handler) {
				this.eventHandlers.splice(i, 1);
			}
		}
	}
	
	/**
	 * @param {(e : FrameworkEvent<EventPayload>, ctx: FrameworkEventCtx, meta: FrameworkEventMeta) => void} handler : the handler to add 
	 */
	addEventListener(handler) {
		this.eventHandlers.push(handler);
	}
	
	/**
	 * @param {function} handler : the handler to add 
	 * @param {number} index : where to add
	 */
	addEventListenerAt(handler, index) {
		this.eventHandlers.splice(index, 0, handler);
	}
	
	/**
	 * @param {number} index : position at which to remove an handler
	 */
	removeEventListenerAt(index) {
		if (index < this.eventHandlers.length) {
			this.eventHandlers.splice(index, 1);
		}
	}
	
	/**
	 * 
	 */
	clearEventListeners() {
		this.eventHandlers.length = 0;
	}
	
	/**
     * @param {Event|null} nativeEvent
     * @param {string} regUID
     * @param {number} key
	 * @param {EventPayload} [payload]
     * @param {FrameworkEventMeta} [metaOverride]
	 * @param {boolean} [bubble]
	 */ 
	trigger(nativeEvent = null, regUID, key, payload, metaOverride, bubble) {
		for(let i = 0, l = this.eventHandlers.length; i < l; i++) {
				this.eventHandlers[i](
                    new FrameworkEvent(
                        this.eventType,
                        payload,
                        bubble,
                        nativeEvent
                    ),
                    new FrameworkEventCtx(
                        regUID
                    ),
                    metaOverride || new FrameworkEventMeta(
                        regUID,
                        key,
                    )
                );
		}
	}
    /**
     * Virtual implem: shall be hot-overridden via "@ Output() myEvent = new Eventtriggerter<unknown>('name)" declaration in component class
     * @param {EventPayload} [payload]
     * @param {FrameworkEventMeta} [metaOverride]
     * @param {boolean} [bubble]
     */
    emit(payload, metaOverride, bubble) {
        throw new Error('Unknown Event binding error: Probable missing "outputs" declaration in template. Default implementation of event-emitter hasn\'t been bound to a component.')
    }

    /**
     * @param {ComponentWithView} component
     * @param {EventEmitter<any>} eventEmitter
     */
    static getDOMTriggerFunction(component, eventEmitter) {
        /**
         * @template EventPayload
         */
        /**
         * @param {Event} nativeEvent
         */
        return function(nativeEvent) {
            eventEmitter.trigger(
                nativeEvent,
                component.regUID,
                component.key,
            );
        }
    }

    /**
     * @param {ComponentWithView} component
     * @param {EventEmitter<any>} eventEmitter
     */
    static getTriggerFunction(component, eventEmitter) {
        /**
         * @template EventPayload
         */
        /**
         * @param {EventPayload} [payload]
         * @param {FrameworkEventMeta} [metaOverride]
         * @param {boolean} [bubble]
         */
        return function(payload, metaOverride, bubble = false) {
            eventEmitter.trigger(
                null,
                component.regUID,
                component.key,
                payload,
                metaOverride,
                bubble
            );
        }
    }
}


export {
    FrameworkEvent,
    FrameworkEventCtx,
    FrameworkEventMeta,
    EventEmitter
}