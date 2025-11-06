/**
 * @module StreamCreator
 */

import {ComponentError} from '../error/Error';
import registries from '../registries';
import {getProp, getStream} from '../registryAccessors';
import Stream from './Stream';

/**
 * @typedef {import('../component/Component.js').ComponentBase} Component
 */

class StreamCreator {
    constructor() {
        throw new Error("StreamCreator is static-only; do not instantiate.");
    }
    
    /** @param {Component} component */
    static createStreams(component) {
        const regUID = component.regUID;
        const registry = new Map();
        registries.streams.set(regUID, registry);

        const props = getProp(regUID);
        if (process.env.NODE_ENV === 'development') {
            if (!props)
                throw new ComponentError(component, 'StreamCreator unknown error: props entry not found in props registry. UID is', regUID);
        }

        props.forEach((prop) => {
            registry.set(prop.getName(), new Stream(prop.getName(), prop.getValue()));
        });

        const states = getStream(regUID);
        if (process.env.NODE_ENV === 'development') {
            if (!states)
                throw new ComponentError(component, 'StreamCreator unknown error: states entry not found in states registry. UID is', regUID);
        }

        states.forEach((state) => {
            registry.set(state.getName(), new Stream(state.getName(), state.getValue()));
        });
    }
}

export default StreamCreator;