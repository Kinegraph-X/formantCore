/**
 * @module Error
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

export default ComponentError