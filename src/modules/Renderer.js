/**
 * @module Orchestrator
 */
import registries from './Registries';
import {ComponentTemplate} from './template/TemplateFactory';
import {ListDefinition} from './template/TemplateFactory';
import ViewsRender from './view/ViewsRenderer';
const renderDOM = ViewsRender.renderDOM;
import ComponentFactory from './component/ComponentFactory';
import ListBinder from './reactivity/ListBinder';
const bindListItem = ListBinder.bindListItem;
import StreamCreator from './reactivity/StreamCreator';
const createStreams = StreamCreator.createStreams;
import ReactivityBinder from './reactivity/ReactivityBinder';
const bindReactivity = ReactivityBinder.bindReactivity;

class Orchestrator {
    constructor() {
        throw new Error("Orchestrator is static-only; do not instantiate.");
    }
    /**
     * @param {ComponentWithView|RootComponent} parentComponent
     * @param {ComponentTemplate} cTemplate 
     */
    static processTemplate(parentComponent, cTemplate) {
        ComponentFactory.process(parentComponent, cTemplate);
        renderDOM();
        registries.component.forEach((component) => {
            createStreams(component);
            bindReactivity(component);
        });
        registries.component.length = 0;
    }
    /**
     * @param {ComponentWithView|RootComponent} parentComponent
     * @param {ListDefinition} listTemplate 
     */
    static processList(parentComponent, listTemplate) {
        const cTemplate = new ComponentTemplate();
        listTemplate.each.forEach((dataEntry) => {
            cTemplate.members.push(listTemplate.template);
        })
        ComponentFactory.process(parentComponent, cTemplate);
        renderDOM();
        let listCounter = 0;
        registries.component.forEach((component) => {
            createStreams(component);
            bindReactivity(component);
            if (component._templateUID === listTemplate.template.UID) {
                bindListItem(component, listTemplate.each[listCounter]);
                listCounter++;
            }
        });
        registries.component.length = 0;
    }
}

export default Orchestrator;