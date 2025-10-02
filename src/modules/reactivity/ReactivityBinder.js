/**
 * @module ReactivityBinder
 */

/**
 * @typedef {import('../template/TemplateFactory').ReactivityQuery} ReactivityQuery 
 * @typedef {import('../template/TemplateFactory').EventSubscription} EventSubscription 
 * @typedef {import('../reactivity/Stream')<unknown>} Stream 
 * @typedef {import('../component/Component').ComponentWithView} ComponentWithView
 */

import {ComponentError} from '../error/Error';
import {EventEmitter} from '../reactivity/EventEmitter';
import registries from '../Registries';
import EffectCtx from '../reactivity/EffectCtx';

class ReactivityBinder {
    constructor() {
        throw new Error("ReactivityBinder is static-only; do not instantiate.");
    }
    /**
     * @param {string} regUID 
     */
    static bindReactivity(regUID) {
        const component = registries.component.get(regUID);
        if (!component)
            throw new ComponentError(this, 'Component not found in registry. regUID is', regUID);
        this.bindReactOnParent(component, regUID);
        this.bindReactOnSelf(component, regUID);
        this.bindSubscribeOnSelf(component, regUID);
        this.bindSubscribeOnChild(component, regUID);
    }
    /**
     * @param {ComponentWithView} component 
     * @param {string} regUID 
     */
    static bindReactOnParent(component, regUID) {
        registries.reactOnParent.get(regUID)?.forEach((reactivityQuery) => {
            this.bindReactOnUpStream(component, reactivityQuery);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {ReactivityQuery} reactivityQuery
     */
    static bindReactOnUpStream(component, reactivityQuery) {
        let upStream, downStream;
        const parentRegUID = component.parent.regUID;
        const regUID = component.regUID;
        
        if (typeof (upStream = registries.streams.get(parentRegUID)?.get(reactivityQuery.from)) === 'undefined')
                throw new ComponentError(component, 'Missing stream on parent component.', reactivityQuery.from);

        if (reactivityQuery.effect) { 
            upStream.subscribe(
                null,
                EffectCtx.getEffectFunction(regUID, reactivityQuery.effect)
            );
        }
        else {
            if (!reactivityQuery.to)
                throw new ComponentError(component, 'Neither "effect" nor "to" property on reactOn definition.', reactivityQuery);
            if (typeof (downStream = registries.streams.get(regUID)?.get(reactivityQuery.to)) === 'undefined')
                throw new ComponentError(component, 'Missing stream on component.', reactivityQuery.to);
            
            const newSubscription = upStream.subscribe(
                downStream,
                null
            );
            newSubscription.createFilter(reactivityQuery.filter);
            newSubscription.createMap(reactivityQuery.map);
        }
    }
    /**
     * @param {ComponentWithView} component 
     * @param {string} regUID 
     */
    static bindReactOnSelf(component, regUID) {
        registries.reactOnParent.get(regUID)?.forEach((reactivityQuery) => {
            this.bindReactOnSelfStream(component, reactivityQuery);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {ReactivityQuery} reactivityQuery
     */
    static bindReactOnSelfStream(component, reactivityQuery) {
        let stream, targetStream;
        const regUID = component.regUID;
        if (typeof (stream = registries.streams.get(regUID)?.get(reactivityQuery.from)) === 'undefined')
            throw new ComponentError(component, 'Missing stream on component.', reactivityQuery.from);
        
        if (reactivityQuery.effect) {  
            stream.subscribe(
                null,
                EffectCtx.getEffectFunction(regUID, reactivityQuery.effect)
            );
        }
        else {
            if (!reactivityQuery.to)
                throw new ComponentError(component, 'Neither "effect" nor "to" property on reactOn definition.', reactivityQuery);
            if (typeof (targetStream = registries.streams.get(regUID)?.get(reactivityQuery.to)) === 'undefined')
                throw new ComponentError(component, 'Missing stream on component.', reactivityQuery.to);
            
            const newSubscription = stream.subscribe(
                targetStream,
                null
            );
            newSubscription.createFilter(reactivityQuery.filter);
            newSubscription.createMap(reactivityQuery.map);
        }
    }

    /**
     * @param {ComponentWithView} component 
     * @param {string} regUID 
     */
    static bindSubscribeOnSelf(component, regUID) {
        registries.subscribeOnSelf.get(regUID)?.forEach((eventSubscription) => {
            this.bindSubscribeOnSelfStream(component, eventSubscription);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {EventSubscription} eventSubscription
     */
    static bindSubscribeOnSelfStream(component, eventSubscription) {
        if (!component[/** @type {keyof ComponentWithView} */ (eventSubscription.on)])
            throw new ComponentError(component, 'Missing event on component.', eventSubscription.on);
        component[/** @type {keyof ComponentWithView} */ (eventSubscription.on)].addEventListener(eventSubscription.subscribe.bind(component));
    }

    /**
     * @param {ComponentWithView} component 
     * @param {string} regUID 
     */
    static bindSubscribeOnChild(component, regUID) {
        registries.subscribeOnChild.get(regUID)?.forEach((eventSubscription) => {
            this.bindSubscribeOnDownStream(/** @type {ComponentWithView} */ (component.parent), eventSubscription);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {EventSubscription} eventSubscription
     */
    static bindSubscribeOnDownStream(component, eventSubscription) {
        component.children.forEach((child) => {
            if (!(child[/** @type {keyof ComponentWithView} */ (eventSubscription.on)] instanceof EventEmitter))
                throw new ComponentError(child, 'Missing event emitter on component.', eventSubscription.on);
            
            child[/** @type {keyof ComponentWithView} */ (eventSubscription.on)].addEventListener(eventSubscription.subscribe);
        });
    }
}

export default ReactivityBinder;