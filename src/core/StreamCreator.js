/**
 * @module StreamFactory
 */

const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const registries = require('src/coreTest/Registries');
const {Stream} = require('src/coreTest/CoreTypes');

class StreamFactory {
    constructor() {
        throw new Error("StreamFactory is static-only; do not instantiate.");
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