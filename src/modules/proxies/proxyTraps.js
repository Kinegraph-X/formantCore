/**
 * @module proxyHandlers
 */

export const viewStrategyTrap = {
    get(target, prop, receiver) {
        const value = target[prop];
        if (typeof value !== 'undefined') {
            if (value instanceof Function) {
                return () => {
                    target[prop].apply(target, ...arguments);
                }
            }
            return value;
        }
        else {
            throw new Error('Forbidden Access to a not-implemented method on a view-strategy:', prop);
        }
    },
    set(obj, prop, value) {
        throw new Error('methods of a view-strategy connot be hot-overridden');
    }
};

export const elementTrap = {
    get(target, prop, receiver) {
        const implem = target[prop];
        if (typeof implem !== 'undefined') {
           if (implem instanceof Function) {
                return () => {
                    implem.apply(target, ...arguments);
                }
            }
            else
                return implem;
        }
        else {
            throw new Error('Forbidden Access to a DOM element, non-existing property:', prop);
        }
    },
    set(obj, prop, value) {
        const implem = target[prop];
        if (typeof implem === 'undefined')
            throw new Error('Forbidden Access to a DOM element, non-existing property:', prop);
        else if (implem instanceof Function)
            throw new Error('Forbidden Access to a DOM element, native functions aren\'t overridable:', prop);
        else
            implem = value;
    }
};

export const streamMapTrap = {
    get(target, prop, receiver) {
        if (prop !== 'get' && prop !== 'has')
            throw new Error('Forbidden Write on an EffectCtx:', prop);
        return () => {
            target[prop].apply(target, ...arguments);
        }
    },
    set(obj, prop, value) {
        throw new Error('Forbidden Write on an EffectCtx:', prop);
    }
};

export const streamTrap = {
    get(target, prop, receiver) {
        if (prop !== 'next')
            throw new Error('Forbidden access on a Stream:', prop, 'Only the "next" prop is read/write');
        return () => {
            target[prop];
        }
    },
    set(obj, prop, value) {
        if (prop !== 'next')
            throw new Error('Forbidden write on a Stream:', prop, 'Only the "next" prop is read/write');
        return () => {
            target[prop].apply(target, ...arguments);
        }
    }
};