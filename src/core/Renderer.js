/**
 * @module Orchestrator
 */
const registries = require('src/coreTest/Registries');
const {ComponentTemplate} = require('src/coreTest/TemplateFactory');
const {ListDefinition} = require('src/coreTest/TemplateFactory');
const {renderDOM} = require('src/coreTest/ViewsRenderer');
const ComponentFactory = require('src/coreTest/ComponentFactory');
const {bindListItem} = require('src/coreTest/ListBinder');
const {createStreams} = require('src/coreTest/StreamCreator');
const {bindReactivity} = require('src/coreTest/ReactivityBinder');

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