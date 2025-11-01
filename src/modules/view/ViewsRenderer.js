/**
 * @module Renderer
 */

/**
 * @typedef {import('./ComponentView').ComponentView<string>} ComponentView
 * @typedef {import('./ComponentView').RootComponentView} RootComponentView
 */
import {ComponentError} from '../error/Error';
import {camelToHyphens} from '../nativeTypesUtilities/StringUtilities';
import ElementFactory from '../DOM/ElementFactory';
const createElement = ElementFactory.createElement;
const createCustomElement = ElementFactory.createElement;
import { EventEmitter } from '../reactivity/EventEmitter';
import { 
  getState, 
  getStreams, 
  getComponent, 
  getDomListens,
  getNode,
  getAttribute
} from '../registryAccessors';

class Renderer {
    static objectType = 'ViewsRenderer';

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
            view.parentView.wrappingNode.append(view.node);
        });
        views.length = 0;
    }
    /**
     * @param {RootComponentView|ComponentView} view 
     */
    static getNode(view) {
        const cachedNode = nodes.get(view.viewUID);
        if (process.env.NODE_ENV === 'development') {
            if (!cachedNode)
                throw new ComponentError(this, 'Unknown View instanciation error: Unable to retrieve a node from the cache', view);
        }

        if (cachedNode.cloneMother) {
            view.node = cachedNode.cloneMother.cloneNode(true);
            return null;
        }
        else {
            if (view.isCustomElem) {
                cachedNode.cloneMother = createCustomElement(
                    cachedNode.nodeName,
                    getState(view.regUID),
                    getStreams(view.regUID)
                );
            }
            else {
                cachedNode.cloneMother = createElement(
                    cachedNode.nodeName,
                    getState(view.regUID),
                    getStreams(view.regUID)
                );
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
                if (tplAttr.getName() === 'textContent' && view.isShadowHost())
                    console.warn('DOM rendering shall fail: textContent on a DOM custom-element shall be appended outside of the shadowRoot. nodeName is ' + view.nodeName + ' & _defUID is ' + view._defUID + '. Consider using a reactive prop instead. For example, the SimpleText Component can handle that case.')
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
        if (process.env.NODE_ENV === 'development') {
            if (!component)
                throw new ComponentError(this, 'Component not found in registry. Unknown error');
        }

        const domListens = getDomListens(view.regUID);
        for (const eventType in domListens) {
            if (!component.hasOwnProperty(domListens[eventType]))
                throw new ComponentError(component, 'A view is listening to a DOM event without a handler being defined on the component. View is ', view, 'Component is ', component);

            const handler = EventEmitter.getDOMTriggerFunction(component, component[domListens[eventType]]);
            view.node.addEventListener(eventType, handler);
        }   

    }
}

export default Renderer;