/**
 * @module Error&Log
 */


/**
 * 
 * @param {object} instance 
 * @returns {string}
 */
function getType(instance) {
    const ctor = /** @type {unknown} */ (instance.constructor)
    return  /** @type {{objectType : string}} */ (ctor).objectType;
}

class Logger {
    constructor() {
        throw new Error ('Logger: this is a static class. The constructor must not be called.');
    }

    /**
     * @param {object} instance 
     * @param {string} message 
     * @param  {...unknown} context 
     */
    static log(instance, message, ...context) {
        console.log(getType(instance), message, ...context);
    }

    /**
     * @param {object} instance 
     * @param {string} message 
     * @param  {...unknown} context 
     */
    static warn(instance, message, ...context) {
        console.warn(getType(instance), message, ...context);
    }

    /**
     * @param {object} instance 
     * @param {string} message 
     * @param  {...unknown} context
     */
    static error(instance, message, ...context) {
        console.error(getType(instance), message, ...context);
    }
}

class ComponentError extends Error {
    /**
     * 
     * @param {object} instance 
     * @param {string} message 
     * @param  {...unknown} context 
     */
    constructor(instance, message, ...context) {
        super(`${getType(instance)}: ${message}`);
        Logger.error(instance, message, ...context);
        
    }
}

module.exports = {
    Logger,
    ComponentError
}