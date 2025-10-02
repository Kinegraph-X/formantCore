/**
 * @module Orchestrator
 */

/**
 * @typedef {import('./component/Component').RootComponent} RootComponent
 * @typedef {import('./component/Component').ComponentWithView} ComponentWithView
 */

import {ComponentError} from './error/Error';
import registries from './Registries';
import {ComponentTemplate, ListTemplate} from './template/TemplateFactory';
import ViewsRender from './view/ViewsRenderer';
const renderDOM = ViewsRender.renderDOM;
import ComponentCreator from './component/ComponentsCreator';
import ListBinder from './reactivity/ListBinder';
const bindListItem = ListBinder.bindListItem;
import StreamCreator from './reactivity/StreamCreator';
const createStreams = StreamCreator.createStreams;
import ReactivityBinder from './reactivity/ReactivityBinder';
const bindReactivity = ReactivityBinder.bindReactivity;

class Renderer {
    constructor() {
        throw new Error("Orchestrator is static-only; do not instantiate.");
    }
    /**
     * @param {ComponentWithView|RootComponent} parentComponent
     * @param {ComponentTemplate} cTemplate 
     */
    static processTemplate(parentComponent, cTemplate) {
        ComponentCreator.process(parentComponent, cTemplate);
        renderDOM();
        registries.component.forEach((component) => {
            createStreams(component);
            bindReactivity(component.regUID);
        });
        registries.component.clear();
    }
    /**
     * @param {ComponentWithView|RootComponent} parentComponent
     * @param {ListTemplate} listTemplate 
     */
    static processList(parentComponent, listTemplate) {
        if (!listTemplate.template)
            throw new ComponentError(parentComponent, 'A list template is missing a default template. regUID is:', parentComponent.regUID, listTemplate);
        if (!listTemplate.each)
            throw new ComponentError(parentComponent, 'A list template is missing a model on its "each" property. regUID is:', parentComponent.regUID, listTemplate);
        const cTemplate = new ComponentTemplate();
        listTemplate.each.forEach(() => {
            cTemplate.members.push(
                /** @ts-ignore : possibly null, checked above */
                listTemplate.template
            );
        })
        ComponentCreator.process(parentComponent, cTemplate);
        renderDOM();
        let listCounter = 0;
        registries.component.forEach((component) => {
            createStreams(component);
            bindReactivity(component.regUID);
            if (component._templateUID 
                    /** @ts-ignore : possibly null, checked above */
                    === listTemplate.template.UID) {
                bindListItem(
                    component.regUID,
                    /** @ts-ignore : possibly null, checked above */
                    listTemplate.each[listCounter]
                );
                listCounter++;
            }
        });
        registries.component.clear();
    }
}

export default Renderer;