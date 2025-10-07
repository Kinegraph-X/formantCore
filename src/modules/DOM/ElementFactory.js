/**
 * @module ElementFactory
 */
/**
 * @typedef {import('../template/TemplateFactory').AbstractPropArray} AbstractPropArray
 * @typedef {import('../reactivity/Stream').default<unknown>} Stream
 */

import { HTMLCustomElement, HTMLCustomElementFactory } from './Factories.js';


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

export default ElementFactory;