/**
 * @module StreamCtxProvider
 */
/**
 * @typedef {import('src/coreTest/CoreTypes.js').ComponentView} ComponentView
 * @typedef {import('src/coreTest/CoreTypes.js').Stream<unknown>} Stream
 */
const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const registries = require('src/coreTest/Registries');
const createToolingFunction = require('src/coreTest/tooling/toolingFunction');

class EffectCtx {
    /** @type {() => ComponentView} */
    view;
    /** @type {() => ComponentView[]} */
    subViews;
    /** @type {() => ComponentView[]} */
    memberViews;
    // /** @type {() => HTMLElement} */
    element;
    /** @type {() => ShadowRoot|null} */
    shadowRoot;
    /** @type {() => Map<string, Stream>} */
    streams;
    /**
     * @param {string} regUID 
     */
    constructor(regUID) {
        const component = registries.component.get(regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        this.view = createToolingFunction(regUID, 'view', component.view);
        
        this.element = createToolingFunction(regUID, 'element', component.view.node);
        const shadowRoot = component.view.wrappingNode;
        this.shadowRoot = createToolingFunction(regUID, 'shadowRoot', this.element !== shadowRoot ? shadowRoot : null);
        this.subViews = createToolingFunction(regUID, 'subViews', component.subViews);
        this.memberViews = createToolingFunction(regUID, 'memberViews', component.memberViews);

        const streamRegistry = registries.streams.get(regUID);
        /* @debug-build */
        if (!streamRegistry)
            throw new ComponentError(this, 'Component instance not found in streams registry. UID is', regUID);
        this.streams = createToolingFunction(regUID, 'streams', streamRegistry);
    }
    /**
     * 
     * @param {string} regUID 
     * @param {function} originalEffect 
     * @returns {(ctx : EffectCtx, next : any) => void}
     */
    static getEffectFunction(regUID, originalEffect) {
        return originalEffect.bind(null, new EffectCtx(regUID));
    }

}

module.exports = EffectCtx;