/**
 * @module ReactivityBinder
 */

/**
 * @typedef {import('src/coreTest/TemplateFactory').ReactivityQuery} ReactivityQuery 
 * @typedef {import('src/coreTest/CoreTypes').Stream} Stream 
 * @typedef {import('src/coreTest/Component').ComponentWithView} ComponentWithView
 */

const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const registries = require('src/core/Registries');

class ReactivityBinder {
    constructor() {
        throw new Error("ReactivityBinder is static-only; do not instantiate.");
    }

    bindReactivity() {
        for (let _templateUID in registries.component) {
            const component = registries.component.get(_templateUID);
            bindReactOnParent(component, _templateUID);
            bindReactOnSelf(component, _templateUID);
            bindSubscribeOnSelf(component, _templateUID);
            bindSubscribeOnChild(component, _templateUID);
        }
    }
    /**
     * @param {ComponentWithView} component 
     * @param {string} _templateUID 
     */
    bindReactOnParent(component, _templateUID) {
        registries.reactOnParent.get(_templateUID).forEach((reactivityQuery) => {
            bindReactOnParentStream(component, reactivityQuery);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {ReactivityQuery} reactivityQuery
     */
    bindReactOnParentStream(component, reactivityQuery) {
        let stream;
        if (typeof (stream = component.parent.streams[reactivityQuery.from]) === 'undefined')
            throw new ComponentError(component, 'Missing stream on parent component.', reactivityQuery.from);
        if (reactivityQuery.effect) {  
            stream.subscribe(
                reactivityQuery.effect.bind(component),
                stream
            );
        }
        else {
            if (typeof (stream = component.streams[reactivityQuery.to]) === 'undefined')
                throw new ComponentError(component, 'Missing stream on component.', reactivityQuery.to);
            
            const newSubscription = stream.subscribe(
                null,
                component.streams[reactivityQuery.to]
            );
            newSubscription.createFilter(reactivityQuery.filter, component);
            newSubscription.createMap(reactivityQuery.map, component);
        }
    }
    /**
     * @param {ComponentWithView} component 
     * @param {string} _templateUID 
     */
    bindReactOnSelf(component, _templateUID) {
        registries.reactOnParent.get(_templateUID).forEach((reactivityQuery) => {
            bindReactOnSelfStream(component, reactivityQuery);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {ReactivityQuery} reactivityQuery
     */
    bindReactOnSelfStream(component, reactivityQuery) {
        let stream;
        if (typeof (stream = component.streams[reactivityQuery.from]) === 'undefined')
            throw new ComponentError(component, 'Missing stream on component.', reactivityQuery.from);
        if (reactivityQuery.effect) {  
            stream.subscribe(
                reactivityQuery.effect.bind(component),
                stream
            );
        }
        else {
            if (typeof (stream = component.streams[reactivityQuery.to]) === 'undefined')
                throw new ComponentError(component, 'Missing stream on component.', reactivityQuery.to);
            
            const newSubscription = stream.subscribe(
                null,
                component.streams[reactivityQuery.to]
            );
            newSubscription.createFilter(reactivityQuery.filter, component);
            newSubscription.createMap(reactivityQuery.map, component);
        }
    }

    /**
     * @param {ComponentWithView} component 
     * @param {string} _templateUID 
     */
    bindSubscribeOnSelf(component, _templateUID) {
        registries.subscribeOnSelf.get(_templateUID).forEach((eventSubscription) => {
            bindSubscribeOnSelfStream(component, eventSubscription);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {EventSubscription} eventSubscription
     */
    bindSubscribeOnSelfStream(component, eventSubscription) {
        if (!Array.isArray(component._eventListeners[eventSubscription.on]))
            throw new ComponentError(component, 'Missing event on component.', eventSubscription.on);
        component.addEventListener(eventSubscription.on, eventSubscription.subscribe.bind(component));
    }

    /**
     * @param {ComponentWithView} component 
     * @param {string} _templateUID 
     */
    bindSubscribeOnChild(component, _templateUID) {
        registries.subscribeOnSelf.get(_templateUID).forEach((eventSubscription) => {
            bindSubscribeOnChildStream(component, eventSubscription);
        });
    }
    /**
     * @param {ComponentWithView} component
     * @param {EventSubscription} eventSubscription
     */
    bindSubscribeOnChildStream(component, eventSubscription) {
        component.children.forEach((child) => {
            if (!Array.isArray(child._eventListeners[eventSubscription.on]))
                throw new ComponentError(child, 'Missing event on component.', eventSubscription.on);
            child.addEventListener(eventSubscription.on, eventSubscription.subscribe.bind(component));
        });
    }
}