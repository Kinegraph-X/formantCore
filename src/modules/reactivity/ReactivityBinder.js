/**
 * @module ReactivityBinder
 */

/**
 * @template EventPayload
 */
/**
 * @typedef {import('../template/TemplateFactory').ReactivityQuery} ReactivityQuery 
 * @typedef {import('../template/TemplateFactory').EventSubscription<EventPayload>} EventSubscription 
 * @typedef {import('../reactivity/Stream')<unknown>} Stream 
 * @typedef {import('../component/Component').Component} Component
 */

import {ComponentError} from '../error/Error';
import {EventEmitter} from '../eventEmitter/EventEmitter';
import registries from '../Registries';
import EffectCtx from '../reactivity/EffectCtx';

class ReactivityBinder {
    constructor() {
        throw new Error("ReactivityBinder is static-only; do not instantiate.");
    }
    /**
     * @param {Component} component 
     */
    static bindReactivity(component) {
        const regUID = component.regUID;
        this.bindReactOnParent(component, regUID);
        this.bindReactOnSelf(component, regUID);
        this.bindSubscribeOnSelf(component, regUID);
        this.bindSubscribeOnChild(component, regUID);
    }
    /**
     * @param {Component} component 
     * @param {string} regUID 
     */
    static bindReactOnParent(component, regUID) {
        registries.reactOnParent.get(regUID)?.forEach((reactivityQuery) => {
            this.bindReactOnUpStream(component, reactivityQuery);
        });
    }
    /**
     * @param {Component} component
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
            /* already tested in ReactivityQuery */
            /** @debug-build start */
            if (!reactivityQuery.to)
                throw new ComponentError(component, 'Neither "effect" nor "to" property on reactOn definition.', reactivityQuery);
            /** @debug-build end */
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
     * @param {Component} component 
     * @param {string} regUID 
     */
    static bindReactOnSelf(component, regUID) {
        registries.reactOnParent.get(regUID)?.forEach((reactivityQuery) => {
            this.bindReactOnSelfStream(component, reactivityQuery);
        });
    }
    /**
     * @param {Component} component
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
            /* already tested in ReactivityQuery */
            /** @debug-build start */
            if (!reactivityQuery.to)
                throw new ComponentError(component, 'Neither "effect" nor "to" property on reactOn definition.', reactivityQuery);
            /** @debug-build end */
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
     * @param {Component} component 
     * @param {string} regUID 
     */
    static bindSubscribeOnSelf(component, regUID) {
        registries.subscribeOnSelf.get(regUID)?.forEach((eventSubscription) => {
            this.bindSubscribeOnSelfStream(component, eventSubscription);
        });
    }
    /**
     * @param {Component} component
     * @param {EventSubscription} eventSubscription
     */
    static bindSubscribeOnSelfStream(component, eventSubscription) {
        if (!component[/** @type {keyof Component} */ (eventSubscription.on)])
            throw new ComponentError(component, 'Missing EventEmitter on component.', eventSubscription.on);
        /** @ts-ignore : cannot index, can be null : tested above */
        (component[eventSubscription.on]).addEventListener(eventSubscription.subscribe);
    }

    /**
     * @param {Component} component 
     * @param {string} regUID 
     */
    static bindSubscribeOnChild(component, regUID) {
        registries.subscribeOnChild.get(regUID)?.forEach((eventSubscription) => {
            this.bindSubscribeOnDownStream(/** @type {Component} */ (component.parent), eventSubscription);
        });
    }
    /**
     * @param {Component} component
     * @param {EventSubscription} eventSubscription
     */
    static bindSubscribeOnDownStream(component, eventSubscription) {
        component.children.forEach(
            (child) => {
                if (!(child[/** @type {keyof Component} */ (eventSubscription.on)] instanceof EventEmitter))
                    throw new ComponentError(child, 'Missing EventEmitter on component.', eventSubscription.on);
                /** @ts-ignore : cannot index, can be null : tested above */
                (child[eventSubscription.on]).addEventListener(eventSubscription.subscribe);
            }
        );
    }
}

export default ReactivityBinder;