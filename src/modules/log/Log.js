/**
 * @module Log
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
    static debugLevel = 0;
    constructor() {
        throw new Error ('Logger: this is a static class. The constructor must not be called.');
    }

    /**
     * @param {object} instance 
     * @param {string} message 
     * @param  {...unknown} context 
     */
    static debug(instance, message, ...context) {
        if (this.debugLevel > 0)
            console.log(getType(instance), message, ...context);
    }

    /**
     * @param {object} instance 
     * @param {string} message 
     * @param  {...unknown} context 
     */
    static debugWarn(instance, message, ...context) {
        if (this.debugLevel > 0)
            console.warn(getType(instance), message, ...context);
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



export default Logger