/**
 * @module toolingEvents
 */

/**
 * @typedef {import('../view/ComponentView.js').ComponentView} ComponentView
 * @typedef {import('../reactivity/Stream.js').default<unknown>} Stream
 * @typedef {import('../component/Component.js').ComponentBase} Component
 * @typedef {import('../DOM/Factories.js').HTMLCustomElement} HTMLCustomElement
 */
import {ComponentError } from '../error/Error.js';
import {Logger} from '../log/Logger.js';
import registries from '../Registries.js';

/** @param {unknown[]} values */
function stringify(...values) {
    let ret = '';
    values.forEach((value) => {
        if (value instanceof Function)
            ret += `${value.toString()}, `;
        else {
            try {
                ret += `${JSON.stringify(value)}, `;
            }
            catch (e) {}
        }
    });
    return ret;
}

class BaseToolingEvent {
    /** @type {string} */
    static objectType = 'BaseToolingEvent';
    /** @type {string} */
    regUID;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        this.regUID = regUID;
        this.prop = prop;
        this.values = values;
        this.component = registries.component.get(regUID);
        /* @debug-build */
        if (!this.component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
    }
    toString() {
        return '';   
    }
    warning() {
        return;   
    }
}

/** @template {keyof HTMLElementTagNameMap} K */
class ElementAccessEvent extends BaseToolingEvent {
    /** @type {string} */
    static objectType = 'BaseToolingEvent';
    /** @type {HTMLElement} */
    element;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        super(regUID, prop, ...values);
        this.element = this.component.view.node;
    }
    toString() {
        return `element-${this.regUID}-${this.element.nodeName}-${this.prop}-${stringify(this.values)}`;   
    }
    warning() {
        /* @debug-build */
        Logger.debugWarn(this.component, 'Direct access to DOM elements should be prohibited. nodeName is', this.element.nodeName);   
    }
}

// class ShadowRootAccessEvent extends BaseToolingEvent {
//     /** @type {HTMLElement|ShadowRoot} */
//     shadowRoot;
//     /** @param {string} regUID */
//     constructor(regUID) {
//         super(regUID);
//         const component = registries.component.get(regUID);
//         /* @debug-build */
//         if (!component)
//             throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
//         this.shadowRoot = component.viewRef.wrappingNode;
//     }
//     toString() {
//         return '';   
//     }
// }

class ViewStrategyAccessEvent extends BaseToolingEvent {
    /** @type {string} */
    static objectType = 'ViewStrategyAccessEvent';
    /** @type {ComponentView} */
    view;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        super(regUID, prop, ...values);
        this.view = this.component.view;
    }
    toString() {
        return `view-strategy-${this.regUID}-${this.prop}-${stringify(this.values)}`;   
    }
}

class ViewAccessEvent extends BaseToolingEvent {
    /** @type {string} */
    static objectType = 'ViewAccessEvent';
    /** @type {ComponentView} */
    view;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        super(regUID, prop, ...values);
        this.view = this.component.view;
    }
    toString() {
        return `view-${this.regUID}-${this.prop}-${stringify(this.values)}`;   
    }
}

class SubViewsAccessEvent extends BaseToolingEvent {
    /** @type {string} */
    static objectType = 'SubViewsAccessEvent';
    /** @type {ComponentView[]} */
    subViews;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        super(regUID, prop, ...values);
        this.subViews = this.component.subViews;
    }
    toString() {
        return `subView-${this.regUID}-${this.prop}`;   
    }
}

class MemberViewsAccessEvent extends BaseToolingEvent {
    /** @type {string} */
    static objectType = 'MemberViewsAccessEvent';
    /** @type {ComponentView[]} */
    memberViews;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        super(regUID, prop, ...values);
        this.memberViews = this.component.memberViews;
    }
    toString() {
        return `memberView-${this.regUID}-${this.prop}`;   
    }
}

class StreamAccessEvent extends BaseToolingEvent {
    /** @type {string} */
    static objectType = 'StreamAccessEvent';
    /** @type {Stream} */
    stream;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        super(regUID, prop, ...values);
        const streamRegistry = registries.streams.get(regUID);
        if (!streamRegistry)
            throw new Error('Logging error: streams not found in registry for UID: ' + regUID);
        let stream;
        if (!(stream = streamRegistry.get(prop)))
            throw new Error('Logging error: stream not found in registry for UID: ' + regUID + '& name: ' + prop);
        this.stream = stream;

    }
    toString() {
        return `stream-${this.regUID}-${this.stream.name}-${this.prop}-${stringify(this.values)}`;   
    }
}

const element = ElementAccessEvent;
// const shadowRoot = ShadowRootAccessEvent,
const view = ViewAccessEvent;
const viewStrategy = ViewStrategyAccessEvent;
const subViews = SubViewsAccessEvent;
const memberViews = MemberViewsAccessEvent;
const streams = StreamAccessEvent;

export {
    BaseToolingEvent,
    element,
    // shadowRoot,
    view,
    viewStrategy,
    subViews,
    memberViews,
    streams,
}

const exports = {
    BaseToolingEvent,
    element,
    // shadowRoot,
    view,
    viewStrategy,
    subViews,
    memberViews,
    streams,
}

export default exports