/**
 * @module proxyTraps
 */

import toolingEvents from '../tooling//ToolingEvents.js';
import toolingEventsStack from '../tooling/toolingEventsStack.js';

function stackToolingEvent(regUID, type, prop, ...args) {
    const event = new toolingEvents[type](regUID, prop, ...args);
    event.warning();
    toolingEventsStack.push(event);
}

export const viewStrategyTrap = {
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
            throw new Error('Forbidden Access to a not-implemented method on a view-strategy:', prop, target);
        }
    },
    set(target, prop, value) {
        throw new Error('methods of a view-strategy connot be hot-overridden', prop, target);
    }
};

export const viewTrap = {
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
            throw new Error('Forbidden Access to a not-implemented method on a view:', prop, target);
        }
    },
    set(target, prop, value) {
        throw new Error('methods of a view connot be hot-overridden', prop, target);
    }
};

export const elementTrap = {
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
            throw new Error('Forbidden Access to a DOM element, non-existing property:', prop, target);
        }
    },
    set(regUID, type, target, prop, value) {
        const implem = target[prop];
        if (typeof implem === 'undefined')
            throw new Error('Forbidden Access to a DOM element, non-existing property:', prop, target);
        else if (implem instanceof Function)
            throw new Error('Forbidden Access to a DOM element, native functions aren\'t overridable:', prop, target);
        else {
            stackToolingEvent(regUID, type, prop, value);
            implem = value;
        }
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
    get(regUID, type, target, prop, receiver) {
        stackToolingEvent(regUID, type, prop);
        return target[prop];
    },
    set(target, prop, value) {
        throw new Error('views connot be hot-overridden', prop, target);
    }
}

export const streamTrap = {
    get(regUID, type, target, prop, receiver) {
        if (prop !== 'next')
            throw new Error('Forbidden access on a Stream:', prop, 'Only the "next" prop is read/write', target);

        stackToolingEvent(regUID, prop);
        return target[prop];
    },
    set(regUID, type, target, prop, value) {
        if (prop !== 'next')
            throw new Error('Forbidden write on a Stream:', prop, 'Only the "next" prop is read/write', target);
        return () => {
            stackToolingEvent(regUID, type, prop, ...arguments);
            target[prop].apply(target, ...arguments);
        }
    }
};