/**
 * @module toolingFunction
 */

/**
 * @template {keyof HTMLElementTagNameMap|string} tagName
 * @typedef {import('../view/ComponentView.js').ComponentView} ComponentView
 * @typedef {import('../reactivity/Stream.js').Stream<unknown>} Stream
 */

import toolingEvents from './ToolingEvents';
import toolingEventsStack from './toolingEventsStack';



/** 
 * @template effectCtxVal
 * @param {string} regUID
 * @param {keyof toolingEvents} type
 * @param {effectCtxVal} value */
export default (regUID, type, value) => {
    /** @returns {effectCtxVal} */
    return () => {
        const event = new toolingEvents[type](regUID);
        event.warning();
        toolingEventsStack.push(event);
        return value;
    } 
}