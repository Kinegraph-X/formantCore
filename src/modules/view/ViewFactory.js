/**
 * @module ViewFactory
 */

/**
 * @typedef {import('../template/TemplateFactory').ViewTemplate} ViewTemplate
 * @typedef {import('../component/Component').Component} Component
 * @typedef {import('./ComponentView').RootComponentView} RootComponentView
 */
import {ComponentView} from './ComponentView';
import CachedNode from '../DOM/CachedNode';
import registries from '../Registries';

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
        registries.attribute.set(vTemplate.UID, vTemplate.attributes);

        const newView = new ComponentView(vTemplate, parentView, regUID);
        registries.views.push(newView);

        if (!registries.node.get(vTemplate.UID))
			registries.node.set(vTemplate.UID, (new CachedNode(vTemplate.nodeName, vTemplate.isCustomElem)));

        return newView;
    }
}

export default ViewFactory;