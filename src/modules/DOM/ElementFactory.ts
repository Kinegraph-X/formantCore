/**
 * @module ElementFactory
 */
/**
 * @typedef {import('../template/TemplateFactory').AbstractPropArray} AbstractPropArray
 * @typedef {import('../reactivity/Stream').default<unknown>} Stream
 */

import {StateArray} from '../template/TemplateFactory';
import Stream from '../reactivity/Stream';
import { 
  type HTMLCustomElement,
  HTMLElementFactory,
  HTMLCustomElementFactory
} from './Factories.js';


class ElementFactory {
    constructor() {
        throw new Error("ElementFactory is static-only; do not instantiate.");
    }
    /**
     * @param {string} nodeName
     * @param {AbstractPropArray|[]} states
     * @param {Map<string, Stream>} streams 
     * @returns {HTMLElement}
     */
    static createElement(
        nodeName : string,
        states : StateArray,
        streams : Map<string, Stream<unknown>>
      ) {
      return HTMLElementFactory.createElement(nodeName, states, streams);
    }

    /**
     * @param {string} nodeName 
     * @param {StateArray} states
     * @param {Map<string, Stream>} streams 
     * @returns {HTMLCustomElement}
     */
    static createCustomElement(
        nodeName : string,
        states : StateArray,
        streams : Map<string, Stream<unknown>>
    ) {
      return HTMLCustomElementFactory.createElement(nodeName, states, streams);
    }
    
}

export default ElementFactory;