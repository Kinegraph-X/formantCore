/**
 * @module toolingFunction
 */

/**
 * @typedef {import('src/coreTest/CoreTypes.js').ComponentView} ComponentView
 * @typedef {import('src/coreTest/CoreTypes.js').Stream<unknown>} Stream
 */

const toolingEvents = require('src/coreTest/tooling/ToolingEvents');
const toolingEventsStack = require('src/coreTest/tooling/toolingEventsStack');



/** 
 * @template effectCtxVal
 * @param {string} regUID
 * @param {keyof toolingEvents} type
 * @param {effectCtxVal} value */
module.exports = (regUID, type, value) => {
    /** @returns {effectCtxVal} */
    return () => {
        const event = new toolingEvents[type](regUID);
        event.warning();
        toolingEventsStack.push(event);
        return value;
    } 
}