/**
 * @module StreamCtxProvider
 */

/**
 * @typedef {import('src/coreTest/CoreTypes.js').stdTagName|string} tagName
 */

/**
 * @typedef {import('../view/ComponentView').ComponentView<tagName>} ComponentView
 * @typedef {import('../reactivity/Stream.js').Stream<unknown>} Stream
 */
import ComponentError from '../error/Error';
import registries from '../Registries';
import createToolingFunction from '../tooling/toolingFunction';

/**
 * template {string} tagName
*/
class EffectCtx {
    /** @type {() => ComponentView} */
    view;
    /** @type {() => ComponentView[]} */
    subViews;
    /** @type {() => ComponentView[]} */
    memberViews;
    // /** @type {() => HTMLElement} */
    element;
    /** @type {() => Map<string, Stream<any>} */
    streams;
    /**
     * @param {string} regUID 
     */
    constructor(regUID) {
        const component = registries.component.get(regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        
        this.element = createToolingFunction(regUID, 'element', component.view.node);
        
        this.view = createToolingFunction(regUID, 'view', component.view);
        
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

export default EffectCtx;