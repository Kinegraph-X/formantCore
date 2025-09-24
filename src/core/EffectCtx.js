/**
 * @module StreamCtxProvider
 */
/**
 * @typedef {import('src/coreTest/CoreTypes.js').ComponentView} ComponentView
 * @typedef {import('src/coreTest/CoreTypes.js').Stream} Stream
 */
const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const registries = require('src/coreTest/Registries');

class EffectCtx {
    /** @type {ComponentView} */
    view;
    /** @type {ComponentView[]} */
    subViews;
    /** @type {ComponentView[]} */
    memberViews;
    /** @type {HTMLElement} */
    element;
    /** @type {ShadowRoot|null} */
    shadowRoot;
    /** @type {Map<string, Stream>} */
    streams;
    /**
     * @param {string} regUID 
     */
    constructor(regUID) {
        const component = registries.component.get(regUID);
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        this.view = component.view;
        this.element = component.view.getMasterNode();
        const shadowRoot = component.view.getWrappingNode();
        this.shadowRoot = this.element !== shadowRoot ? shadowRoot : null;
        this.subViews = component.subViews;
        this.memberViews = component.memberViews;
        const streamRegistry = registries.streams.get(regUID);
        
        if (!streamRegistry)
            throw new ComponentError(this, 'Component instance not found in streams registry. UID is', regUID);
        const props = streamRegistry.get('props');
        const states = streamRegistry.get('states');
        this.streams = streamRegistry;
    }
    /**
     * 
     * @param {string} regUID 
     * @param {function} originalEffect 
     * @returns 
     */
    static getEffectFunction(regUID, originalEffect) {
        return originalEffect.bind(null, new EffectCtx(regUID));
    }
}

module.exports = EffectCtx;