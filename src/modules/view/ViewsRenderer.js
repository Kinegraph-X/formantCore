/**
 * @module Renderer
 */

/**
 * @typedef {import('./ComponentView').ComponentView} ComponentView
 * @typedef {import('./ComponentView').RootComponentView} RootComponentView
 */
import {ComponentError} from '../error/Error';
import {camelToHyphens} from '../nativeTypesUtilities/StringUtilities';
import elementFactories from '../DOM/Factories';
import {createElement, createCustomElement} from '../DOM/ElementFactory';
import registries from '../Registries';
import { EventEmitter } from '../reactivity/EventEmitter';
const views = registries.views;
const nodes = registries.node;
const attributesCache = registries.attribute;

class Renderer {
    constructor() {
        throw new Error("Renderer is static-only; do not instantiate.");
    }
    /**
     * @param {RootComponentView} view 
     */
    static renderRoot(view) {
        const node = this.getNode(view);
        this.setAttributes(view, node);
        this.setStyle(view);
    }

    static renderDOM() {
        views.forEach((view, key) => {
            let node;
            if ((node = this.getNode(view)))
                this.setAttributes(view, node);
            this.setStyle(view);
            this.bindDomEvents(view);
            view.parentView.wrappingNode.append(view.masterNode);
        });
        views.length = 0;
    }
    /**
     * @param {RootComponentView|ComponentView} view 
     */
    static getNode(view) {
        const cachedNode = nodes.get(view.viewUID);
        /* @debug-build */
        if (!cachedNode)
            throw new ComponentError(this, 'Unknown View instanciation error: Unable to retrieve a node from the cache', view);
        if (cachedNode.cloneMother) {
            view.node = cachedNode.cloneMother.cloneNode(true);
            view.factoryType = elementFactories[cachedNode.nodeName];
            return null;
        }
        else {
            if (view.isCustomElem) {
                cachedNode.cloneMother = createCustomElement(cachedNode.nodeName, registries.state.get(view.regUID), registries.streams.get(view.regUID));
                view.factoryType = elementFactories['customElement'];
            }
            else {
                cachedNode.cloneMother = createElement(/** @type {keyof HTMLElementTagNameMap} */ (cachedNode.nodeName));
                view.factoryType = elementFactories[cachedNode.nodeName];
            }
            view.node = cachedNode.cloneMother.cloneNode(true);
        }
        
        return cachedNode.cloneMother;
    }
    /**
     * @param {RootComponentView|ComponentView} view
     * @param {HTMLElement} node
     */
    static setAttributes(view, node) {
        attributesCache.get(view.viewUID)?.forEach((tplAttr) => {
            if (tplAttr.getName().indexOf('aria') === 0)
					node.setAttribute(camelToHyphens(tplAttr.getName()), tplAttr.getValue());
            else {
                if (tplAttr.getName() === 'textContent' && view.callCurrentViewAPI('isShadowHost'))
                    console.warn('DOM rendering shall fail: textContent on a DOM custom-element shall be appended outside of the shadowRoot. nodeName is ' + view.currentViewAPI.nodeName + ' & _defUID is ' + view._defUID + '. Consider using a reactive prop instead. For example, the SimpleText Component can handle that case.')
                node[tplAttr.getName()] = tplAttr.getValue();
            }
        })
    }
    /**
     * @param {RootComponentView|ComponentView} view 
     */
    static setStyle(view) {
        // view.callCurrentViewAPI('getWrappingNode').append(view.styleHook.s.getStyleNode());
    }

    /**
     * @param {ComponentView} view 
     */
    static bindDomEvents(view) {
        const component = registries.component.get(view.regUID);
        /* @debug-build */
        if (!component)
            throw new ComponentError(null, 'Component not found in registry. Unknown error');

        const domListens = registries.domListens.get(view.regUID);
        if (!domListens)
            return;
        for (const eventType in domListens) {
            if (!component.hasOwnProperty(domListens[eventType]))
                throw new ComponentError(component, 'A view is listening to a DOM event without a handler being defined on the component. View is ', view, 'Component is ', component);

            const handler = EventEmitter.getDOMTriggerFunction(component, component[domListens[eventType]]);
            view.masterNode.addEventListener(eventType, handler);
        }   

    }
}

export default Renderer;