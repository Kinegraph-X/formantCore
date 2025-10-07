/**
 * @module EventEmitter
 */

/**
 * @typedef {import('../component/Component').ComponentWithView<string>} ComponentWithView
 */

/**
 * @template EventPayload
 */
class FrameworkEvent {
    /** @type {string} */
    type;
    /** @type {Event|null} */
    nativeEvent;
    /** @type {string} */
    regUID;
    /** @type {number} */
    key;
    /** @type {EventPayload} */
    payload;
    /**
     * @param {string} type
     * @param {string} regUID
     * @param {number} key
     * @param {EventPayload} data
     * @param {boolean} bubble
     * @param {Event|null} nativeEvent
     */
    constructor(type, regUID, key, data, bubble = false, nativeEvent = null) {
        this.type = type;
        this.regUID = regUID;
        this.key = key;
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
	 * @param {function} handler : the handler to add 
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
	 * @param {boolean} [bubble]
	 */ 
	trigger(nativeEvent = null, regUID, key, payload, bubble) {
		for(let i = 0, l = this.eventHandlers.length; i < l; i++) {
				this.eventHandlers[i](
                    new FrameworkEvent(
                        this.eventType,
                        regUID,
                        key,
                        payload,
                        bubble,
                        nativeEvent
                    )
                );
		}
	}
    /**
     * Virtual implem: shall be hot-overridden via "@output() myEvent = new Eventtriggerter<unknown>('name)" declaration in component class
     * @param {EventPayload} [payload]
     * @param {boolean} [bubble]
     */
    emit(payload, bubble) {
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
         * @param {boolean} [bubble]
         */
        return function(payload, bubble = false) {
            eventEmitter.trigger(
                null,
                component.regUID,
                component.key,
                payload,
                bubble
            );
        }
    }
}


export {
    FrameworkEvent,
    EventEmitter
}