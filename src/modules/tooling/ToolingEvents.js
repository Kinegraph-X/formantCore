/**
 * @module toolingEvents
 */

/**
 * @typedef {import('../view/ComponentView.js').ComponentView} ComponentView
 * @typedef {import('../reactivity/Stream.js').Stream<unknown>} Stream
 * @typedef {import('../component/Component.js').ComponentWithView} ComponentWithView
 */
import {Logger, ComponentError} from 'src/coreTest/Error&Log';
import registries from 'src/coreTest/Registries';

class BaseToolingEvent {
    /** @type {string} */
    regUID;
    /** @param {string} regUID */
    constructor(regUID) {
        this.regUID = regUID;
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
    /** @type {HTMLElementTagNameMap[K]} */
    element;
    /** @type {ComponentWithView} */
    component;
    /** @param {string} regUID */
    constructor(regUID) {
        super(regUID);
        const component = registries.component.get(regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        this.element = component.view.node;
        this.component = component;
    }
    toString() {
        return '';   
    }
    warning() {
        /* @debug-build */
        Logger.debugWarn(this.component, 'Direct access to DOM elements should be prohibited. nodeName is', this.element.nodeName);   
    }
}

class ShadowRootAccessEvent extends BaseToolingEvent {
    /** @type {HTMLElement|ShadowRoot} */
    shadowRoot;
    /** @param {string} regUID */
    constructor(regUID) {
        super(regUID);
        const component = registries.component.get(regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        this.shadowRoot = component.view.wrappingNode;
    }
    toString() {
        return '';   
    }
}

class ViewAccessEvent extends BaseToolingEvent {
    /** @type {ComponentView} */
    view;
    /** @param {string} regUID */
    constructor(regUID) {
        super(regUID);
        const component = registries.component.get(regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        this.view = component.view;
    }
    toString() {
        return '';   
    }
}

class SubViewsAccessEvent extends BaseToolingEvent {
    /** @type {ComponentView[]} */
    subViews;
    /** @param {string} regUID */
    constructor(regUID) {
        super(regUID);
        const component = registries.component.get(regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        this.subViews = component.subViews;
    }
    toString() {
        return '';   
    }
}

class MemberViewsAccessEvent extends BaseToolingEvent {
    /** @type {ComponentView[]} */
    memberViews;
    /** @param {string} regUID */
    constructor(regUID) {
        super(regUID);
        const component = registries.component.get(regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(this, 'Component instance not found in component registry. UID is', regUID);
        this.memberViews = component.memberViews;
    }
    toString() {
        return '';   
    }
}

class StreamsAccessEvent extends BaseToolingEvent {
    /** @type {Map<string, Stream>} */
    streams;
    /** @param {string} regUID */
    constructor(regUID) {
        super(regUID);
        const component = registries.component.get(regUID);
        const streamRegistry = registries.streams.get(regUID);
        /* @debug-build */
        if (!streamRegistry)
            throw new ComponentError(this, 'Component instance not found in streams registry. UID is', regUID);
        this.streams = streamRegistry;
    }
    toString() {
        return '';   
    }
}

export default {
    element : ElementAccessEvent,
    shadowRoot : ShadowRootAccessEvent,
    view : ViewAccessEvent,
    subViews : SubViewsAccessEvent,
    memberViews : MemberViewsAccessEvent,
    streams : StreamsAccessEvent,
}