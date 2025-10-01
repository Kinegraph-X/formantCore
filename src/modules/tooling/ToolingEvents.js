/**
 * @module toolingEvents
 */

/**
 * @typedef {import('../view/ComponentView.js').ComponentView} ComponentView
 * @typedef {import('../reactivity/Stream.js').Stream<unknown>} Stream
 * @typedef {import('../component/Component.js').ComponentWithView} ComponentWithView
 * @typedef {import('../DOM/Factories.js').HTMLCustomElement} HTMLCustomElement
 */
import {Logger, ComponentError} from 'src/coreTest/Error&Log';
import registries from 'src/coreTest/Registries';

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
    /** @type {HTMLElementTagNameMap[K]|HTMLCustomElement} */
    element;
    /** @type {ComponentWithView} */
    component;
    /** 
     * @param {string} regUID
     * @param {string} prop
     * @param {any[]} values
     */
    constructor(regUID, prop, ...values) {
        super(regUID, prop, ...values);
        this.element = this.component.viewRef.node;
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
        this.view = this.component.viewRef;
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
        this.view = this.component.viewRef;
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
        this.stream = streamRegistry[prop];
    }
    toString() {
        return `stream-${this.regUID}-${this.prop}-${stringify(this.values)}`;   
    }
}

export default {
    element : ElementAccessEvent,
    shadowRoot : ShadowRootAccessEvent,
    view : ViewAccessEvent,
    viewStrategy : ViewStrategyAccessEvent,
    subViews : SubViewsAccessEvent,
    memberViews : MemberViewsAccessEvent,
    streams : StreamAccessEvent,
}