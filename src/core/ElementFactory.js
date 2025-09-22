/**
 * @module ElementFactory
 */
/**
 * @typedef {import('src/coreTest/TemplateFactory').AbstractPropsArray} AbstractPropsArray
 * @typedef {import('src/coreTest/CoreTypes').Stream} Stream
 */
const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const {StreamToDomInterface} = require('src/coreTest/Coretypes');
const {camelToHyphens} = require('src/coreTest/StringUtilities');



class ElementFactory {
    constructor() {
        throw new Error("ElementFactory is static-only; do not instantiate.");
    }
    /**
     * @param {string} nodeName 
     * @param {AbstractPropsArray} states
     * @param {boolean} isCustomElem
     * @param {{[key : string]: Stream}} streams 
     * @returns {HTMLElement}
     */
    static createElement(nodeName, isCustomElem, states, streams) {
		if (isCustomElem && !customElements.get(nodeName)) {
			this.defineCustomElem(nodeName, states, streams);
		}
		return document.createElement(nodeName);
	}
    /**
     * @param {string} nodeName 
     * @param {AbstractPropsArray} states 
     * @param {{[key : string]: Stream}} streams 
     */
    static defineCustomElem(nodeName, states, streams) {
        const observedStates = states.map((state) => state.getName());
        const stateInitialValues = states.map((state) => state.getValues());

        class HTMLExtendedElement extends HTMLElement {
            /** @type {string[]} */
            observedStates = observedStates.slice(0);
            /** @type {(string|number|null|undefined)[]} */
            stateInitialValues = stateInitialValues.slice(0);
            constructor() {
                super();
                this.attachShadow({mode : 'open'});
                this.#stateReflection();
            }
            static get observedAttributes() {
				return this.observedStates;
			}
            #stateReflection() {
                observedStates.forEach((stateName) => {
                    if (!HTMLElement.prototype[stateName]) {
                        Object.defineProperty(this, stateName, StreamToDomInterface.getPropertyDescriptor.bind(this, streams[stateName]));
                    }
                })
            }
            /** @param {string|number|null|undefined} attrValue*/
            #getTypedValue(attrValue) {
                let ret;
                if (typeof attrValue === 'string')
                    return Boolean.prototype.tryParse(attrValue);
                else if (!isNaN((ret = parseInt(attrValue))))
                    return ret;
                else
                    return attrValue;
            }
            connectedCallback() {
                this.observedStates.forEach((stateName, key) => {
                    this[stateName] = this.stateInitialValues[key];
                    this.setAttribute(stateName, this.stateInitialValues[key]);
                });
            }
            /** @param {AbstractPropArray} attributes */
            setAttributes(attributes) {
                attributes.forEach(function(attrObject) {
                    node[attrObject.getName()] = attrObject.getValue();
                });
            }
            attributeChangedCallback(attrName, oldVal, newVal) {
                if (this.states.includes(attrName)) {
                    this[attrName] = this.#getTypedValue(newVal);
                }
            }
        }

        

        customElements.define(nodeName, HTMLExtendedElement);
    }
}

module.exports = ElementFactory;