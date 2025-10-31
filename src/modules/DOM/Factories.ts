/**
 * @module DOM/Factories
 */

/**
 * @typedef {import('../template/TemplateFactory').AttributeArray} AttributeArray
 * @typedef {import('../template/TemplateFactory').PropArray} PropArray
 * @typedef {import('../template/TemplateFactory').StateArray} StateArray
 * @typedef {import('../template/TemplateFactory').AbstractPropArray} AbstractPropArray
 * @typedef {import('../template/TemplateFactory').State} State
 * @typedef {import('../reactivity/Stream').default<unknown>} Stream
 */


import {ComponentError } from '../error/Error.js';
import {Logger} from '../log/Logger.js';
import StreamToDomInterface from '../reactivity/StreamToDomInterface.js';
import { tryParseBoolean } from '../nativeTypesUtilities/BooleanUtilities.js';

import {
    type AttributeArray,
    type StateArray
} from '../template/Prop.js'
import type Stream from '../reactivity/Stream';


class BaseElementFactory {
    constructor() {
        throw new Error("BaseElementFactory is static-only; do not instantiate.");
    }
    /** @param {string} nodeName */
    static createElement(nodeName : string) {
        return document.createElement(nodeName);
    }
}

class HTMLElementFactory extends BaseElementFactory {
}

class HTMLDivElementFactory extends HTMLElementFactory {
    static createElement() {
        return document.createElement('div');
    }
}






type AttributeValue = string|number|null|undefined;
type StateValue = string|number|null|undefined;

export class HTMLCustomElement extends HTMLElement {
    /** @type {string[]} */
    static observedStates : string[] = [];
    /** @type {Map<string, Stream>} */
    #streams = new Map();
    /** @type {string[]} */
    #nonProtectedObservedStates : string[] = [];
    /** @type {(string|number|boolean|null|undefined)[]} */
    #stateInitialValues : StateValue[] = [];

    constructor() {
        super();
        this.attachShadow({mode : 'open'});
        this.#stateReflection();
    }
    static get observedAttributes() {
        return this.observedStates;
    }
    #stateReflection() {
        /** @type {typeof HTMLCustomElement} */
        (this.constructor as typeof HTMLCustomElement).observedStates.forEach(
            (stateName, key) => {
                const name = stateName as keyof HTMLElement;
                if (!HTMLElement.prototype[name]) {
                    let stream;
                    if (!(stream = this.#streams.get(stateName))) {
                        const thisArg = this as unknown as typeof HTMLCustomElement;
                        throw new ComponentError(this, 'Unknown custom-element creation error: a State doesn\'t correspond to a Stream', thisArg.observedStates, this.#streams);
                    }
                    Object.defineProperty(this, stateName, StreamToDomInterface.getPropertyDescriptor.bind(this, stream));
                }
                else {
                    delete this.#nonProtectedObservedStates[key];
                    Logger.debug(this, 'Given State in custom-element overlaps a native dom property:', stateName);
                }
            }
        )
    }
    /** @param {string|number|null|undefined} AttributeValue*/
    #getTypedValue(attrValue : AttributeValue) {
        let ret;
        if (typeof attrValue === 'string')
            return tryParseBoolean(attrValue);
        /** @ts-ignore hacked type-check */
        else if (!isNaN((ret = parseInt(attrValue))))
            return ret;
        else
            console.error('Attribute value', attrValue, 'is neither string, or number, nor boolean', this)
    }
    connectedCallback() {
        /** @type {typeof HTMLCustomElement} */
        (this.constructor as typeof HTMLCustomElement).observedStates.forEach((stateName, key) => {
            /** @ts-ignore overridden native props have been checked */
            this[stateName] = this.#stateInitialValues[key];
            // Initial setup, don't define if given value is empty/nullable
            if (!this.#stateInitialValues[key])
                return;
            // We rely on DOM type-conversion-to-string for non-nullable values
            this.setAttribute(stateName, this.#stateInitialValues[key] as string);
        });
    }
    /** @param {AbstractPropArray} attributes */
    setAttributes(attributes : AttributeArray) {
        attributes.forEach(
            (attrObject) => {
                const name = (attrObject.getName());
                if (this.#nonProtectedObservedStates.includes(name)) {
                    // We've avoided here to check at runtime for some read-only properties, like "document": 
                    // so typed any, as keyof HTMLElement containes those read-only props
                    // and wouldn't allow assignation
                    const thisArg = this as unknown as {[key: string]: unknown};
                    /** @type {} */ (thisArg)[name] = attrObject.getValue();
                }
            }
        );
    }
    /**
     * @param {string} attrName 
     * @param {string} oldVal 
     * @param {string} newVal 
     */
    attributeChangedCallback(
        attrName : string,
        oldVal : string,
        newVal : string
    ) {
        if (this.#nonProtectedObservedStates.includes(attrName)) {
            // We've avoided here to check at runtime for some read-only properties, like "document":
            // so typed any, as keyof HTMLElement containes those read-only props
            // and wouldn't allow assignation
            const thisArg = this as unknown as {[key: string]: unknown};
            thisArg[attrName] = this.#getTypedValue(newVal);
        }
    }
}




/**
 * @param {string} nodeName 
 * @param {AbstractPropArray|[]} states 
 * @param {Map<string, Stream>} streams 
 */
const defineCustomElem = (
    nodeName : string,
    states : StateArray | [],
    streams : Map<string, Stream<unknown>>
) => {
    const observedStates = states.map(
        /** @param {State} state */
        (state) => state.name
    );
    const stateInitialValues = states.map(
        /** @param {State} state */
        (state) => state.value
    );
    
    /**
     * @extends HTMLCustomElement
     */
    class HTMLExtendedElement extends HTMLCustomElement {
        /** @type {string[]} */
        static observedStates : string[] = observedStates.slice(0);
        /** @type {string[]} */
        #nonProtectedObservedStates : string[] = observedStates.slice(0);
        /** @type {StateValue[]} */
        #stateInitialValues : StateValue[] = stateInitialValues.slice(0);
    }
    customElements.define(nodeName, HTMLExtendedElement);
}

export class HTMLCustomElementFactory {
    static factoryType = HTMLCustomElement;
    constructor() {
        throw new Error("HTMLCustomElementFactory is static-only; do not instantiate.");
    }
    /** 
     * @param {string} nodeName
     * @param {AbstractPropArray|[]} states 
     * @param {Map<string, Stream>} streams
     * @return {HTMLCustomElement}
     */
    static createElement(
        nodeName : string,
        states : StateArray | [],
        streams : Map<string, Stream<unknown>>
    ) {
        if (!customElements.get(nodeName)) {
			defineCustomElem(nodeName, states, streams);
		}
        return document.createElement(nodeName) as HTMLCustomElement;
    }
}



