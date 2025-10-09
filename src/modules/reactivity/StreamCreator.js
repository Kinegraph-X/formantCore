/**
 * @module StreamCreator
 */

import {ComponentError} from '../error/Error';
import registries from '../Registries';
import Stream from './Stream';

/**
 * @typedef {import('../component/Component.js').ComponentWithView} ComponentWithView
 */

class StreamCreator {
    constructor() {
        throw new Error("StreamCreator is static-only; do not instantiate.");
    }
    
    /** @param {ComponentWithView} component */
    static createStreams(component) {
        const regUID = component.regUID;
        const registry = new Map();
        registries.streams.set(regUID, registry);

        const props = registries.prop.get(regUID);
        /** @debug-build start */
        if (!props)
            throw new ComponentError(component, 'StreamCreator unknown error: props entry not found in props registry. UID is', regUID);
        /** @debug-build end */

        props.forEach((prop) => {
            registry.set(prop.getName(), new Stream(prop.getName(), prop.getValue()));
        });

        const states = registries.state.get(regUID);
        /** @debug-build start */
        if (!states)
            throw new ComponentError(component, 'StreamCreator unknown error: states entry not found in states registry. UID is', regUID);
        /** @debug-build end */

        states.forEach((state) => {
            registry.set(state.getName(), new Stream(state.getName(), state.getValue()));
        });
    }
}

export default StreamCreator;