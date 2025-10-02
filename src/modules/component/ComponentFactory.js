/**
 * @module ComponentFactory
 */

import {ComponentError } from '../error/Error.js';
import registries from '../Registries.js';
import { RootComponent, ComponentWithView } from './Component.js';
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
        let newComponent;
        if (cTemplate.type) {
            if (cTemplate.type in knownTypes)
                (newComponent = new knownTypes[cTemplate.type](parentComponent, cTemplate));
            else
                new ComponentError(parentComponent, 'Unknown component type declared in template:', cTemplate.type, cTemplate);
        }
        else {
            newComponent = new ComponentWithView(parentComponent, subSection)
        }

        newComponent.view = ViewFactory.newView(cTemplate.view, parentComponent.view, newComponent.regUID)
        registries.component.set(newComponent.regUID, newComponent);

        return newComponent;
    }
}

export default ComponentFactory;