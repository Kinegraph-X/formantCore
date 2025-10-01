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
import getToolingProxy from '../tooling/getToolingProxy.js';

/**
 * template {string} tagName
*/
class EffectCtx {
    /** @type {string} */
    static objectType = 'EffectCtx';
    /** @type {() => ComponentView} */
    view;
    /** @type {() => ComponentView[]} */
    subViews;
    /** @type {() => ComponentView[]} */
    memberViews;
    /** type {() => HTMLElement} */
    element;
    /** @type {() => Map<string, Stream<any>} */
    streams;

    /* @debug-build start */
    /**
     * @param {string} regUID 
     */
    constructor(regUID) {
        const component = registries.component.get(regUID);
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        
        this.element = getToolingProxy(regUID, 'element', component.view.node);
        this.view = getToolingProxy(regUID, 'view', component.view);
        this.subViews = getToolingProxy(regUID, 'subViews', component.subViews);
        this.memberViews = getToolingProxy(regUID, 'memberViews', component.memberViews);

        const streamRegistry = registries.streams.get(regUID);
        if (!streamRegistry)
            throw new ComponentError(component, 'EffectCtx: Component instance not found in streams registry. UID is', regUID);

        this.streams = getToolingProxy(regUID, 'streams', streamRegistry);
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
}

export default EffectCtx;