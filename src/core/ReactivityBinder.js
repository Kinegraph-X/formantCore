/**
 * @module ReactivityBinder
 */

/**
 * @typedef {import('src/coreTest/TemplateFactory').ReactivityQuery} ReactivityQuery 
 * @typedef {import('src/coreTest/TemplateFactory').EventSubscription} EventSubscription 
 * @typedef {import('src/coreTest/CoreTypes').Stream<unknown>} Stream 
 * @typedef {import('src/coreTest/Component').ComponentWithView} ComponentWithView
 */

const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const registries = require('src/coreTest/Registries');
const EffectCtx = require('src/coreTest/EffectCtx');

class ReactivityBinder {
    constructor() {
        throw new Error("ReactivityBinder is static-only; do not instantiate.");
    }
    /**
     * @param {string} regUID 
     */
    bindReactivity(regUID) {
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
    bindReactOnParent(component, regUID) {
        registries.reactOnParent.get(regUID)?.forEach((reactivityQuery) => {
            this.bindReactOnupStream(component, reactivityQuery);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {ReactivityQuery} reactivityQuery
     */
    bindReactOnupStream(component, reactivityQuery) {
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
    bindReactOnSelf(component, regUID) {
        registries.reactOnParent.get(regUID)?.forEach((reactivityQuery) => {
            this.bindReactOnSelfStream(component, reactivityQuery);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {ReactivityQuery} reactivityQuery
     */
    bindReactOnSelfStream(component, reactivityQuery) {
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
    bindSubscribeOnSelf(component, regUID) {
        registries.subscribeOnSelf.get(regUID)?.forEach((eventSubscription) => {
            this.bindSubscribeOnSelfStream(component, eventSubscription);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {EventSubscription} eventSubscription
     */
    bindSubscribeOnSelfStream(component, eventSubscription) {
        if (!Array.isArray(component.eventHandlers[eventSubscription.on]))
            throw new ComponentError(component, 'Missing event on component.', eventSubscription.on);
        component.addEventListener(eventSubscription.on, eventSubscription.subscribe.bind(component));
    }

    /**
     * @param {ComponentWithView} component 
     * @param {string} regUID 
     */
    bindSubscribeOnChild(component, regUID) {
        registries.subscribeOnSelf.get(regUID)?.forEach((eventSubscription) => {
            this.bindSubscribeOndownStream(component, eventSubscription);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {EventSubscription} eventSubscription
     */
    bindSubscribeOndownStream(component, eventSubscription) {
        component.children.forEach((child) => {
            if (!Array.isArray(child.eventHandlers[eventSubscription.on]))
                throw new ComponentError(child, 'Missing event on component.', eventSubscription.on);
            child.addEventListener(eventSubscription.on, eventSubscription.subscribe.bind(component));
        });
    }
}