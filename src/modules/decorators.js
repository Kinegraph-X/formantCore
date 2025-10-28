/**
 * @module decorators
 * These are theoritical TS decorators: decorators are transformed at build time
 */

/**
 * typedef {import('./component/Component.js').Component} Component
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
export function ComponentDecorator(options) {
    /** 
     * @param {any} constructor 
     */
    return (constructor) => {
        if (typeof constructor.createDefaultDef === 'undefined') {
            constructor.createDefaultDef = () => {
                return new ComponentTemplate(options);
            }
            constructor.declareOutput = Object.getPrototypeOf(constructor).constructor.declareOutput
        }
        return constructor;
    }
};



/** @param {ViewTemplateDef} options */
export function View(options) {
    /** 
     * @param {any} target 
     */
    return  (target) => {
        return new ViewTemplate(options);
    }
}




export function Output() {return /** @param {any} target @param {string} propertyName */ (target, propertyName) => {}}
export function Imperative() {return /** @param {any} target */ (target) => {}}
