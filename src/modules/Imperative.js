/**
 * @module Imperative
 */

const {ComponentError} = require('../error/Error');
const {Stream} = require('../reactivity/Stream');
const registries = require('../Registries');

class Imperative{
    /** @type {string} */
    name;
    /** @type {string} */
    uuid;
    /** @type {string} */
    streamName;
    /** @type {InstanceType<Stream>|null} */
    stream = null;
    /**
     * @param {string} uuid 
     * @param {string} name 
     * @param {string} streamName 
     */
    constructor(uuid, name, streamName) {
        this.uuid = uuid;
        this.name = name;
        this.streamName = streamName;
    }
    
    execute() {
        let stream;
        if (!this.stream)
            stream = registries.streams.get(this.uuid)?.get(this.streamName);
        else 
            stream = this.stream;
        if (!stream || !this.getPayload)
            throw new ComponentError(this, 'Failed bundling: an Imperative hasn\'t been bound to a stream. Stream name:', this.streamName, 'templateUID', this.templateUID)
        
        stream.value = this.getPayload();
        this.stream = stream;
    }
    /** @type{function|null} */
    getPayload = null;
}

class ImperativeLocator {
    constructor() {
        throw new Error("ImperativeLocator is static-only; do not instantiate.");
    }
    /**
     * @param {string} name
     * @param {string} streamName 
     */
    static locateImperative(name, streamName) {
        for (const UID in registries.imperatives) {
            const registry = registries.imperatives.get(UID);
            for (const n in registry) {
                const imperative = registry.get(n);
                if (name === n && imperative.streamName === streamName)
                    return imperative;
            }
        }
    }
}


export default {
    Imperative,
    ImperativeLocator
}