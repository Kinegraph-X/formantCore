/**
 * @module ComponentFactory
 */

/**
 * @typedef {import('../template/TemplateFactory').ComponentTemplate} ComponentTemplate 
 */

import {ComponentError } from '../error/Error.js';
import registries from '../Registries.js';
import { RootComponent } from './Component.js';
import { Component } from './Component.js';
import TemplateReconcilier from './TemplateReconcilier.js';
import ViewFactory from '../view/ViewFactory.js';
/** @ts-ignore Virtual modules can't be statically resolved */
import {componentTypes} from 'virtual:auto-import.js'
const knownTypes = Object.assign(componentTypes, {RootComponent, Component});

class ComponentFactory {
    constructor() {
        throw new Error("ComponentFactory is static-only; do not instantiate.");
    }
    /**
     * 
     * @param {ComponentTemplate} cTemplate 
     * @param {Component} parentComponent 
     * @returns {Component}
     */
    static newComponent(cTemplate, parentComponent) {
        let newComponent, view;
        if (cTemplate.type) {
            if (cTemplate.type in knownTypes) {
                const {template} = TemplateReconcilier.reconcile(
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
            const {template} = TemplateReconcilier.reconcile(
                    Component.createDefaultDef,
                    cTemplate,
                    Component.objectType
                );
            view = ViewFactory.newView(template.view, parentComponent.view, template.UID)
            newComponent = new Component(parentComponent, template, view);
        }

        registries.component.set(newComponent.regUID, newComponent);
        return newComponent;
    }
}

export default ComponentFactory;