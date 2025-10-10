/**
 * @module decorators
 * These are theoritical TS decorators: decorators are transformed at build time
 */

/**
 * @typedef {import('./component/Component.js').ComponentWithView} ComponentWithView
 * @typedef {import('./template/TemplateFactory.js').ComponentTemplateDef} ComponentTemplateDef
 * @typedef {import('./template/TemplateFactory.js').ViewTemplateDef} ViewTemplateDef
 */

import {ComponentTemplate, ViewTemplate} from './template/TemplateFactory.js';

// /** @param {any} constructor */
// function Component(constructor) {return constructor}

/**
 * @typedef {{ new (...args: any[]): {} }} ctorType 
 */
/**
 * @param {ComponentTemplateDef} options 
 */
function Component(options) {
    /** 
     * @param {any} constructor 
     */
    return (constructor) => {
        if (typeof constructor.createDefaultDef === 'undefined') {
            constructor.createDefaultDef = () => {
                return new ComponentTemplate(options);
            }
        }
        return constructor;
    }
};



/** @param {ViewTemplateDef} options */
function View(options) {
    /** 
     * @param {any} target 
     */
    return  (target) => {
        return new ViewTemplate(options);
    }
}




function Output() {return /** @param {any} target @param {string} propertyName */ (target, propertyName) => {}}
function Imperative() {return /** @param {any} target */ (target) => {}}

export {
    Component,
    View,
    Output,
    Imperative
}