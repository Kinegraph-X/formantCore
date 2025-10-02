/**
 * @module StreamCtxProvider
 */

/**
 * @template {import('../view/stdTagNameType').stdTagNameType|string} tagName
 */

/**
 * @typedef {import('../DOM/Factories.js').HTMLCustomElement<tagName>} HTMLCustomElement
 * @typedef {import('../view/ComponentView').ComponentView<tagName>} ComponentView
 * @typedef {import('../reactivity/Stream.js')} Stream
 */
import {ComponentError} from '../error/Error';
import registries from '../Registries';
import getToolingProxy from '../tooling/getToolingProxy.js';

/**
 * template {string} tagName
*/
class EffectCtx {
    /** @type {string} */
    static objectType = 'EffectCtx';
    /** @type {ComponentView} */
    view;
    /** @type {ComponentView[]} */
    subViews;
    /** @type {ComponentView[]} */
    memberViews;
    /** @type {HTMLElement} */
    element;
    /** @type {Map<string, Stream>} */
    streams;

    /* @debug-build start */
    /**
     * @param {string} regUID 
     */
    constructor(regUID) {
        const component = registries.component.get(regUID);
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        
        this.element = /** @type {HTMLElement|HTMLCustomElement} */ (getToolingProxy(regUID, 'element', component.view.node));
        this.view = /** @type {ComponentView} */ (getToolingProxy(regUID, 'view', component.view));
        this.subViews = /** @type {ComponentView[]} */ (getToolingProxy(regUID, 'subViews', component.subViews));
        this.memberViews = /** @type {ComponentView[]} */ (getToolingProxy(regUID, 'memberViews', component.memberViews));

        const streamRegistry = registries.streams.get(regUID);
        if (!streamRegistry)
            throw new ComponentError(component, 'EffectCtx: Component instance not found in streams registry. UID is', regUID);

        this.streams = /** @type {Map<string, Stream>} */ (getToolingProxy(regUID, 'streams', streamRegistry));
    }
    /* @debug-build end */

    /* @production-build start
    constructor(regUID) {
        const component = registries.component.get(regUID);
        this.element = component.view.node;
        this.view = component.view;
        this.subViews = component.subViews;
        this.memberViews = component.memberViews;
        this.streams = registries.streams.get(regUID);;
    }
    @production-build end */
    /**
     * 
     * @param {string} regUID 
     * @param {(ctx : EffectCtx) => void} effect
     * @returns {(ctx : EffectCtx) => void}
     */
    static getEffectFunction(regUID, effect) {
        return effect.bind(null, new EffectCtx(regUID));
    }
}

export default EffectCtx;