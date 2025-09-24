/**
 * @module Renderer
 */

/**
 * @typedef {import('src/coreTest/CoreTypes').ComponentView} ComponentView
 */
const {camelToHyphens} = require('src/coreTest/StringUtilities');
const {createElement} = require('src/coreTest/ElementFactory');
const registries = require('src/coreTest/Registries');
const views = registries.views;
const nodes = registries.node;
const attributesCache = registries.attribute;

class Renderer {
    constructor() {
        throw new Error("Renderer is static-only; do not instantiate.");
    }

    static renderDOM() {
        views.forEach((view, key) => {
            const node = this.getNode(view);
            this.setAttributes(view, node);
            this.setStyle(view);
            view.parentView.callCurrentViewAPI('getWrappingNode').append(view.callCurrentViewAPI('getMasterNode'));
        });
        views.length = 0;
    }
    /**
     * @param {ComponentView} view 
     */
    static getNode(view) {
        if (nodes.get(view._viewUID).cloneMother) {
            view.callCurrentViewAPI('setMasterNode', nodes.get(view._defUID).cloneMother.cloneNode(true));
        }
        else {
            nodes.get(view._viewUID).cloneMother = createElement(view.nodeName, view.isCustomElem, registries.state.get(view._viewUID));
        }
        return nodes.get(view._viewUID).cloneMother;
    }
    /**
     * @param {ComponentView} view
     * @param {HTMLElement} node
     */
    static setAttributes(view, node) {
        attributesCache[view._templateUID].forEach((tplAttr) => {
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
     * @param {ComponentView} view 
     */
    static setStyle(view) {
        // view.callCurrentViewAPI('getWrappingNode').append(view.styleHook.s.getStyleNode());
    }
}