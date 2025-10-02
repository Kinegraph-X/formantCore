/**
 * @module StreamCreator
 */

import registries from '../Registries';
import Stream from './Stream';

class StreamCreator {
    constructor() {
        throw new Error("StreamCreator is static-only; do not instantiate.");
    }
    
    /** @param {ComponentWithView} component */
    static createStreams(component) {
        const regUID = component.regUID;
        const registry = new Map();
        registries.streams.set(regUID, registry);
        
        registries.prop.get(regUID).forEach((prop) => {
            registry.set(prop.getName(), new Stream(prop.getName(), prop.getValue(), component));
        });
        registries.state.get(regUID).forEach((state) => {
            registry.set(state.getName(), new Stream(state.getName(), state.getValue(), component));
        });
    }
}

export default StreamCreator;