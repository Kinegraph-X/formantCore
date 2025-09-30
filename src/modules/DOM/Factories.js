/**
 * @module DOM/Factories
 */

/**
 * @typedef {import('src/coreTest/TemplateFactory').AbstractPropArray} AbstractPropArray
 * @typedef {import('src/coreTest/TemplateFactory').State} State
 * @typedef {import('src/coreTest/CoreTypes').Stream<unknown>} Stream
 */


import { Logger, ComponentError } from '../error/Error&Log.js';
import StreamToDomInterface from '../reactivity/StreamToDomInterface.js';
import { tryParseBoolean } from '../nativeTypesUtilities/BooleanUtilities.js';



class BaseElementFactory {
    static factoryType = HTMLElement;
    constructor() {
        throw new Error("BaseElementFactory is static-only; do not instantiate.");
    }
    /** @param {string} nodeName */
    static createElement(nodeName) {
        return document.createElement(nodeName);
    }
}

class HTMLElementFactory extends BaseElementFactory {
    static factoryType = HTMLElement;
}
class HTMLDivElementFactory extends BaseElementFactory {
    static factoryType = HTMLDivElement;
}








/**
 * @template customTagName
 */
class HTMLCustomElement extends HTMLElement {
    /** @type {string[]} */
    static observedStates = [];
    /** @type {Map<string, Stream>} */
    #streams = new Map();
    /** @type {string[]} */
    #nonProtectedobservedStates = [];
    /** @type {(string|number|boolean|null|undefined)[]} */
    #stateInitialValues = [];
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
        (this.constructor).observedStates.forEach(
            (stateName, key) => {
                const name = /** @type {keyof HTMLElement}*/ (stateName);
                if (!HTMLElement.prototype[name]) {
                    let stream;
                    if (!(stream = this.#streams.get(stateName))) {
                        throw new ComponentError(this, 'Unknown custom-element creation error: a State doesn\'t correspond to a Stream', /** @type {typeof HTMLCustomElement}*/ (this).observedStates, this.#streams);
                    }
                    Object.defineProperty(this, stateName, StreamToDomInterface.getPropertyDescriptor.bind(this, stream));
                }
                else {
                    delete this.#nonProtectedobservedStates[key];
                    Logger.debug(this, 'Given State in custom-element overlaps a native dom property:', stateName);
                }
            }
        )
    }
    /** @param {string|number|null|undefined} attrValue*/
    #getTypedValue(attrValue) {
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
        (this.constructor).observedStates.forEach((stateName, key) => {
            /** @ts-ignore native overrides have been checked */
            this[stateName] = this.#stateInitialValues[key];
            if (!this.#stateInitialValues[key])
                return;
            // We rely on DOM type-conversion-to-string for other values
            this.setAttribute(stateName, /** @type {string} */ (this.#stateInitialValues[key]));
        });
    }
    /** @param {AbstractPropArray} attributes */
    setAttributes(attributes) {
        attributes.forEach(
            (attrObject) {
                const name = (attrObject.getName());
                if (this.#nonProtectedobservedStates.includes(name)) {
                    this[/** @type {keyof HTMLElement}*/ (name)] = attrObject.getValue();
                }
            }
        );
    }
    /**
     * @param {string} attrName 
     * @param {string} oldVal 
     * @param {string} newVal 
     */
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (this.#nonProtectedobservedStates.includes(attrName)) {
            this[/** @type {keyof HTMLElement}*/ (attrName)] = this.#getTypedValue(newVal);
        }
    }
}




/**
 * @template customTagName
 * @param {customTagName} nodeName 
 * @param {AbstractPropArray|[]} states 
 * @param {Map<string, Stream>} streams 
 */
const defineCustomElem = (nodeName, states, streams) {
    const observedStates = states.map(
        /** @param {State} state */
        (state) => state.name
    );
    const stateInitialValues = states.map(
        /** @param {State} state */
        (state) => state.value
    );
    
    /**
     * @extends HTMLCustomElement<customTagName>
     */
    class HTMLExtendedElement extends HTMLCustomElement {
        /** @type {string[]} */
        static observedStates = observedStates.slice(0);
        /** @type {string[]} */
        #nonProtectedobservedStates = observedStates.slice(0);
        /** @type {(string|number|boolean|null|undefined)[]} */
        #stateInitialValues = stateInitialValues.slice(0);
    }
    customElements.define(/**@type{string}*/(nodeName), HTMLExtendedElement);
}

class HTMLCustomElementFactory {
    static factoryType = HTMLCustomElement;
    constructor() {
        throw new Error("HTMLCustomElementFactory is static-only; do not instantiate.");
    }
    /** 
     * @template customTagName
     * @param {customTagName} nodeName
     * @param {AbstractPropArray|[]} states 
     * @param {Map<string, Stream>} streams
     * @return {HTMLCustomElement<customTagName>}
     */
    static createElement(nodeName, states, streams) {
        if (!customElements.get(/**@type{string}*/(nodeName))) {
			defineCustomElem(nodeName, states, streams);
		}
        return /** @type {HTMLCustomElement<customTagName>}*/ (document.createElement(/**@type{string}*/(nodeName)));
    }
}




export { HTMLCustomElement, HTMLCustomElementFactory };