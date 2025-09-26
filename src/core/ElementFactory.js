/**
 * @module ElementFactory
 */
/**
 * @typedef {import('src/coreTest/TemplateFactory').AbstractPropArray} AbstractPropArray
 * @typedef {import('src/coreTest/CoreTypes').Stream<unknown>} Stream
 */

const {HTMLCustomElement, HTMLCustomElementFactory} = require('src/coreTest/DOM/Factories');


class ElementFactory {
    constructor() {
        throw new Error("ElementFactory is static-only; do not instantiate.");
    }
    /**
     * @template {keyof HTMLElementTagNameMap} K
     * @param {K} nodeName 
     * @returns {HTMLElementTagNameMap[K]}
     */
    static createElement(nodeName) {
		return document.createElement(nodeName);
	}
    /**
     * @template customTagName
     * @param {customTagName} nodeName 
     * @param {AbstractPropArray|[]} states
     * @param {Map<string, Stream>} streams 
     * @returns {HTMLCustomElement<customTagName>}
     */
    static createCustomElement(nodeName, states = [], streams = new Map()) {
		return HTMLCustomElementFactory.createElement(nodeName, states, streams);
	}
    
}

module.exports = ElementFactory;