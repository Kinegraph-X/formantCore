/**
 * @module ViewFactory
 */

/**
 * @typedef {import('src/coreTest/TemplateFactory').ViewTemplate} ViewTemplate
 * @typedef {import('src/coreTest/Component').ComponentWithView} ComponentWithView
 * @typedef {import('src/coreTest/CoreTypes').RootComponentView} RootComponentView
 */
const {ComponentView} = require('src/coreTest/CoreTypes');
const CachedNode = require('src/coreTest/CachedNode');
const registries = require('src/coreTest/Registries');

class ViewFactory {
    constructor() {
        throw new Error("MemberComponentsFactory is static-only; do not instantiate.");
    }
    /**
	 * @param {ViewTemplate} vTemplate
	 * @param {ComponentView|RootComponentView} parentView
	 * @param {string} regUID
	 */
    static newView(vTemplate, parentView, regUID) {
        const newView = new ComponentView(vTemplate, parentView, regUID);
        registries.views.push(newView);

        if (!registries.node.get(vTemplate.UID))
			registries.node.set(vTemplate.UID, (new CachedNode(vTemplate.nodeName, vTemplate.isCustomElem)));

        return newView;
    }
}

module.exports = ViewFactory;