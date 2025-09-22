/**
 * @module StreamFactory
 */

const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const registries = require('src/core/Registries');
const {Stream} = require('src/core/CoreTypes');

class StreamFactory {
    constructor() {
        throw new Error("StreamFactory is static-only; do not instantiate.");
    }
    // If we move template reconciliation outside of the component
    // no need anymore to traverse the component list here
    // Moreover, why register streams on the component ?
    // because of the view: question that.(component as a fiber)
    /** @param {ComponentWithView} component */
    static createStreams(component) {
        // for (let _templateUID in registries.component) {
            // const component = registries.component.get(_templateUID);
            registries.prop.get(component._templateUID).forEach((prop) => {
                component.streams[prop.getName()] = new Stream(prop.getName(), prop.getValue(), component);
            });
            registries.state.get(component._templateUID).forEach((state) => {
                component.streams[state.getName()] = new Stream(state.getName(), state.getValue(), component);
            });
        // }
    }
}