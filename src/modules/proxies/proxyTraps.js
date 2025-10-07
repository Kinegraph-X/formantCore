/**
 * @module proxyTraps
 */

import {ComponentError} from '../error/Error.js'; 
import toolingEvents from '../tooling//ToolingEvents.js';
import toolingEventsStack from '../tooling/toolingEventsStack.js';

/**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {string} prop 
     * @param {...any} args
     * @returns 
     */
function stackToolingEvent(regUID, type, prop, ...args) {
    const event = new toolingEvents[type](regUID, prop, ...args);
    event.warning();
    toolingEventsStack.push(event);
}

export const viewStrategyTrap = {
    /**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {any} target 
     * @param {string} prop 
     * @param {any} receiver 
     * @returns 
     */
    get(regUID, type, target, prop, receiver) {
        const value = target[prop];
        if (typeof value !== 'undefined') {
            if (value instanceof Function) {
                return () => {
                    stackToolingEvent(regUID, type, prop, ...arguments);
                    target[prop].apply(target, ...arguments);
                }
            }
            stackToolingEvent(regUID, type, prop);
            return value;
        }
        else {
            throw new ComponentError(this, 'Forbidden Access to a not-implemented method on a view-strategy:', prop, target);
        }
    },
    /**
     * @param {any} target 
     * @param {string} prop 
     * @param {any} value
     * @param {any} receiver 
     * @returns 
     */
    set(target, prop, value, receiver) {
        throw new ComponentError(this, 'methods of a view-strategy connot be hot-overridden', prop, target);
    }
};

export const viewTrap = {
    /**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {any} target 
     * @param {string} prop 
     * @param {any} receiver 
     * @returns 
     */
    get(regUID, type, target, prop, receiver) {
        const value = target[prop];
        if (typeof value !== 'undefined') {
            if (value instanceof Function) {
                return () => {
                    stackToolingEvent(regUID, type, prop, ...arguments);
                    target[prop].apply(target, ...arguments);
                }
            }
            stackToolingEvent(regUID, type, prop);
            return value;
        }
        else {
            throw new ComponentError(this, 'Forbidden Access to a not-implemented method on a view:', prop, target);
        }
    },
    /**
     * @param {any} target 
     * @param {string} prop 
     * @param {any} value
     * @param {any} receiver 
     * @returns 
     */
    set(target, prop, value, receiver) {
        throw new ComponentError(this, 'methods of a view connot be hot-overridden', prop, target);
    }
};

export const elementTrap = {
    /**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {any} target 
     * @param {string} prop 
     * @param {any} receiver 
     * @returns 
     */
    get(regUID, type, target, prop, receiver) {
        const implem = target[prop];
        if (typeof implem !== 'undefined') {
           if (implem instanceof Function) {
                return () => {
                    stackToolingEvent(regUID, type, prop, ...arguments);
                    implem.apply(target, ...arguments);
                }
            }
            else {
                stackToolingEvent(regUID, type, prop);
                return implem;
            }
        }
        else {
            throw new ComponentError(this, 'Forbidden Access to a DOM element, non-existing property:', prop, target);
        }
    },
    /**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {any} target 
     * @param {string} prop 
     * @param {any} value
     * @param {any} receiver 
     * @returns 
     */
    set(regUID, type, target, prop, value, receiver) {
        const implem = target[prop];
        if (typeof implem === 'undefined')
            throw new ComponentError(this, 'Forbidden Access to a DOM element, non-existing property:', prop, target);
        else if (implem instanceof Function)
            throw new ComponentError(this, 'Forbidden Access to a DOM element, native functions aren\'t overridable:', prop, target);
        else {
            stackToolingEvent(regUID, type, prop, value);
            target[prop] = value;
        }
        return true;
    }
};

// export const streamMapTrap = {
//     get(target, prop, receiver) {
//         if (prop !== 'get' && prop !== 'has')
//             throw new Error('Forbidden Write on an EffectCtx:', prop);
//         return () => {
//             target[prop].apply(target, ...arguments);
//         }
//     },
//     set(obj, prop, value) {
//         throw new Error('Forbidden Write on an EffectCtx:', prop);
//     }
// };

export const viewArrayTrap = {
    /**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {any} target 
     * @param {string} prop 
     * @param {any} receiver 
     * @returns 
     */
    get(regUID, type, target, prop, receiver) {
        stackToolingEvent(regUID, type, prop);
        return target[prop];
    },
    /**
     * @param {any} target 
     * @param {string} prop 
     * @param {any} value
     * @param {any} receiver 
     * @returns 
     */
    set(target, prop, value, receiver) {
        throw new ComponentError(this, 'views connot be hot-overridden', prop, target);
    }
}

export const streamTrap = {
    /**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {any} target 
     * @param {string} prop 
     * @param {any} receiver 
     * @returns 
     */
    get(regUID, type, target, prop, receiver) {
        if (prop !== 'next')
            throw new ComponentError(this, 'Forbidden access on a Stream:', prop, 'Only the "next" prop is read/write', target);

        stackToolingEvent(regUID, type, prop);
        return target[prop];
    },
    /**
     * @param {string} regUID 
     * @param {keyof toolingEvents} type 
     * @param {any} target 
     * @param {string} prop 
     * @param {any} value
     * @param {any} receiver 
     * @returns 
     */
    set(regUID, type, target, prop, value, receiver) {
        if (prop !== 'next')
            throw new ComponentError(this, 'Forbidden write on a Stream:', prop, 'Only the "next" prop is read/write', target);
        return () => {
            stackToolingEvent(regUID, type, prop, ...arguments);
            target[prop].apply(target, ...arguments);
        }
    }
};