/**
 * @module ComponentFactory
 */

/**
 * @typedef {import('../template/TemplateFactory').ComponentTemplate} ComponentTemplate 
 */

import {ComponentError } from '../error/Error.js';
import registries from '../Registries.js';
import { RootComponent, ComponentWithView } from './Component.js';
import TemplateReconcilier from './TemplateReconcilier.js';
import ViewFactory from '../view/ViewFactory.js';
/** @ts-ignore Virtual modules can't be statically resolved */
import {componentTypes} from 'virtual:auto-import.js'
const knownTypes = Object.assign(componentTypes, {RootComponent, ComponentWithView });

class ComponentFactory {
    constructor() {
        throw new Error("ComponentFactory is static-only; do not instantiate.");
    }
    /**
     * 
     * @param {ComponentTemplate} cTemplate 
     * @param {ComponentWithView} parentComponent 
     * @returns {ComponentWithView}
     */
    static newComponent(cTemplate, parentComponent) {
        let newComponent, view;
        if (cTemplate.type) {
            if (cTemplate.type in knownTypes) {
                const {template,
                        cTemplateUID,
                        defaultTemplateUID
                    } = TemplateReconcilier.reconcile(
                            knownTypes[cTemplate.type].createDefaultDef,
                            cTemplate,
                            knownTypes[cTemplate.type].objectType
                        );
                view = ViewFactory.newView(template.view, parentComponent.view, template.UID)
                newComponent = new knownTypes[cTemplate.type](parentComponent, template, view);
            }
            else
                new ComponentError(parentComponent, 'Unknown component type declared in template:', cTemplate.type, cTemplate);
        }
        else {
            const {template,
                    cTemplateUID,
                    defaultTemplateUID
                } = TemplateReconcilier.reconcile(
                        ComponentWithView.createDefaultDef,
                        cTemplate,
                        ComponentWithView.objectType
                    );
            view = ViewFactory.newView(template.view, parentComponent.view, template.UID)
            newComponent = new ComponentWithView(parentComponent, template, view);
        }

        newComponent.view = ViewFactory.newView(cTemplate.view, parentComponent.view, newComponent.regUID)
        registries.component.set(newComponent.regUID, newComponent);

        return newComponent;
    }
}

export default ComponentFactory;